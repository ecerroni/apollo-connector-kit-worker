const { RESTDataSource } = require('apollo-datasource-rest')

class PokemonAPI extends RESTDataSource {
  constructor() {
    super()
    this.baseURL = 'https://pokeapi.co/api/v2/'
  }

  async getPokemon(id) {
    let res;
    try {
      res = await this.get(`pokemon/${id}`, null, { ttl: 9, cacheOptions: { ttl: 7 } })
    } catch (e) { console.log('err', e) }
    return res
  }
}

module.exports = PokemonAPI
