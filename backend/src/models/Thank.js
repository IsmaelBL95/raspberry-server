import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const thankSchema = new Schema({
  fromUser: {
    type: Schema.Types.ObjectId,
    ref: 'Identity',
    required: true,
    index: true
  },
  toUser: {
    type: Schema.Types.ObjectId,
    ref: 'Identity',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: 'amount must be an integer between 1 and 5'
    }
  },
  reason: {
    type: String,
    required: true,
    trim: true,
    maxlength: 280
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Thank = model('Thank', thankSchema);

export default Thank;
