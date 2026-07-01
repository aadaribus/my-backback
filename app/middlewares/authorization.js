import { getUserFromToken } from '../utils/auth.js';

function soloAdmin(req, res, next) {
  const usuario = getUserFromToken(req);
  if (!usuario) return res.redirect('/');
  if (usuario.role !== 'admin') return res.status(403).send('Acceso denegado');
  return next();
}

function soloUsuario(req, res, next) {
  const usuario = getUserFromToken(req);
  if (!usuario) return next(); // no logueado, puede ver login/register
  return res.redirect('/home'); // si ya está logueado, redirige a home
}

function soloLogueado(req, res, next) {
  const usuario = getUserFromToken(req);
  if (!usuario) return res.redirect('/');
  return next();
}

export const methods = {
  soloAdmin,
  soloUsuario,
  soloLogueado
};
