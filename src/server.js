const { ApolloServer } = require('apollo-server-cloudflare')
const { graphqlCloudflare } = require('apollo-server-cloudflare/dist/cloudflareApollo')
const { GraphQLExtension } = require('graphql-extensions');
const { HttpLink } = require('apollo-link-http');
const { makeExecutableSchema,  makeRemoteExecutableSchema, introspectSchema, mergeSchemas } = require('graphql-tools')

const schema = require('./schema/index')
const buildContext = require('./graphql/_context')
const buildSource = require('./datasources');
const formatError = require('./graphql/_format-error')
const formatResponse = require('./graphql/_format-response')

const KVCache = require('./kv-cache')
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


const createServer = (graphQLOptions, isDev) => {
  return new ApolloServer({
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
}
// addEventListener('fetch', event => {
//   return event.respondWith(handler(event.request))
// })
const handler = async (request, graphQLOptions, isDev) => {

  // const introspectionResult = await introspectSchema(
  //   new HttpLink({ uri: 'https://graphql.fauna.com/graphql', headers: {
  //     Authorization: `Bearer fnADflatjdACAPRlHz4zHFaRekRrcGVY6_LwzhBq`,
  //   }, fetch })
  // );
  // console.log(1);
  // const remoteSchema = makeRemoteExecutableSchema({
  //   schema: introspectionResult,
  //   link: new HttpLink({ uri: 'https://graphql.fauna.com/graphql', headers: {
  //     Authorization: `Bearer fnADflatjdACAPRlHz4zHFaRekRrcGVY6_LwzhBq`,
  //   }, fetch })
  // });
  // console.log(2);
  const server = createServer(graphQLOptions, isDev)
  return graphqlCloudflare(() => server.createGraphQLServerOptions(request))(request)
}

module.exports = handler
