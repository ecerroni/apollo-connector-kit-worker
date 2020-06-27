const client = require('../../../dataconnectors')
// const encryptor = require('../../../utils/encryptor')
const { ERROR } = require('../../../environment/_errors')

const { fql, q, graphql } = client

const queries = {
  fetchUserByUsername: (username) => `{
    fetchUserByUsername(username: ${username}) {
      _id
      password
      role
    }
  }`,
  fetchUserById: (id) => `{
    fetchUserById(id: ${id}) {
      _id
      password
      role
    }
  }`,
  fetchRoleById: (id) => `{
    fetchRoleById(id: ${id}) {
      _id
      value
      rank
      permissions
    }
  }`
}


const result = async (queryName, value) => {
  const { [queryName]: { data = {} } = {} } = await graphql.request(queries[queryName](value))
  return data
}

const UserHelper = {
  validate: async (username, password) => {
    const validUser = await result('findUserByUsername', username);
    if (validUser) {
      // const validPassword = await encryptor.verify(
      //   { digest: password },
      //   validUser.password
      // );
      // if (!validPassword) {
      //   throw new Error(ERROR.USER.WRONG_PASSWORD);
      // }
      let userRole = await result('findRoleById', validUser.role);
      const userPermissions = userRole.permissions;
      userRole = userRole.value;
      return {
        ...validUser,
        role: {
          value: userRole,
          permissions: userPermissions
        }
      };
    }
    throw new Error(ERROR.USER.WRONG_CREDENTIALS);
  },

  getPassword: async ({ id, delta = false }) => {
    const validUser = await result('findUserById', id);
    if (validUser) {
      const response = {
        password: validUser.password,
        ...(delta && { delta: validUser.delta })
      };
      return response;
    }
    throw new Error(ERROR.USER.DOES_NOT_EXIST);
  }
};

module.exports = UserHelper