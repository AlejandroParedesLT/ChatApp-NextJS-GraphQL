import {conversationTypeDefs, userTypeDefs}  from './typeDefs.js';
import {conversationResolver, userResolver} from './resolvers.js';
import merge from "lodash.merge"

export const typeDefs = [userTypeDefs, conversationTypeDefs]

export const resolvers = merge({}, userResolver, conversationResolver)