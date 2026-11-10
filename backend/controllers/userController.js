const User = require('../models/User');
const { validate } = require('../utils/validate');

const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const PASSWORD_MESSAGE =
  'Password must be at least 8 characters and include a letter and a number';

const profileRules = {
  name: { required: true, min: 2, max: 60, label: 'Full name' },
  email: { required: true, max: 254, email: true, label: 'Email' },
};

const passwordRules = {
  currentPassword: { required: true, trim: false, max: 72, label: 'Current password' },
  newPassword: {
    required: true,
    trim: false,
    max: 72,
    pattern: PASSWORD_PATTERN,
    patternMessage: PASSWORD_MESSAGE,
    label: 'New password',
  },
  confirmPassword: {
    required: true,
    trim: false,
    max: 72,
    label: 'Confirm password',
  },
};

const getProfile = async (req, res) => {
  res.status(200).json({ success: true, data: { user: req.user } });
};

const updateProfile = async (req, res) => {
  const { errors, values } = validate(req.body, profileRules);

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors[0], errors });
  }

  const conflict = await User.findOne({
    email: values.email,
    _id: { $ne: req.user._id },
  });

  if (conflict) {
    return res
      .status(409)
      .json({ success: false, message: 'That email is already in use' });
  }

  req.user.name = values.name;
  req.user.email = values.email;
  await req.user.save();

  return res.status(200).json({
    success: true,
    message: 'Profile updated',
    data: { user: req.user },
  });
};

const changePassword = async (req, res) => {
  const { errors, values } = validate(req.body, passwordRules);

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors[0], errors });
  }

  if (values.newPassword !== values.confirmPassword) {
    return res
      .status(400)
      .json({ success: false, message: 'New passwords do not match' });
  }

  const user = await User.findById(req.user._id).select('+password');
  const matches = await user.matchPassword(values.currentPassword);

  if (!matches) {
    return res
      .status(401)
      .json({ success: false, message: 'Current password is incorrect' });
  }

  if (await user.matchPassword(values.newPassword)) {
    return res.status(400).json({
      success: false,
      message: 'New password must be different from the current password',
    });
  }

  user.password = values.newPassword;
  await user.save();

  return res
    .status(200)
    .json({ success: true, message: 'Password updated successfully' });
};

module.exports = { getProfile, updateProfile, changePassword };
