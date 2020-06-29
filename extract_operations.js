const fs = require('fs');
const { __schema } = require('./src/remote-schema.json')
const { types } = __schema

const extraxtOperations = (types, opName = 'Query') => types.filter(type => type.name === opName).reduce((arr, op) => [...arr, ...op.fields.map(o => o.name)], [])

const queries = extraxtOperations(types, 'Query')
const mutations = extraxtOperations(types, 'Mutation')

const operations = {
  queries,
  mutations,
}
fs.writeFileSync("./src/all-operations.json", JSON.stringify(operations, null, 2))