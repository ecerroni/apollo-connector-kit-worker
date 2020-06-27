
const client = require('../../../dataconnectors')

const { fql, q, graphql } = client

class Class {
  async getAll() {

    const fetch = `{
      allUsers {
        _id
        value
        rank
        permissions
      }
    }`
    const { allUsers: { data = [] } = {} } = await graphql.request(fetch)
    return data

  }
}

module.exports = Class