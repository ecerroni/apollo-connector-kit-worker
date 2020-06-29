const {  makeExecutableSchema } = require('graphql-tools')
const { mergeTypes } = require('merge-graphql-schemas');
const OKGGraphQLScalars = require('@okgrow/graphql-scalars'); // eslint-disable-line
const {
  GraphQLInputInt,
  // GraphQLInputFloat,
} = require('graphql-input-number');
const GraphQLJSON = require('graphql-type-json');
const GraphQLInputString = require('graphql-input-string');
const { attachDirectives } = require('../directives/_attach-schema')
const { directives } = require('../directives/_directives')
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

const typeDefs = mergeTypes([
  directives,
  oKGGraphQLScalars,
  CONSTRAINT_SCALARS,
  components.types,
  `scalar JSON` // due to GraphQLJSON | 'graphql-type-json';
]);


  

const componentResolvers = {
  Query: {
    ...components.resolvers.Query,
  },
  Mutation: {
    ...components.resolvers.Mutation
  }
}
  

const localSchema = makeExecutableSchema({
  typeDefs,
  resolvers: componentResolvers
})

Object.keys(OKGGraphQLScalars).forEach(key => {
  // eslint-disable-next-line no-underscore-dangle
  if (localSchema._typeMap[key]) {
    Object.assign(localSchema._typeMap[key], OKGGraphQLScalars[key]); // eslint-disable-line no-underscore-dangle
  }
});
Object.keys(TYPE_CONSTRAINTS).forEach(k => {
  // eslint-disable-next-line no-underscore-dangle
  const key = TYPE_CONSTRAINTS[k];
  if (localSchema._typeMap[key]) {
    Object.assign(localSchema._typeMap[key], TYPE_CONSTRAINTS[k]); // eslint-disable-line no-underscore-dangle
  }
});
attachDirectives(localSchema);

module.exports = localSchema