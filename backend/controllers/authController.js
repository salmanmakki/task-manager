const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { validate } = require('../utils/validate');
const {
  COOKIE_NAME,
  cookieOptions,
  clearCookieOptions,
} = require('../utils/cookies');

const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const PASSWORD_MESSAGE =
  'Password must be at least 8 characters and include a letter and a number';

const registerRules = {
  name: { required: true, min: 2, max: 60, label: 'Full name' },
  email: { required: true, max: 254, email: true, label: 'Email' },
  password: {
    required: true,
    trim: false,
    max: 72,
    pattern: PASSWORD_PATTERN,
    patternMessage: PASSWORD_MESSAGE,
    label: 'Password',
  },
  confirmPassword: {
    required: true,
    trim: false,
    max: 72,
    label: 'Confirm password',
  },
};

const loginRules = {
  email: { required: true, max: 254, email: true, label: 'Email' },
  password: { required: true, trim: false, max: 72, label: 'Password' },
};

const issueSession = (res, userId) => {
  res.cookie(COOKIE_NAME, generateToken(userId), cookieOptions());
};

const register = async (req, res) => {
  const { errors, values } = validate(req.body, registerRules);

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors[0], errors });
  }

  if (values.password !== values.confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Passwords do not match',
      errors: ['Passwords do not match'],
    });
  }

  const existing = await User.findOne({ email: values.email });
  if (existing) {
    return res
      .status(409)
      .json({ success: false, message: 'That email is already registered' });
  }

  const user = await User.create({
    name: values.name,
    email: values.email,
    password: values.password,
  });

  issueSession(res, user._id);

  return res.status(201).json({
    success: true,
    message: 'Account created. Welcome to TaskFlow!',
    data: { user },
  });
};

const login = async (req, res) => {
  const { errors, values } = validate(req.body, loginRules);

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors[0], errors });
  }

  const user = await User.findOne({ email: values.email }).select('+password');
  const passwordMatches = user ? await user.matchPassword(values.password) : false;

  if (!user || !passwordMatches) {
    return res
      .status(401)
      .json({ success: false, message: 'Invalid email or password' });
  }

  issueSession(res, user._id);

  return res.status(200).json({
    success: true,
    message: 'Welcome back!',
    data: { user },
  });
};

const getMe = async (req, res) => {
  res.status(200).json({ success: true, data: { user: req.user } });
};

const logout = async (req, res) => {
  res.clearCookie(COOKIE_NAME, clearCookieOptions());
  res.status(200).json({ success: true, message: 'Logged out' });
};

module.exports = { register, login, getMe, logout };
