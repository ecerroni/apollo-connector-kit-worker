import { MongoDataSource } from 'apollo-datasource-mongo';
import useSearchParams from 'mongo-search-parameters';
import { useModifiers } from '../_utils';

export default class extends MongoDataSource {
  initialize(config) {
    super.initialize({
      ...config,
      debug: true,
      allowFlushingCollectionCache: true
    });
  }

  async loadOne(RoleId) {
    return this.Role.loadOneById(RoleId, { ttl: 15 });

  }

  loadMany(RolesIds) {
    return this.Role.loadManyByIds(RolesIds);
  }

  getRole(RoleId, modifiers) {
    return useModifiers(this.Role.findById(RoleId))(modifiers);
  }

  getAll(params, modifiers) {
    return useModifiers(useSearchParams(this.Role, { ...params }))(modifiers);
  }
}
