const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

// CSRF defense for cookie-based auth. Browsers attach Origin to state-changing
// cross-origin requests; rejecting unknown origins stops a hostile site from
// performing authenticated actions with the user's cookie. Non-browser clients
// (curl, Postman, server-to-server) send no Origin and are allowed.
const originGuard = (allowedOrigins) => (req, res, next) => {
  if (!MUTATING_METHODS.has(req.method)) {
    return next();
  }

  const origin = req.headers.origin;

  if (origin && !allowedOrigins.includes(origin)) {
    return res
      .status(403)
      .json({ success: false, message: 'Request origin is not allowed' });
  }

  return next();
};

module.exports = originGuard;
