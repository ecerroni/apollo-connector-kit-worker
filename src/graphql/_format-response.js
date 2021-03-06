const { UNAUTHORIZED, FORBIDDEN } = require('../environment/_authorization');
const selectAuthStrategy = require('../auth/_select-auth-strategy')
const JWT = require('../config/_jwt');
const ROUTES_RESOLVERS = require('../settings/routes-resolvers.json');

const {
  SERVER: {
    RESOLVERS: { WITH_TOKEN_HEADERS: login } = {},
    ROUTES: { LOGOUT: logout } = {}
  } = {}
} = ROUTES_RESOLVERS;

module.exports = ({ response, query }) => {
  const { context } = query;
  const { headers = {}, resHeaders } = context;
  const { data, errors } = response || {};

  const operationName =
    data && Object.keys(data).length ? Object.keys(data)[0] : '';

  const isLogout = operationName && operationName === logout;
  const isLogin = data && operationName && login.includes(operationName);

  const errorStatus = {};
  if (Array.isArray(errors)) {
    if (errors.filter(e => e.message && e.message === UNAUTHORIZED).length > 0)
      errorStatus['401'] = true;
    if (errors.filter(e => e.message && e.message === FORBIDDEN).length > 0)
      errorStatus['403'] = true;
  }

  if (isLogout) {
    const [httpOnly] = selectAuthStrategy(headers);
    if (httpOnly) {
      // unsetCookies(res);
    }
  }
  if (isLogin) {
    if (data[operationName]) {
      const [httpOnly, localStorage] = selectAuthStrategy(headers);
      const { token, refreshToken } = JSON.parse(data[operationName]);
      if (httpOnly) {
        // I want this: https://caolan.uk/articles/multiple-set-cookie-headers-in-node-js/
        // Worker (apollo-server-cloudlfare) does not seem able to do it: https://community.cloudflare.com/t/dont-fold-set-cookie-headers-with-headers-append/165934
        // This is the workaround
        resHeaders.push({ '_Set-Cookie1': JWT.COOKIE.TYPE.buildCookieString(token) });
        resHeaders.push({ '_Set-Cookie2': JWT.COOKIE.TYPE.buildCookieString(refreshToken, true) });
      }
      if (localStorage) {
        resHeaders.push({ [JWT.HEADER.TOKEN.NAME]: token })
        resHeaders.push({ [JWT.HEADER.REFRESH_TOKEN.NAME]: refreshToken })
      }
    }
  }
  if (errorStatus && !isLogin && !isLogout) {
    if (errorStatus['401']) {
      response.status = 401;
      resHeaders.push({ '_status': 401 })
    } else if (errorStatus['403']) {
      response.status = 403;
      resHeaders.push({ '_status': 403 })
    }
  }
  return response;
};