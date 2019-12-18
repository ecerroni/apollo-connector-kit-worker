const dbSource = require('./db');
// import { apiSource } from './api';

// export { UserHelper } from './db';
console.log('dbSource', dbSource);
const buildSource = {
  db: () => dbSource(),
  // api: () => apiSource()
};

module.exports = buildSource