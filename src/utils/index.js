
const QUERY_SETTINGS = require('../settings/queries.json')
const throwIfError = require('./_throw-error')
const { assignCascadeRoles } = require('./_roles')
const createUserToken = require('./_create-user-token');
const { PRIVATE_PREFIX } = QUERY_SETTINGS;

module.exports = {
  isPrivateOperation: name => name.substring(0, PRIVATE_PREFIX.length) === PRIVATE_PREFIX,
  assignCascadeRoles,
  createUserToken,
  throwIfError
}