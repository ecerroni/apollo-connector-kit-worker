// const setCookies = require('../auth/_handle-tokens')
// TODO: MOVE THEM TO ENUMS OR CONFIG
const selectAuthStrategy = require('../auth/_select-auth-strategy')
const { setHeaders } = require('../auth/_handle-headers')
const login = ['login', 'publicRegister'];
const logout = 'logout';

module.exports = ({ response, query }) => {
  const { context } = query;
  // const { req: request } = context;
  const { data } = response;
  const { headers = {} } = context;
  const operationName = data && Object.keys(data)[0];
  if (operationName && operationName === logout) {
    const [httpOnly] = selectAuthStrategy(headers);
    if (httpOnly) {
      // unsetCookies(res);
    }
  }
  if (data && operationName && login.includes(operationName)) {
    if (data[operationName]) {
      const [httpOnly, localStorage] = selectAuthStrategy(headers);
      const { token, refreshToken } = JSON.parse(data[operationName]);
      if (httpOnly) {
        // etCookies(res, token, refreshToken);
      }
      if (localStorage) {
        context.resHeaders = setHeaders(context.resHeaders, token, refreshToken);
      }
    }
  }
  return response;
};
