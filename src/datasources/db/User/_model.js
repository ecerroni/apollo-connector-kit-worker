import { MongoDataSource } from 'apollo-datasource-mongo';
import useSearchParams from 'mongo-search-parameters';
import { db } from '~/dataconnectors';
import { encryptor } from '~/utils/';
import { ERROR } from '~/environment';
import { useModifiers } from '../_utils';

export class User extends MongoDataSource {
  initialize(config) {
    super.initialize({
      ...config,
      debug: process.env.NODE_ENV && process.env.NODE_ENV !== 'production'
    });
  }

  loadOne(UserId) {
    return this.User.loadOneById(UserId);
  }

  loadMany(UsersIds) {
    return this.User.loadManyByIds(UsersIds);
  }

  getOne(UserId, modifiers) {
    return useModifiers(this.User.findById(UserId))(modifiers);
  }

  getAll(params, modifiers) {
    return useModifiers(useSearchParams(this.User, { ...params }))(modifiers);
  }
}

// TODO: add
export const UserHelper = {
  validate: async (username, password) => {
    const validUser = await db.models.User.findOne({ username }).lean();
    if (validUser) {
      const validPassword = await encryptor.verify(
        { digest: password },
        validUser.password
      );
      if (!validPassword) {
        throw new Error(ERROR.USER.WRONG_PASSWORD);
      }
      let userRole = await db.models.Role.findById(validUser.role);
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
    const validUser = await db.models.User.findById(id);
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
