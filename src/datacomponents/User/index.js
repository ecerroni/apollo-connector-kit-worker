const { createUserToken } = require('../../utils');
const UserHelper = require('../../datasources/db/User/_utils')
const User = {
  types: `
    input userCredentials {
      username: String!
      password: String!
    }

    type Mutation {
      login(input: userCredentials): String
    }

`,
  resolvers: {
    Query: {
      //
    },
    Mutation: {
      login: async (_, { input }) => {
        const { username, password } = input;
        const user = await UserHelper.validate(username, password);
        if (user) {
          return createUserToken(user);
        }
        return null;
      }
    }
  }
}

module.exports = User