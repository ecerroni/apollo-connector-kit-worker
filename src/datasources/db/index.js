// import { User } from './User';
// import { Role } from './Role';

// export { UserHelper } from './User';
// export const dbSource = db => ({
//   User: User(db),
//   Role: Role(db)
// });

const Customer = require('./Customer')

const dbSource = () => ({
  Customer: new Customer()
});

module.exports = dbSource