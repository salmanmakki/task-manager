const jwt = require('jsonwebtoken');

const User = require('../models/User');
const { COOKIE_NAME } = require('../utils/cookies');

const extractToken = (req) => {
  if (req.cookies?.[COOKIE_NAME]) {
    return req.cookies[COOKIE_NAME];
  }

  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    return header.slice(7).trim();
  }

  return null;
};

const protect = async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'Session is no longer valid' });
    }

    req.user = user;
    return next();
  } catch {
    return res
      .status(401)
      .json({ success: false, message: 'Session expired. Please log in again.' });
  }
};

module.exports = { protect };
