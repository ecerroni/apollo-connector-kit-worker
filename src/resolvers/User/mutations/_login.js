const User = require('../../../user/index')
const FULL_ROLES = require('../../../config/_roles-permissions')
const AUTH = require('../../../config/_authentication')
const { createTokens } = require('../../../auth/_handle-tokens')
const { assignCascadeRoles, sortItems } = require('../../../user/_utils')

module.exports = async (_, { input }) => {
  const { username, password } = input;
  const user = await User.validate(username, password);
  if (user) {
    const {
      role: { value: userRole, permissions: userPermissions }
    } = user;
    const roles = Object.keys(FULL_ROLES).reduce(
      (arr, key) => [
        ...arr,
        { rank: FULL_ROLES[key].SPEC.RANK, value: key }
      ],
      []
    );
    const userFullRoles = assignCascadeRoles(
      FULL_ROLES[userRole].SPEC,
      sortItems({ items: roles, field: 'rank' })
    );
    const userFullPermissions = roles
      .filter(r => r.rank > userRole.rank)
      .reduce((arr, rl) => [...arr, ...rl.permissions], []);
    const additionalClaims = {};
    const userData = {
      id: user.id || user._id,
      username: user.username,
      email: user.email,
      roles: userFullRoles,
      permissions: [
        ...new Set([...userPermissions, ...userFullPermissions])
      ]
    };
    const [token, refreshToken] = await createTokens(
      {
        user: userData,
        refreshTokenSecret:
          user.password + user.delta + AUTH.SECRET_REFRESH_TOKEN
      },
      additionalClaims
    );
    const response = JSON.stringify({ token, refreshToken });
    return response;
  }
  return null;
}