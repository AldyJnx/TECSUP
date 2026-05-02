const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50
    },
    phoneNumber: {
      type: String,
      trim: true,
      match: /^[0-9+\-\s()]{6,20}$/
    },
    birthdate: {
      type: Date
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[\w.+-]+@[\w-]+\.[\w.-]+$/
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    roles: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Role' }
    ],
    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);
