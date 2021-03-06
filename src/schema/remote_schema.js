const {  makeRemoteExecutableSchema } = require('graphql-tools')
const { __schema } = require('../remote-schema.json')
const { buildClientSchema } = require('graphql/utilities');
const { createHttpLink } = require('apollo-link-http');
const { UNAUTHORIZED, FORBIDDEN, NOT_ALLOWED } = require('../environment/_authorization')
const operations = require('../all-operations.json')
const { roles, permissions } = require('../directives/_constraints')

const handleAccess = ({ user = null }, access) => {
  if(!user) return false
  const authorized = access.includes('hasRole')
  ? !!user.roles.find(r => access.includes(r))
  : access.includes('isAllowed')
    ? !!user.permissions.find(p => access.includes(p))
    : false
  if (!authorized) {
    const isRole = access.includes('hasRole')
    const isPermission = access.includes('isAllowed')
    if(isRole) throw new Error(FORBIDDEN)
    if(isPermission) throw new Error(NOT_ALLOWED)
  }
}

const protectResolver = ({ shield = roles.is.user, forcePublic = false, operation = 'query', fieldName }) => async (root, args, context, info) => {
  if (!forcePublic) {

    // validate against role/permisssions and throw errors if it fails
    handleAccess(context, shield)
  }
  return info.mergeInfo.delegateToSchema({
    schema: remoteSchema,
    operation,
    fieldName,
    args,
    context,
    info
  });
}


const protectResolvers = ({ operations: ops, shield = roles.is.user, type = 'query', forcePublic = false }) => ({  
  ...ops.reduce((o, op) => ({
    ...o,
    [op]: protectResolver({ shield, fieldName: op, operation: type, forcePublic })
  }), {})})

/** BUILD THE REMOTE SCHEMA */
const remote = buildClientSchema({ __schema })
const remoteSchema = makeRemoteExecutableSchema({
  schema: remote,
  link: createHttpLink({ uri: 'https://graphql.fauna.com/graphql', headers: {
      Authorization: `Bearer ${process.env.FAUNA_SECRET || FAUNA_SECRET}`,
    }, fetch })
});
if (remoteSchema) {
  console.log('[INFO] Remote schema ready');
}

/** SET OVERRIDES */
// all queries/mutations will be made accessible only by logged in users
// however we can still decide
// what should stay public
const publicQueries = []
// what should have special roles
const adminQueries = ['allProducts']
// add other roles or permissions queries

const overridenResolvers = {
  Query: {  
    ...protectResolvers({ operations: operations.queries }),
    ...protectResolvers({ operations: adminQueries, shield: roles.is.admin }),
    ...protectResolvers({ operations: publicQueries, forcePublic: true })
  },
  Mutation: {
    ...protectResolvers({ operations: operations.mutations, type: 'mutation' })
  }
};


/** SET EXTENSIONS */

const customExtensionTypes = `
extend type Product {
  pokemon: Pokemon
}
`
const customExtensionResolvers = {
  Product: {
    pokemon: (_, __, { dataSources: { PokemonApi } = {} }) => PokemonApi ? PokemonApi.getPokemon(1) : null 
  },
}

module.exports = {
  remoteSchema,
  overridenResolvers,
  customExtensionTypes,
  customExtensionResolvers
}