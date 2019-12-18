const handleAuthentication = require('../auth/_handle-authentication');

module.exports = async (headers) => {
  const res = await handleAuthentication(headers)
  return {
    ...res,
    headers
  }
};