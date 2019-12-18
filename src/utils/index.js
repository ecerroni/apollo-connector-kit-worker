
const QUERY_SETTINGS = require('../settings/queries.json')

const { PRIVATE_PREFIX } = QUERY_SETTINGS;

module.exports.isPrivateOperation = name =>
  name.substring(0, PRIVATE_PREFIX.length) === PRIVATE_PREFIX;