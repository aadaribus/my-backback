import { createHash } from 'crypto';
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

export function getDatabaseUserId(user) {
  if (!user) return null;

  if (user.local_id !== undefined && user.local_id !== null) {
    if (typeof user.local_id === 'number') return user.local_id;
    if (typeof user.local_id === 'string' && /^\d+$/.test(user.local_id)) return Number(user.local_id);
  }

  if (user.id !== undefined && user.id !== null) {
    if (typeof user.id === 'number') return user.id;
    if (typeof user.id === 'string' && /^\d+$/.test(user.id)) return Number(user.id);
  }

  return null;
}

function isValidUUID(value) {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export async function ensureAuthUserUuid(user) {
  if (!user) return null;
  if (isValidUUID(user.id)) return user.id;

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!serviceRoleKey || !supabaseUrl) return null;

  const localId = user.local_id ?? user.id ?? 'local';
  const candidateEmail = (() => {
    const baseEmail = user.email || `${user.username || 'usuario'}@mi-mochila.local`;
    const [localPart, domain] = String(baseEmail).split('@');
    const safeLocalPart = String(localPart || 'usuario').replace(/[^a-z0-9._+-]/gi, '').slice(0, 40) || 'usuario';
    const safeDomain = domain || 'mi-mochila.local';
    return `${safeLocalPart}+legacy-${localId}@${safeDomain}`;
  })();

  const emailToUse = user.email || candidateEmail;

  async function fetchExistingAuthUserByEmail(email) {
    try {
      const response = await fetch(`${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(email)}`, {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`
        }
      });

      if (!response.ok) return null;
      const result = await response.json();
      const authUser = result?.users?.[0] || result?.data?.users?.[0] || null;
      return authUser?.id || null;
    } catch (error) {
      return null;
    }
  }

  try {
    const existingAuthUserId = await fetchExistingAuthUserByEmail(emailToUse);
    if (existingAuthUserId) return existingAuthUserId;

    const response = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`
      },
      body: JSON.stringify({
        email: emailToUse,
        password: 'TempPass123!',
        email_confirm: true,
        user_metadata: {
          source: 'legacy-local',
          local_id: String(localId)
        }
      })
    });

    const contentType = response.headers.get('content-type') || '';
    const result = contentType.includes('application/json') ? await response.json() : await response.text();

    if (response.ok && result?.user?.id) {
      return result.user.id;
    }

    if (result?.error?.code === 'email_exists') {
      return fetchExistingAuthUserByEmail(emailToUse);
    }
  } catch (error) {
    console.warn('[Auth] No se pudo crear el usuario de auth:', error.message || error);
  }

  return null;
}

export function buildStableUserId(value) {
  if (isValidUUID(value)) return value;
  if (typeof value === 'number') return String(value);

  const seed = String(value ?? 'anonymous');
  const hash = createHash('sha256').update(`mi-mochila:${seed}`).digest();
  const bytes = Buffer.from(hash.subarray(0, 16));
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

async function resolveAuthUserId(user) {
  if (!user) return user;
  if (isValidUUID(user.id)) return user;

  let localId = user.local_id ?? user.id ?? null;

  try {
    if (user.email) {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, username, role')
        .eq('email', user.email)
        .maybeSingle();

      if (!error && data?.id) {
        localId = data.id;
      }
    }

    const authUuid = await ensureAuthUserUuid({
      ...user,
      local_id: user.local_id ?? user.id ?? localId,
      id: user.id
    });

    return {
      ...user,
      id: authUuid || buildStableUserId(localId),
      local_id: user.local_id ?? user.id ?? localId,
      username: user.username || user?.username || null,
      role: user.role || null
    };
  } catch (error) {
    console.error('[Auth] Error al resolver UUID del usuario:', error.message || error);
    return { ...user, id: buildStableUserId(localId) };
  }
}

export async function requireAuth(req, res, next) {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ error: 'No autenticado' });

  req.user = await resolveAuthUserId(user);
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  if (!req.user.username && user.username) req.user.username = user.username;
  if (!req.user.email && user.email) req.user.email = user.email;
  if (!req.user.role && user.role) req.user.role = user.role;
  if (!req.user.local_id && user.local_id) req.user.local_id = user.local_id;

  next();
}
