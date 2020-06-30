const Customer = require('./Customer')

const dbSource = () => ({
  Customer: new Customer()
});

module.exports = dbSource