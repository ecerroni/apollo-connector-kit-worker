const jwt = require('jsonwebtoken');
const JWT = require('../config/_jwt');
const AUTH = require('../config/_authentication');
const selectAuthStrategy = require('./_select-auth-strategy');
const { refreshTokens } = require('./_handle-tokens');

const getCookie = (src, name) => {
  const value = `; ${src}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2)
    return parts
      .pop()
      .split(';')
      .shift();
  return null;
};

// Inspired by: benawad https://github.com/benawad/slack-clone-server/blob/13_where/index.js
module.exports = async (headers) => {
  const req = {}
  let resHeaders = []
  req.user = undefined;
  req.headers = headers

  let token;
  let refreshToken;

  const [httpOnly, localStorage] = selectAuthStrategy(req.headers);
  if (httpOnly) {
    token = getCookie(req.headers.cookie, JWT.COOKIE.TOKEN.NAME);
    refreshToken = getCookie(req.headers.cookie, JWT.COOKIE.REFRESH_TOKEN.NAME);
    console.log('TOKEN', token);
    console.log('REFRESH_TOKEN', refreshToken);
  }

  if (localStorage) {
    token = req.headers[JWT.HEADER.TOKEN.NAME];
    refreshToken = req.headers[JWT.HEADER.REFRESH_TOKEN.NAME];
  }

  if (token) {
    try {
      const { user } = jwt.verify(token, AUTH.SECRET_TOKEN);
      req.user = user;
    } catch (err) {
      const {
        token: newToken,
        refreshToken: newRefreshToken,
        user
      } = await refreshTokens(refreshToken);
      if (newToken && newRefreshToken) {
        if (httpOnly) {
          // I want this: https://caolan.uk/articles/multiple-set-cookie-headers-in-node-js/
          // Worker (apollo-server-cloudlfare) does not seem able to do it: https://community.cloudflare.com/t/dont-fold-set-cookie-headers-with-headers-append/165934
          // This is the workaround
          resHeaders.push({ '_Set-Cookie1': JWT.COOKIE.TYPE.buildCookieString(newToken) });
          resHeaders.push({ '_Set-Cookie2': JWT.COOKIE.TYPE.buildCookieString(newRefreshToken, true) });
        }
        if (localStorage) {
          resHeaders.push({ [JWT.HEADER.TOKEN.NAME]: newToken});
          resHeaders.push({ [JWT.HEADER.REFRESH_TOKEN.NAME]: newRefreshToken});
        }
      }
      req.user = user;
    }
  }
  return {
    user: req.user,
    resHeaders
  }
};