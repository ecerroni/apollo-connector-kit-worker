import RoleModel from './_model';
import RoleSchema from './_schema';

export const Role = db =>
  new RoleModel({
    Role: db.model('Role', RoleSchema)
  });
