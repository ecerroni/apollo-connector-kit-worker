const faunadb = require('faunadb')
const q = faunadb.query
const client = new faunadb.Client({
  secret: process.env.FAUNA_SECRET || FAUNA_SECRET,
  fetch: fetch.bind(globalThis)
})


const dbClient = {
  fql: client,
  q,
}

module.exports = dbClient