// src/models/identity.model.js

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
      match: /^[a-zA-Z0-9]+$/ // Solo letras y números
    },

    // Versión normalizada para búsquedas insensibles a mayúsculas/minúsculas
    nicknameCanonical: {
      type: String,
      required: true,
      unique: true
    },

    passwordHash: {
      type: String,
      required: true,
      select: false // Nunca exponer por defecto
    },

    status: {
      type: String,
      enum: ['active', 'suspended', 'deleted'],
      default: 'active'
    },

    // Perfil opcional (NO requerido en registro)
    firstName: {
      type: String,
      trim: true,
      default: null
    },

    lastName: {
      type: String,
      trim: true,
      default: null
    },

    birthDate: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

/**
 * Normaliza nickname antes de validar.
 * Evita duplicados por diferencias de mayúsculas.
 */
identitySchema.pre('validate', function (next) {
  if (this.nickname) {
    this.nickname = this.nickname.trim();
    this.nicknameCanonical = this.nickname.toLowerCase();
  }

  next();
});

/**
 * Hashea contraseña.
 */
identitySchema.methods.setPassword = async function (plainPassword) {
  const saltRounds = 12;
  this.passwordHash = await bcrypt.hash(plainPassword, saltRounds);
};

/**
 * Compara contraseña.
 */
identitySchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

/**
 * Buscar usuario por nickname.
 * Incluye passwordHash porque está oculto por defecto.
 */
identitySchema.statics.findByNickname = function (nickname) {
  if (!nickname) return null;

  return this.findOne({
    nicknameCanonical: nickname.trim().toLowerCase()
  }).select('+passwordHash');
};

const Identity = model('Identity', identitySchema);

export default Identity;