const users = require('../../../mocks/_users');
const { ERROR } = require('../../../environment/_errors');

module.exports = {
  validate: async (username, password) => {
    const validUser =
      users.filter(u => u.username === username).length > 0
        ? users.filter(u => u.username === username)[0]
        : undefined;
    if (validUser) {
      const validPassword = password === validUser.password
      
      if (!validPassword) {
        throw new Error(ERROR.USER.WRONG_PASSWORD);
      }
      return validUser;
    }
    throw new Error(ERROR.USER.WRONG_CREDENTIALS);
  },
  getPassword: async ({ id, delta = false }) => {
    const validUser =
      users.filter(u => (u.id === id) || (u._id === id)).length > 0
        ? users.filter(u => (u.id === id) || (u._id === id))[0]
        : undefined;
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
