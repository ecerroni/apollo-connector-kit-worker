const { gql } = require('apollo-server-cloudflare')
const { makeExecutableSchema,  makeRemoteExecutableSchema, introspectSchema, mergeSchemas } = require('graphql-tools')
const { mergeTypes } = require('merge-graphql-schemas');
const OKGGraphQLScalars = require('@okgrow/graphql-scalars'); // eslint-disable-line
const {
  GraphQLInputInt,
  // GraphQLInputFloat,
} = require('graphql-input-number');
const GraphQLJSON = require('graphql-type-json');
const GraphQLInputString = require('graphql-input-string');
const { applyMiddleware } = require('graphql-middleware')
const { attachDirectives } = require('../directives/_attach-schema')
const { directives } = require('../directives/_directives')
const { UNAUTHORIZED } = require('../environment/_authorization')
const { isPrivateOperation } = require('../utils')
const loginMutation = require('../resolvers/User/mutations/_login')
const checkAuthQuery = require('../resolvers/User/queries/_checkAuth')
const { roles } = require('../directives/_constraints')
const components = require('../datacomponents')

const oKGGraphQLScalars = `
  scalar DateTime
  scalar NonNegativeFloat
  scalar EmailAddress
`;

const TYPE_CONSTRAINTS = [
  // ref: https://github.com/joonhocho/graphql-input-number
  GraphQLInputInt({
    name: 'PaginationAmount',
    min: 1,
    max: 100
  }),
  // ref: https://github.com/joonhocho/graphql-input-string
  GraphQLInputString({
    name: 'TrimmedString',
    trim: true
  })
];

const CONSTRAINT_SCALARS = TYPE_CONSTRAINTS.reduce(
  (type, input) => `${type} scalar ${input}`,
  ''
);

/* TYPES AND RESOLVERS ******************/

const types = gql`
  input userCredentials {
    username: String!
    password: String!
  }
  type Query {
    _protected: String
    onlyOwnerRole: String @${roles.is.owner}
    _checkAuth: String
    connection: String
  }
  type Mutation {
    login(input: userCredentials!): String
  }
`;

const resolvers = {
  Query: {
    connection: () => 'Server is up and running',
    _protected: (parent, args, context) => {
      return "Hello, Logged in user!";
    },
    onlyOwnerRole: (parent, args, context) => {
      return "Hello, Owner!";
    },
    _checkAuth: checkAuthQuery,
    ...components.resolvers.Query
  },
  Mutation: {
    login: loginMutation,
    ...components.resolvers.Mutation
  }
};
/* ******************/
const typeDefs = mergeTypes([
  directives,
  oKGGraphQLScalars,
  CONSTRAINT_SCALARS,
  types,
  components.types,
  `scalar JSON` // due to GraphQLJSON | 'graphql-type-json';
]);

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

const e = async () => {
  console.log(0);
  let res = await fetch('https://jsonplaceholder.typicode.com/todos/1')
  console.log(1);
  res = res.json()
  console.log(2);
  console.log(res)
}
  // const introspectionResult = await introspectSchema(
  //   new HttpLink({ uri: 'https://graphql.fauna.com/graphql', headers: {
  //     Authorization: `Bearer fnADflatjdACAPRlHz4zHFaRekRrcGVY6_LwzhBq`,
  //   } })
  // );
  // console.log(1);
  // const remoteSchema = await makeRemoteExecutableSchema({
  //   schema: introspectionResult,
  //   link: new HttpLink({ uri: 'https://graphql.fauna.com/graphql', headers: {
  //     Authorization: `Bearer fnADflatjdACAPRlHz4zHFaRekRrcGVY6_LwzhBq`,
  //   } })
  // });
  // console.log(2);
  // console.log('rs', remoteSchema);
  const schema = applyMiddleware(
    makeExecutableSchema({
      typeDefs,
      resolvers: [resolvers, { JSON: GraphQLJSON }],
    }),
    isAllowed,
  )
  
  Object.keys(OKGGraphQLScalars).forEach(key => {
    // eslint-disable-next-line no-underscore-dangle
    if (schema._typeMap[key]) {
      Object.assign(schema._typeMap[key], OKGGraphQLScalars[key]); // eslint-disable-line no-underscore-dangle
    }
  });
  Object.keys(TYPE_CONSTRAINTS).forEach(k => {
    // eslint-disable-next-line no-underscore-dangle
    const key = TYPE_CONSTRAINTS[k];
    if (schema._typeMap[key]) {
      Object.assign(schema._typeMap[key], TYPE_CONSTRAINTS[k]); // eslint-disable-line no-underscore-dangle
    }
  });
  
  attachDirectives(schema);
  module.exports = schema