// const { RESTDataSource } = require('apollo-datasource-rest');

// export class Posts extends RESTDataSource {
//   constructor() {
//     super();
//     this.baseURL = 'https://jsonplaceholder.typicode.com';
//   }

//   async getPosts() {
//     return this.get(`posts?userId=1`, null, { cacheOptions: { ttl: 0 } }).then(data => data).catch(err => { });
//   }
// }

export const apiSource = () => ({
  // Posts: new Posts(),
})