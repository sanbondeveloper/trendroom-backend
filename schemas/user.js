const mongoose = require('mongoose');

const { Schema } = mongoose;
const userSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
    },
    nick: {
      type: String,
      required: true,
    },
    password: {
      type: String,
    },
    provider: {
      type: String,
      require: true,
      enum: ['local', 'kakao', 'apple'],
      default: 'local',
    },
    snsId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
