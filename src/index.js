const server = require('./server')
const playground = require('./playground')
const setCors = require('./utils/setCors')
const appSettings = require('./settings/app.json')
const formatCloudflareResponse = require('./graphql/_format-response-cloudflare')

const graphQLOptions = {
  // Set the path for the GraphQL server
  baseEndpoint: appSettings.ENDPOINT.GRAPHQL,

  // Set the path for the GraphQL playground
  // This option can be removed to disable the playground route
  playgroundEndpoint: appSettings.ENDPOINT.GRAPHIQL,

  // When a request's path isn't matched, forward it to the origin
  forwardUnmatchedRequestsToOrigin: false,

  // Enable debug mode to return script errors directly in browser
  debug: false,

  // Enable CORS headers on GraphQL requests
  // Set to `true` for defaults (see `utils/setCors`),
  // or pass an object to configure each header
  cors: true,
  // cors: {
  //   allowCredentials: 'true',
  //   allowHeaders: 'Content-type',
  //   allowOrigin: '*',
  //   allowMethods: 'GET, POST, PUT',
  // },

  // Enable KV caching for external REST data source requests
  // Note that you'll need to add a KV namespace called
  // WORKERS_GRAPHQL_CACHE in your wrangler.toml file for this to
  // work! See the project README for more information.
  kvCache: false,
}

const handleRequest = async request => {
  const headers = new Map(request.headers)
  const host = headers.get('host')
  console.log('[INFO] Host is:', host)
  let __DEV;
  if (host.includes('8787') || host.includes('example.com')) __DEV = true
  console.log(`[INFO] Running as [${__DEV ? 'Development' : 'Production'}]`)
  if (__DEV) {
    graphQLOptions.debug = true
    graphQLOptions.kvCache = true //TODO: RICO: use the KV cache in production too?
  }
  const url = new URL(request.url)
  try {
    if (url.pathname === graphQLOptions.baseEndpoint) {
      const response =
        request.method === 'OPTIONS'
          ? new Response('', { status: 204 })
          : await server(request, graphQLOptions, __DEV)
      if (graphQLOptions.cors) {
        setCors(response, graphQLOptions.cors)
      }
      const responseBody = response.bodyUsed ? response.body : await response.json()
      const rawHeaders = new Map(request.headers)
      const headers = {};

      rawHeaders.forEach(function (value, key) {
        headers[key] = value
      })
      const { body, headers: responseHeaders, status } = formatCloudflareResponse(responseBody, headers);
      const formattedResponse = new Response(JSON.stringify(body), { status })
      responseHeaders.forEach(header => {
        formattedResponse.headers.set(header.name, header.value)
      })
      return formattedResponse
    } else if (
      graphQLOptions.playgroundEndpoint &&
      url.pathname === graphQLOptions.playgroundEndpoint
    ) {
      return playground(request, graphQLOptions)
    } else if (graphQLOptions.forwardUnmatchedRequestsToOrigin) {
      return fetch(request)
    } else {
      return new Response('Not found', { status: 404 })
    }
  } catch (err) {
    if (__DEV) {
      console.log(err);
    }
    return new Response(graphQLOptions.debug ? err : 'Something went wrong', { status: 500 })
  }
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
