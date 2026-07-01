import jsonwebtoken from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

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

function isValidUUID(value) {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function hasServiceRoleKey() {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

async function resolveAuthUserId(user) {
  if (!user || isValidUUID(user.id)) return user;
  if (!user.email) return user;
  if (!hasServiceRoleKey()) return user;

  try {
    const { data, error } = await supabase.auth.admin.getUserByEmail(user.email);
    if (error || !data?.user) {
      console.warn('[Auth] No se encontró un auth user UUID para', user.email, error?.message || '');
      return user;
    }

    return { ...user, id: data.user.id };
  } catch (error) {
    console.error('[Auth] Error al resolver UUID del usuario:', error.message || error);
    return user;
  }
}

export async function requireAuth(req, res, next) {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ error: 'No autenticado' });

  if (!isValidUUID(user.id) && !hasServiceRoleKey()) {
    return res.status(401).json({
      error: 'Token de usuario sin UUID. Configura SUPABASE_SERVICE_ROLE_KEY en el entorno para resolver el UUID de auth.users.'
    });
  }

  req.user = await resolveAuthUserId(user);
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  if (!isValidUUID(req.user.id)) {
    return res.status(401).json({
      error: 'No se pudo resolver el UUID del usuario. Revisa SUPABASE_SERVICE_ROLE_KEY y el usuario en Supabase Auth.'
    });
  }

  next();
}
