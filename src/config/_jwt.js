const APP = require('../settings/app.json');
const JWT_SETTINGS = require('../settings/jwt.json');
const COOKIE_SETTINGS = require('../settings/cookie.json');
const { refreshTokens } = require('../auth/_handle-tokens');

const {
  TOKEN_EXP = 6 * 60, // 6 minutes (seconds)
  REFRESH_TOKEN_EXP = 7 * 24 * 60 * 60 // 7 days (seconds)
} = JWT_SETTINGS;

const {
  COOKIE_EXP = 365 * 24 * 60 * 60 * 1000 // one year (ms)
} = COOKIE_SETTINGS;

const {
  NAMESPACE = '_',
  PREFIX = '-x',
  TOKEN_SUFFIX = '-token',
  REFRESH_TOKEN_SUFFIX = '-refresh-token'
} = APP;

const TOKEN_NAME = `${PREFIX}${NAMESPACE}${TOKEN_SUFFIX}`;
const REFRESH_TOKEN_NAME = `${PREFIX}${NAMESPACE}${REFRESH_TOKEN_SUFFIX}`;

// YOU MAY NOT CHANGE THESE SETTINGS BELOW
const values = {
  HEADER: {
    TOKEN: {
      NAME: TOKEN_NAME,
      EXP: TOKEN_EXP
    },
    REFRESH_TOKEN: {
      NAME: REFRESH_TOKEN_NAME,
      EXP: REFRESH_TOKEN_EXP
    }
  },
  COOKIE: {
    TOKEN: {
      NAME: TOKEN_NAME,
      EXP: TOKEN_EXP
    },
    REFRESH_TOKEN: {
      NAME: REFRESH_TOKEN_NAME,
      EXP: REFRESH_TOKEN_EXP
    },
    TYPE: {
      maxAge: COOKIE_EXP,
      httpOnly: true,
      // Best cookie atm `Set-Cookie: __Host-sess=123; path=/; Secure; HttpOnly; SameSite`
      // ref: https://scotthelme.co.uk/tough-cookies/
      buildCookieString: (token) => `${TOKEN_NAME}=${token}; Max-Age=${COOKIE_EXP}; httpOnly`
    }
  }
};

module.exports = values