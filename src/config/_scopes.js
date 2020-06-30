const ROLES_PERMISSIONS = require('../settings/roles-permissions.json');

const { OPERATION, USERS, SCOPES } = ROLES_PERMISSIONS;

const OWNER = {
  RANK: 0,
  VALUE: 'OWNER'
};

const ROLES = USERS.reduce(
  (obj, type, index) => {
    let values = {};
    if (Array.isArray(type)) {
      values = type.reduce(
        (o, item) => ({
          ...o,
          [Object.keys(item)[0]]: {
            RANK: index + 1,
            VALUE: Object.keys(item)[0]
          }
        }),
        {}
      );
    } else {
      values = {
        [Object.keys(type)[0]]: {
          RANK: index + 1,
          VALUE: Object.keys(type)[0]
        }
      };
    }
    return {
      ...obj,
      ...values
    };
  },
  { OWNER }
);

module.exports = {
  OPERATION,
  TYPE: SCOPES,
  ROLES
}