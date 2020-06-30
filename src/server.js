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


const createServer = (graphQLOptions, isDev) => {
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
    // extensions: [
    //   () => new FwdHeadersExtension()
    // ],
    plugins: [
      {
        requestDidStart() {
          return {
            didEncounterErrors(o) {
              const { response, errors } = o
              console.log(errors[0].message, FORBIDDEN, 17);
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
    formatError: err => formatError(err, isDev),
    formatResponse: (response, query) => formatResponse({ response, query }),
    introspection: isDev,
    // dataSources,
    dataSources: () => ({
      ...buildSource.db(),
      ...buildSource.api(),
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
