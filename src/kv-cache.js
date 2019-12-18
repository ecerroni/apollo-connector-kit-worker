const KV = require('./kv.js')

const CACHE = new KV.KeyValueStore()

class KVCache {
  constructor(isDev) {
    if (!!isDev) this.isDev = isDev
  }
  get(key) {
    return this.isDev ? CACHE.get(key) : WORKERS_GRAPHQL_CACHE.get(key)
  }

  set(key, value, options) {
    const opts = {}
    const ttl = options && options.ttl
    if (ttl) {
      opts.expirationTtl = ttl
    }
    return this.isDev ? CACHE.put(key, value, opts) : WORKERS_GRAPHQL_CACHE.put(key, value, opts)
  }
}

module.exports = KVCache
