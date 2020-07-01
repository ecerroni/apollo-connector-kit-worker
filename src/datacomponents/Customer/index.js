// const graphqlFields = require('graphql-fields');
const { roles } = require('../../directives/_constraints');

// const transformFields = o =>
//   Object.entries(o).reduce(
//     (str, entry) =>
//       `${str} ${entry[0]}${
//       entry[1] &&
//         typeof entry[1] === "object" &&
//         Object.keys(entry[1]).length > 0
//         ? ` {${transformFields(entry[1])} }`
//         : ""
//       }`,
//     ""
// );

const Customer = {
  types: `
  type Pokemon {
    id: Int
    name: String
  }
  type Query {
    allCustomersLocal: Pokemon @${roles.is.user}
    allCustomersLocal2: [String]
  }
  type Mutation {
    test: String
  }
`,
  resolvers: {
    Query: {
      allCustomersLocal2: (_, __, { dataSources }) => {
        return ['test']
      },
      allCustomersLocal: async (_, __, { dataSources: { PokemonApi } = {} }, info) => {
        const pok = PokemonApi ? await PokemonApi.getPokemon(1) : null
        return pok;
      }
    }
  }
}

module.exports = Customer