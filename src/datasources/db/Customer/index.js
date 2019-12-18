const client = require('../../../dataconnectors')


const { fql, q, graphql } = client

class Customer {
  async getAll({ query, fields }) {

    const fetch = `{ ${query} { data { ${fields} } } }`
    console.log(fetch)
    const { allCustomers: { data = [] } = {} } = await graphql.request(fetch)
    return data

  }

  async getAllFQL() {
    const { data } = await fql.query(
      q.Map(
        q.Paginate(q.Match(q.Index("all_customers"))),
        q.Lambda("X", q.Get(q.Var("X")))
      )
    )
    return data.map(d => ({ ...d.data, _id: d.ref.id }))
  }
}

module.exports = Customer