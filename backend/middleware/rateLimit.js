const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler(req, res) {
    res.status(429).json({
      success: false,
      message: 'Too many attempts. Please wait 15 minutes and try again.',
    });
  },
});

module.exports = { authLimiter };
