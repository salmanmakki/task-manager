const COOKIE_NAME = 'taskflow_token';

const UNIT_MS = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

const parseDuration = (value) => {
  const match = /^(\d+)\s*([smhd])$/.exec(String(value || '').trim());
  if (!match) {
    return 7 * UNIT_MS.d;
  }
  return Number(match[1]) * UNIT_MS[match[2]];
};

const isProduction = () => process.env.NODE_ENV === 'production';

// Production (Vercel -> Render) is cross-site, so the cookie needs SameSite=None
// and Secure. Locally the Vite proxy keeps everything first-party, so Lax is
// enough and works over plain HTTP.
const cookieOptions = () => ({
  httpOnly: true,
  secure: isProduction(),
  sameSite: isProduction() ? 'none' : 'lax',
  path: '/',
  maxAge: parseDuration(process.env.JWT_EXPIRES_IN),
});

// clearCookie must receive the same attributes (except maxAge) to match.
const clearCookieOptions = () => {
  const { maxAge, ...options } = cookieOptions();
  return options;
};

module.exports = {
  COOKIE_NAME,
  cookieOptions,
  clearCookieOptions,
  parseDuration,
};
