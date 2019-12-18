const APP = require('../settings/app.json');

const { CONSTANTS: { UNAUTHORIZED = 'Unauthorized!' } = {} } = APP;
const { CONSTANTS: { FORBIDDEN = 'Forbidden' } = {} } = APP;
const { CONSTANTS: { NOT_ALLOWED = 'Not allowed' } = {} } = APP;

module.exports = {
  UNAUTHORIZED,
  FORBIDDEN,
  NOT_ALLOWED
}