const client = require('../../../dataconnectors')


const { fql, q, graphql } = client

class Class {
  async getAll() {

    const fetch = `{
      allRoles {
        _id
        value
        rank
        permissions
      }
    }`
    const { allRoles: { data = [] } = {} } = await graphql.request(fetch)
    return data

  }
}

module.exports = Class
