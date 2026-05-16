import 'dotenv/config';
import mongoose from 'mongoose';
import config from '../config/index.js';
import Identity from '../models/identity.model.js';
import Thank from '../models/Thank.js';

const TEST_USERS = [
  { nickname: 'IsmaPadre', firstName: 'Ismael', lastName: 'Benvente Noguera', avatarUrl: 'https://i.pravatar.cc/150?img=11' },
  { nickname: 'EvaMadre', firstName: 'Eva', lastName: 'Linares Arasa', avatarUrl: 'https://i.pravatar.cc/150?img=32' },
  { nickname: 'CarlosDev', firstName: 'Carlos', lastName: 'Dev', avatarUrl: 'https://i.pravatar.cc/150?img=18' },
];

const REASONS = [
  'Gran ayuda con el bug de CSS.',
  'Excelente documentacion de la tarea.',
  'Por el cafe de esta manana.',
  'Gracias por revisar el pull request.',
  'Muy buen soporte durante el despliegue.',
  'Ayuda clave para cerrar el sprint.',
  'Gracias por desbloquear el problema de autenticacion.',
  'Buen trabajo optimizando las consultas.',
  'Gracias por la revision de arquitectura.',
  'Excelente colaboracion en equipo.',
  'Gran apoyo con la configuracion de Nginx.',
  'Gracias por mejorar la experiencia de usuario.',
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(array) {
  return array[randomInt(0, array.length - 1)];
}

function randomTimestampByBucket(index) {
  const now = Date.now();

  if (index < 10) {
    return new Date(now - randomInt(0, 24 * 60 * 60 * 1000));
  }

  if (index < 20) {
    return new Date(now - (2 * 24 * 60 * 60 * 1000) - randomInt(0, 24 * 60 * 60 * 1000));
  }

  return new Date(now - (7 * 24 * 60 * 60 * 1000) - randomInt(0, 2 * 24 * 60 * 60 * 1000));
}

async function ensureMinimumIdentities() {
  let identities = await Identity.find({}).select('_id nickname').lean();

  for (const candidate of TEST_USERS) {
    if (identities.length >= 3) break;

    const existing = await Identity.findOne({ nicknameCanonical: candidate.nickname.toLowerCase() });
    if (existing) {
      identities = await Identity.find({}).select('_id nickname').lean();
      continue;
    }

    const identity = new Identity({
      nickname: candidate.nickname,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      status: 'active',
    });

    await identity.setPassword('Test12345!');
    await identity.save();

    identities = await Identity.find({}).select('_id nickname').lean();
  }

  identities = await Identity.find({}).select('_id nickname').lean();

  if (identities.length < 3) {
    throw new Error('No fue posible garantizar al menos 3 identidades para el seed.');
  }

  return identities;
}

function buildThanks(identities, count = 30) {
  const documents = [];

  for (let i = 0; i < count; i += 1) {
    const fromUser = pickRandom(identities);
    let toUser = pickRandom(identities);

    while (toUser._id.toString() === fromUser._id.toString()) {
      toUser = pickRandom(identities);
    }

    documents.push({
      fromUser: fromUser._id,
      toUser: toUser._id,
      amount: randomInt(1, 5),
      reason: pickRandom(REASONS),
      timestamp: randomTimestampByBucket(i),
    });
  }

  return documents;
}

async function seedThanks({ clean = true } = {}) {
  await mongoose.connect(config.mongoUri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });

  try {
    const identities = await ensureMinimumIdentities();

    if (clean) {
      await Thank.deleteMany({});
    }

    const thanksDocs = buildThanks(identities, 30);
    await Thank.insertMany(thanksDocs);

    console.log(`Seed completado: ${thanksDocs.length} agradecimientos insertados.`);
  } finally {
    await mongoose.disconnect();
  }
}

const shouldClean = process.argv.includes('--no-clean') ? false : true;

seedThanks({ clean: shouldClean })
  .then(() => {
    console.log('Proceso finalizado correctamente.');
  })
  .catch((error) => {
    console.error('Error ejecutando seed de thanks:', error);
    process.exitCode = 1;
  });
