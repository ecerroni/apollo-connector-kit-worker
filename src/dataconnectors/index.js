const faunadb = require('@snoculars/faunadb')
const { GraphQLClient } = require('graphql-request')

const FAUNA_SECRET = 'fnADflatjdACAPRlHz4zHFaRekRrcGVY6_LwzhBq' // TODO: use cloudflare env

const q = faunadb.query
const client = new faunadb.Client({ secret: FAUNA_SECRET })

const endpoint = 'https://graphql.fauna.com/graphql'

const graphQLClient = new GraphQLClient(endpoint, {
  headers: {
    Authorization: `Bearer ${FAUNA_SECRET}`,
  },
})

const dbClient = {
  fql: client,
  q,
  graphql: graphQLClient
}

module.exports = dbClient