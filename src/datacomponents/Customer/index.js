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

  type Address {
    street: String!
    city: String!
    state: String!
    zipCode: String!
  }

  type Customer {
    _id: ID!
    lastName: String!
    firstName: String!
    creditCard: JSON!
    address: Address!
    telephone: String!
  }

  type Query {
    allCustomers: [Customer]
    allCustomers2: [Customer]
  }
`,
  resolvers: {
    Query: {
      allCustomers2: (_, __, { dataSources }) => {
        return dataSources.Customer.getAllFQL()
      },
      allCustomers: (_, __, { dataSources }, info) => {
        return dataSources.Customer.getAll({
          query: 'allCustomers',
          fields: transformFields(graphqlFields(info))
        })
      }
    }
  }
}

module.exports = Customer