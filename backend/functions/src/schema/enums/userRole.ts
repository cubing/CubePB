import { Kenum } from "../core/helpers/enum";

export class userRoleKenum extends Kenum {
  static readonly NORMAL = new userRoleKenum("NORMAL", 1);
  static readonly NONE = new userRoleKenum("NONE", 2);
  static readonly ADMIN = new userRoleKenum("ADMIN", 3);
  static readonly MODERATOR = new userRoleKenum("MODERATOR", 4);
}
