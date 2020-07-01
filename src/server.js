const { ApolloServer } = require('apollo-server-cloudflare')
const { graphqlCloudflare } = require('apollo-server-cloudflare/dist/cloudflareApollo')

const schema = require('./schema/index')
const buildContext = require('./graphql/_context')
const buildSource = require('./datasources');
const formatError = require('./graphql/_format-error')
const formatResponse = require('./graphql/_format-response')

const KVCache = require('./kv-cache');
const { UNAUTHORIZED, FORBIDDEN } = require('./environment/_authorization');
// const PokemonAPI = require('./datasources/pokeapi')

// class FwdHeadersExtension extends GraphQLExtension {
//   willSendResponse(o) {
//     const {
//       context: { resHeaders = [] },
//     } = o;
//     console.log('HHHHHHHHHHHHHHHHHHHHHH');
//     console.log('responseWill', Object.keys(o.graphqlResponse), o.response, o.graphqlResponse && o.graphqlResponse.http && o.graphqlResponse.http.status);
//     // add headers to response
//     resHeaders.forEach((item) => {
//       console.log('rs header', item);
//       const entries = Object.entries(item)
//       entries.forEach(entry => {
//         if (o.graphqlResponse && o.graphqlResponse.http) o.graphqlResponse.http.headers.append(entry[0], entry[1]);
//       })
//     });
//     return o;
//   }
// }


const createServer = (event, graphQLOptions, isDev) => {
  return new ApolloServer({
    schema,
    context: ({request }) => {
      const rawHeaders = new Map(request.headers)
      const headers = {};

      rawHeaders.forEach(function (value, key) {
        headers[key] = value
      })
      return buildContext(headers)
    },
    plugins: [
      {
        requestDidStart() {
          return {
            didEncounterErrors(o) {
              const { response, errors } = o
              console.log('[ERRORS]', errors);
              if (response && response.http && errors.find(err => err.message.includes(FORBIDDEN))) {
                response.http.status = 403;
              }
              if (response && response.http && errors.find(err => err.message.includes(UNAUTHORIZED))) {
                response.http.status = 401;
              }
            },
            willSendResponse(o) {
              const {
                context: { resHeaders = [] },
              } = o;
              
              resHeaders.forEach((item) => {
                const entries = Object.entries(item)
                entries.forEach(entry => {
                  if (o.response && o.response.http) o.response.http.headers.append(entry[0], entry[1]);
                })
              });
              
              return o;
            }              
          }
        }
      },
      
    ],
    formatError: err => formatError(err, event, isDev),
    formatResponse: (response, query) => formatResponse({ response, query }),
    introspection: isDev,
    dataSources: () => ({
      ...buildSource.db(),
      ...buildSource.api(),
    }),
    ...(graphQLOptions.kvCache
      ? { cache: new KVCache(isDev) }
      : {}),
  })
}
const handler = async (event, graphQLOptions, isDev) => {
  const { request } = event
  const server = createServer(event, graphQLOptions, isDev)
  return graphqlCloudflare(() => server.createGraphQLServerOptions(request))(request)
}

module.exports = handler
