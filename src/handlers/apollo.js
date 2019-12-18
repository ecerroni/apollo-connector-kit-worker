const { ApolloServer } = require('apollo-server-cloudflare')
const { graphqlCloudflare } = require('apollo-server-cloudflare/dist/cloudflareApollo')
const { GraphQLExtension } = require('graphql-extensions');

const schema = require('../schema/index')
const buildContext = require('../graphql/_context')
const buildSource = require('../datasources');
const formatError = require('../graphql/_format-error')
const formatResponse = require('../graphql/_format-response')

const KVCache = require('../kv-cache')
// const PokemonAPI = require('../datasources/pokeapi')
// const resolvers = require('../resolvers')
// const typeDefs = require('../schema')
// const schema = require('./schema/index')

class FwdHeadersExtension extends GraphQLExtension {
  willSendResponse(o) {
    const {
      context: { resHeaders = [] },
    } = o;
    // add headers to response
    resHeaders.forEach((item) => {
      const entries = Object.entries(item)
      entries.forEach(entry => {
        o.graphqlResponse.http.headers.append(entry[0], entry[1]);
      })

    });
    return o;
  }
}

const dataSources = () => ({
  // pokemonAPI: new PokemonAPI(),
})

const createServer = (graphQLOptions, isDev) =>
  new ApolloServer({
    schema,
    context: ({ request }) => {
      const rawHeaders = new Map(request.headers)
      const headers = {};

      rawHeaders.forEach(function (value, key) {
        headers[key] = value
      })
      return buildContext(headers)
    },
    extensions: [() => new FwdHeadersExtension()],
    formatError: err => formatError(err),
    formatResponse: (response, query) => formatResponse({ response, query }),
    introspection: true,
    // dataSources,
    dataSources: () => ({
      ...buildSource.db(),
      // ...buildSource.api(),
    }),
    ...(graphQLOptions.kvCache
      ? { cache: new KVCache(isDev) }
      : {}),
  })

const handler = (request, graphQLOptions, isDev) => {
  const server = createServer(graphQLOptions, isDev)
  return graphqlCloudflare(() => server.createGraphQLServerOptions(request))(request)
}

module.exports = handler
