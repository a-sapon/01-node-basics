const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  avatarURL: String,
  subscription: {
    type: String,
    enum: ["free", "pro", "premium"],
    default: "free"
  },
  token: String,
  otpCode: String,
  registered: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
