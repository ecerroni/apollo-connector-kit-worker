const SCOPES = require('../config/_scopes');
const { DIRECTIVES } = require('./_directives');

const buildPermission = (operation, type) =>
  `${DIRECTIVES.IS_ALLOWED.FUNC_NAME}(${DIRECTIVES.IS_ALLOWED.SCOPE}: ["${operation}_${type}"])`;
// Permissions
const allOperations = Object.keys(SCOPES.OPERATION);
const allTypes = Object.keys(SCOPES.TYPE);
const allOperationTypeCombinations = allOperations.reduce(
  (obj, operation) => ({
    ...obj,
    [operation.toLowerCase()]: allTypes.reduce(
      (o, type) => ({
        ...o,
        [type.toLowerCase()]: buildPermission(
          SCOPES.OPERATION[operation],
          SCOPES.TYPE[type]
        )
      }),
      {}
    )
  }),
  {}
);

const permissions = {
  can: {
    ...allOperationTypeCombinations
  }
};

// Roles

const buildRole = role =>
  `${DIRECTIVES.HAS_ROLE.FUNC_NAME}(${DIRECTIVES.HAS_ROLE.SCOPE}: ["${role}"])`;

const allRoles = Object.keys(SCOPES.ROLES);
const allRolesAvailable = allRoles.reduce(
  (obj, role) => ({
    ...obj,
    [role.toLowerCase()]: buildRole(role)
  }),
  {}
);
const roles = {
  is: {
    ...allRolesAvailable
  }
};

module.exports = {
  permissions,
  roles,
}