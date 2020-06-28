const { gql } = require('apollo-server-cloudflare')
const {  makeExecutableSchema, makeRemoteExecutableSchema, mergeSchemas } = require('graphql-tools')
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


const resolvers = {
  // Query: {
  //   // connection: () => 'Server is up and running',
  //   // _protected: (parent, args, context) => {
  //   //   return "Hello, Logged in user!";
  //   // },
  //   // onlyOwnerRole: (parent, args, context) => {
  //   //   return "Hello, Owner!";
  //   // },
  //   // _checkAuth: checkAuthQuery,
  //   // ...components.resolvers.Query
  // },
  // Mutation: {
  //   // login: loginMutation,
  //   // ...components.resolvers.Mutation
  // }
};
/* ******************/
const typeDefs = mergeTypes([
  directives,
  // oKGGraphQLScalars,
  // CONSTRAINT_SCALARS,
  components.types,
  // `scalar JSON` // due to GraphQLJSON | 'graphql-type-json';
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
  const fetch = require("node-fetch");
  const { __schema } = require('../remote-schema.json')
  const { printSchema, buildClientSchema } = require('graphql/utilities');

  const { lazy } = require( 'apollo-link-lazy');
  const { createHttpLink } = require('apollo-link-http');
  const remote = buildClientSchema({ __schema })
  const remoteSchema = makeRemoteExecutableSchema({
    schema: remote,
    link: createHttpLink({ uri: 'https://graphql.fauna.com/graphql', headers: {
        Authorization: `Bearer fnADflatjdACAPRlHz4zHFaRekRrcGVY6_LwzhBq`,
      }, fetch: fetch.default })
  });
  console.log('remoteSchema');
  console.log(remoteSchema);
  // // write a resolver to write custom logic
  const customResolvers = {
    Query: {
      ...components.resolvers.Query,
      // user_average_age: async (root, args, context, info) => {
      //   return true
      // },
      allCustomers: async (root, args, context, info) => {
        console.log(context.user, roles.is.user);
        if (true) throw new Error(UNAUTHORIZED)
        return info.mergeInfo.delegateToSchema({
          schema: remoteSchema,
          operation: 'query',
          fieldName: 'allCustomers',
          args,
          context,
          info
        });
      },
      // game: (root, args, context, info) => {
      //   customLogic(root, args, context, info);
      //   return info.mergeInfo.delegateToSchema({
      //     schema,
      //     operation: 'query',
      //     fieldName: 'game',
      //     args,
      //     context,
      //     info
      //   });
      // }
    },
    Mutation: {
      ...components.resolvers.Mutation
    }
  };
  // const localSchema = makeExecutableSchema({
  //   typeDefs,
  //   resolvers: [resolvers, { JSON: GraphQLJSON }],
  // })
  // console.log('local schema');
  // console.log(localSchema);

  
  // Object.keys(OKGGraphQLScalars).forEach(key => {
  //   // eslint-disable-next-line no-underscore-dangle
  //   if (localSchema._typeMap[key]) {
  //     Object.assign(localSchema._typeMap[key], OKGGraphQLScalars[key]); // eslint-disable-line no-underscore-dangle
  //   }
  // });
  // Object.keys(TYPE_CONSTRAINTS).forEach(k => {
  //   // eslint-disable-next-line no-underscore-dangle
  //   const key = TYPE_CONSTRAINTS[k];
  //   if (localSchema._typeMap[key]) {
  //     Object.assign(localSchema._typeMap[key], TYPE_CONSTRAINTS[k]); // eslint-disable-line no-underscore-dangle
  //   }
  // });
  
  // attachDirectives(localSchema);
  const typeDefs2 = `
  type Query {
    user_average_age: Boolean
  }
`;

// Resolvers for user_average_age query
const resolvers2 = {
  Query: {
    user_average_age: async (root, args, context, info) => {
      return true
    },
      // allCustomers: async (root, args, context, info) => {
      //   return info.mergeInfo.delegateToSchema({
      //     schema: remoteSchema,
      //     operation: 'query',
      //     fieldName: 'allCustomers',
      //     args,
      //     context,
      //     info
      //   });
      // },
  }
};

  // const localSchema = makeExecutableSchema({
  //   typeDefs: typeDefs2,
  //   resolvers: resolvers2
  // });
  // console.log(localSchema);

  
  const finalSchema = mergeSchemas({
    schemas: [
      remoteSchema,
      typeDefs,
      // localSchema,
    ],
    resolvers: customResolvers
  })
  console.log('finalSchema');
  console.log(finalSchema);
  // attachDirectives(finalSchema);
  const schema = applyMiddleware(
    finalSchema,
    isAllowed,
  )
  module.exports = schema