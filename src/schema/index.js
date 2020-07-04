const {  mergeSchemas } = require('graphql-tools')
const { applyMiddleware } = require('graphql-middleware')
const { UNAUTHORIZED } = require('../environment/_authorization')
const { isPrivateOperation } = require('../utils')
const {
  remoteSchema,
  overridenResolvers,
  customExtensionTypes,
  customExtensionResolvers
} = require('./remote_schema')
// const localSchema = require('./local_schema')

const isAllowed = async (resolve, root, args, context, info) => {
  const isPublic = !isPrivateOperation(info.fieldName) || !['Query', 'Mutation'].includes(info.parentType.toString())
  const result = isPublic
    ? await resolve(root, args, context, info)
    : context.user
      ? await resolve(root, args, context, info)
      : 'error';
  if (typeof result === 'string' && result === 'error') throw new Error(UNAUTHORIZED)
  return result
}


const finalSchema = mergeSchemas({
  schemas: [
    remoteSchema,
    // localSchema,
    // customExtensionTypes
  ],
  // resolvers: {
  //   ...overridenResolvers,
  //   ...customExtensionResolvers,
  // }
})

const schema = applyMiddleware(
  finalSchema,
  isAllowed,
)
module.exports = schema