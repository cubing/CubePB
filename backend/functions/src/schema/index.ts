import * as allServices from "./services";
import "./scalars"; // setTypeDef scalars
export * as Scalars from "./scalars";

import user from "./models/user/typeDef";
import auth from "./models/auth/typeDef";
import event from "./models/event/typeDef";
import product from "./models/product/typeDef";
import personalBestClass from "./models/personalBestClass/typeDef";
import personalBest from "./models/personalBest/typeDef";

// add the typeDefs for the services with typeDefs
allServices.User.setTypeDef(user);
allServices.Auth.setTypeDef(auth);
allServices.Event.setTypeDef(event);
allServices.Product.setTypeDef(product);
allServices.PersonalBestClass.setTypeDef(personalBestClass);
allServices.PersonalBest.setTypeDef(personalBest);

import User from "./models/user/rootResolver";
import Auth from "./models/auth/rootResolver";
import Event from "./models/event/rootResolver";
import Product from "./models/product/rootResolver";
import PersonalBestClass from "./models/personalBestClass/rootResolver";
import PersonalBest from "./models/personalBest/rootResolver";
import Github from "./models/github/rootResolver";

allServices.User.setRootResolvers(User);
allServices.Auth.setRootResolvers(Auth);
allServices.Event.setRootResolvers(Event);
allServices.Product.setRootResolvers(Product);
allServices.PersonalBestClass.setRootResolvers(PersonalBestClass);
allServices.PersonalBest.setRootResolvers(PersonalBest);
allServices.Github.setRootResolvers(Github);
