// backend/src/bootstrap.js

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  setBootstrapStatus,
  BootstrapStatus,
} from './state.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Marker de finalización del bootstrap
const BOOTSTRAP_MARKER = path.resolve(__dirname, '../bootstrap.done');

/**
 * Comprueba si el sistema ya está bootstrapped y,
 * si no lo está, ejecuta el proceso de bootstrap.
 *
 * Este módulo ES el único responsable de mutar BootstrapStatus.
 */
export async function startBootstrapIfNeeded() {
  try {
    const alreadyBootstrapped = await markerExists();

    if (alreadyBootstrapped) {
      setBootstrapStatus(BootstrapStatus.DONE);
      return;
    }

    setBootstrapStatus(BootstrapStatus.IN_PROGRESS);

    await runBootstrapTasks();

    await writeMarker();
    setBootstrapStatus(BootstrapStatus.DONE);
  } catch (err) {
    setBootstrapStatus(BootstrapStatus.FAILED);
    throw err;
  }
}

/* =========================
 * Helpers internos
 * ========================= */

async function markerExists() {
  try {
    await fs.access(BOOTSTRAP_MARKER);
    return true;
  } catch (err) {
    if (err?.code === 'ENOENT') return false;
    throw err;
  }
}

async function runBootstrapTasks() {
  // Aquí irán las tareas reales de bootstrap
  // Ejemplos:
  // - migraciones
  // - seeds
  // - creación de recursos iniciales
  //
  // Debe ser idempotente o fallar de forma explícita.

  return;
}

async function writeMarker() {
  const payload = {
    activatedAt: new Date().toISOString(),
  };

  await fs.writeFile(
    BOOTSTRAP_MARKER,
    JSON.stringify(payload, null, 2),
    'utf-8'
  );
}