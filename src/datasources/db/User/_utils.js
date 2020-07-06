const to = require('await-to-js')
// const Random = require('random-seed-generator'); // TODO: update the token every time a user update his password
const { fql, q } = require('../../../dataconnectors')
// const users = require('../../../mocks/_users')
const { ERROR } = require('../../../environment/_errors')
const identifyUser = async (username, password) => {
  const [err, user] = await to.default(fql.query( // chatch error con await to()
    q.Login(
      q.Match(q.Index("users_by_email"), username),
      { password },
    )
  ))
  if (!err) {
    const { instance: { value: { id: userId } = {} } = {}} = user
    const validUser = await fql.query(q.Get(q.Ref(q.Collection('users'), userId)))
    
    if (validUser) {
      const { data: { email, role, token, delta } = {} } = validUser
      return {
        id: userId,
        password: token,
        email,
        role,
        delta,
      }
    }
  }  
  return undefined
}

const retrieveUser = async (id) => {
  const validUser = await fql.query(q.Get(q.Ref(q.Collection('users'), id)))
  const { data: { delta, token: password } = {} } = validUser
  return {
    delta,
    password
  }
}

module.exports = {
  validate: async (username, password) => {
    // const validUser =
      // users.filter(u => u.username === username).length > 0
      //   ? users.filter(u => u.username === username)[0]
      //   : undefined;
    let validUser = await identifyUser(username, password)
    if (validUser) {
      const validPassword = validUser.password
      if (!validPassword) {
        throw new Error(ERROR.USER.WRONG_PASSWORD);
      }
      return validUser;
    }
    throw new Error(ERROR.USER.WRONG_CREDENTIALS);
  },
  getPassword: async ({ id, delta = false }) => {
    const validUser = await retrieveUser(id)
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
