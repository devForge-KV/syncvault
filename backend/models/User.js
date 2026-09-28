const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['agency', 'client', 'superadmin'],
      default: 'client',
    },
    companyName: {
      type: String,
      trim: true,
    },
    plan: {
      type: String,
      enum: ['starter', 'agency_pro', 'enterprise'],
      default: 'starter',
    },
    planUpdatedAt: Date,
    avatar: {
      type: String,
      default: 'https://placehold.co/150x150',
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);