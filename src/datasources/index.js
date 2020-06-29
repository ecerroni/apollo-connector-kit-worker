const dbSource = require('./db');
const apiSource = require('./api');

// export { UserHelper } from './db';
console.log('dbSource', dbSource);
const buildSource = {
  db: () => dbSource(),
  api: () => apiSource()
};

module.exports = buildSource