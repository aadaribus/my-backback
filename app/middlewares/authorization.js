import JsonWebToken from "jsonwebtoken";

function soloAdmin(req, res, next) {
  const usuario = revisarcookie(req);
  if (!usuario) return res.redirect("/");
  if (usuario.role !== "admin") return res.status(403).send("Acceso denegado");
  return next();
}

function soloUsuario(req, res, next) {
  const usuario = revisarcookie(req);
  if (!usuario) return next(); // no logueado, puede ver login/register
  return res.redirect("/home"); // si ya está logueado, redirige a home
}

function soloLogueado(req, res, next) {
  const usuario = revisarcookie(req);
  if (!usuario) return res.redirect("/");
  return next();
}

function revisarcookie(req) {
  try {
    const cookieHeader = req.headers.cookie || "";
    const cookieJWT = cookieHeader
      .split(";")
      .find((cookie) => cookie.trim().startsWith("jwt="));
    if (!cookieJWT) return false;

    const token = cookieJWT.split("=")[1];
    if (!token) return false;

    const decodificada = JsonWebToken.verify(token, process.env.JWT_SECRET);
    return decodificada;
  } catch (error) {
    console.error("Error verificando cookie:", error.message);
    return false;
  }
}

export const methods = {
  soloAdmin,
  soloUsuario,
  soloLogueado
};
