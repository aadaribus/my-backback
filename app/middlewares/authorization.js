import JsonWebToken from "jsonwebtoken";

function soloAdmin(req, res, next) {
  const logueado = revisarcookie(req);
  if (!logueado) return res.redirect("/");
  return next();
}

function soloUsuario(req, res, next) {
  const logueado = revisarcookie(req);
  if (!logueado) return next();
  return res.redirect("/home");
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
    return false;
  }
}

export const methods = {
  soloAdmin,
  soloUsuario,
};
