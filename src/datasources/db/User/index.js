import { User as UserModel } from './_model';
import UserSchema from './_schema';

export const User = db => new UserModel({ User: db.model('User', UserSchema) });
export { UserHelper } from './_model';
export { UserEnums } from './_enums'
