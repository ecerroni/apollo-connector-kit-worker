const components = [
  require('./Customer')
]

const merge = components.reduce((obj, component) => ({
  ...obj,
  types: `${obj.types} ${component.types}`,
  resolvers: {
    ...obj.resolvers,
    Query: {
      ...obj.resolvers.Query,
      ...component.resolvers.Query,
    },
    Mutation: {
      ...obj.resolvers.Mutation,
      ...component.resolvers.Mutation,
    }
    // TODO: handle component's type resolver
  }
}), {
  types: '', resolvers: {
    Query: {},
    Mutation: {},
  }
})

module.exports = merge