import jsonwebtoken from 'jsonwebtoken';

function getTokenFromRequest(req) {
  if (!req || !req.headers) return null;
  const cookieHeader = req.headers.cookie || '';
  const cookieJWT = cookieHeader
    .split(';')
    .find((cookie) => cookie.trim().startsWith('jwt='));

  if (!cookieJWT) return null;
  const token = cookieJWT.split('=')[1];
  return token || null;
}

export function getUserFromToken(req) {
  if (req && req.user) return req.user;

  try {
    const token = getTokenFromRequest(req);
    if (!token) return null;
    return jsonwebtoken.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function requireAuth(req, res, next) {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ error: 'No autenticado' });
  req.user = user;
  next();
}
