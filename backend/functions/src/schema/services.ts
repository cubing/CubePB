import { userRoleKenum, scoreMethodEnum } from "./enums";
import { KenumService, EnumService } from "./core/services";

import { UserService } from "./models/user/service";
import { AuthService } from "./models/auth/service";
import { EventService } from "./models/event/service";
import { ProductService } from "./models/product/service";
import { PersonalBestClassService } from "./models/personalBestClass/service";
import { PersonalBestService } from "./models/personalBest/service";

export const User = new UserService();
export const Event = new EventService();
export const Product = new ProductService();
export const Auth = new AuthService();
export const PersonalBestClass = new PersonalBestClassService();
export const PersonalBest = new PersonalBestService();

export const UserRole = new KenumService("userRole", userRoleKenum);

export const ScoreMethod = new EnumService("scoreMethod", scoreMethodEnum);
