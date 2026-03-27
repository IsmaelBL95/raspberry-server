import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const { Schema, model } = mongoose;

const identitySchema = new Schema(
  {
    nickname: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-zA-Z0-9]+$/
    },
    nicknameCanonical: {
      type: String,
      required: true,
      unique: true
    },
    passwordHash: {
      type: String,
      required: true,
      select: false
    },
    lastLoginAt: {
      type: Date,
      default: null
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
      min: 0
    },
    lockedUntil: {
      type: Date,
      default: null
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },
    birthDate: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'deleted', 'pending'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

// Middleware
identitySchema.pre('validate', function (next) {
  if (this.nickname) {
    this.nicknameCanonical = this.nickname.toLowerCase();
  }
  next();
});

// Métodos de instancia
identitySchema.methods.setPassword = async function (plainPassword) {
  const saltRounds = 12;
  this.passwordHash = await bcrypt.hash(plainPassword, saltRounds);
};

identitySchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

identitySchema.methods.isLocked = function () {
  return Boolean(this.lockedUntil && this.lockedUntil > new Date());
};

// Métodos estáticos
identitySchema.statics.findByNickname = function (nickname) {
  if (typeof nickname !== 'string') {
    return null;
  }

  return this.findOne({
    nicknameCanonical: nickname.toLowerCase()
  }).select('+passwordHash');
};

// Índices
identitySchema.index({ createdAt: -1 });

const Identity = model('Identity', identitySchema);

export default Identity;