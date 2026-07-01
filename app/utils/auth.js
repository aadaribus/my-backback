import jsonwebtoken from 'jsonwebtoken';

function getTokenFromRequest(req) {
  return req?.cookies?.jwt || null;
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
