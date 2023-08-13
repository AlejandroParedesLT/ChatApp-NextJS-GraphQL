import {userTypeDefs}  from './typeDefs.js';
import {userResolver} from './resolvers.js';
import merge from "lodash.merge"

export const typeDefs = [userTypeDefs]

export const resolvers = merge({}, userResolver)