const JWT = require('../config/_jwt');

const setCookies = (res, newToken, newRefreshToken) => {
  res
    .cookie(JWT.COOKIE.TOKEN.NAME, newToken, JWT.COOKIE.TYPE)
    .cookie(JWT.COOKIE.REFRESH_TOKEN.NAME, newRefreshToken, JWT.COOKIE.TYPE);
};

const unsetCookies = response =>
  response
    .clearCookie(JWT.COOKIE.TOKEN.NAME, JWT.COOKIE.TYPE)
    .clearCookie(JWT.COOKIE.REFRESH_TOKEN.NAME, JWT.COOKIE.TYPE);

const setHeaders = (res, newToken, newRefreshToken) => {
  res.push({ [JWT.HEADER.TOKEN.NAME]: newToken })
  res.push({ [JWT.HEADER.REFRESH_TOKEN.NAME]: newRefreshToken });
  return res
};


module.exports = {
  setCookies,
  unsetCookies,
  setHeaders
}