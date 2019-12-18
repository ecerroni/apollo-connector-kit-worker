const streams = require('web-streams-polyfill')

class KeyValueStore {
  constructor() {
    this.store = new Map()
  }

  put(key, value) {
    this.store.set(key, Buffer.from(value))

    console.log('[CACHE][SET]', key);
    // Print the KV store size
    this.size()

    return Promise.resolve(undefined)
  }

  get(key, type = 'text') {
    const validTypes = ['text', 'arrayBuffer', 'json', 'stream']
    if (!validTypes.includes(type)) {
      throw new TypeError('Unknown response type. Possible types are "text", "arrayBuffer", "json", and "stream".')
    }

    const value = this.store.get(key)
    if (value === undefined) {
      return Promise.resolve(null)
    }

    console.log('[CACHE][READ]', type, key);

    switch (type) {
      case 'text':
        return Promise.resolve(value.toString())
      case 'arrayBuffer':
        return Promise.resolve(Uint8Array.from(value).buffer)
      case 'json':
        return Promise.resolve(JSON.parse(value.toString()))
      case 'stream':

        const { readable, writable } = new streams.TransformStream()
        const writer = writable.getWriter()
        writer.write(Uint8Array.from(value)).then(() => writer.close())

        return Promise.resolve(readable)
    }
  }

  delete(key) {
    if (!this.store.has(key)) {
      throw new Error('HTTP DELETE request failed: 404 Not Found')
    }

    this.store.delete(key)

    return Promise.resolve(undefined)
  }

  size() {
    console.log('[CACHE][VALUES]', this.store.keys())
    console.log('[CACHE][SIZE]: ', this.store.size);
  }
}

module.exports = { KeyValueStore }