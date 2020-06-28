const graphqlFields = require('graphql-fields');

const transformFields = o =>
  Object.entries(o).reduce(
    (str, entry) =>
      `${str} ${entry[0]}${
      entry[1] &&
        typeof entry[1] === "object" &&
        Object.keys(entry[1]).length > 0
        ? ` {${transformFields(entry[1])} }`
        : ""
      }`,
    ""
  );

const Customer = {
  types: `
  type Query {
    allCustomersLocal: [String]
    allCustomersLocal2: [String]
  }
`,
  resolvers: {
    Query: {
      allCustomersLocal2: (_, __, { dataSources }) => {
        return dataSources.Customer.getAllFQL()
      },
      allCustomersLocal: (_, __, { dataSources }, info) => {
        return dataSources.Customer.getAll({
          query: 'allCustomers',
          fields: transformFields(graphqlFields(info))
        })
      }
    }
  }
}

module.exports = Customer