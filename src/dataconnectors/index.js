const faunadb = require('faunadb')
console.log('SSSSSSSSSSSSSS', process.env.FAUNA_SECRET);
const q = faunadb.query
const client = new faunadb.Client({ secret: process.env.FAUNA_SECRET || FAUNA_SECRET })


const dbClient = {
  fql: client,
  q,
}

module.exports = dbClient