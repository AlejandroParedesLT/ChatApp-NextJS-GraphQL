import type { User } from '@prisma/client';
import type { CreateUsernameResponse, GraphQLContext } from '../utils/types'; //, User
import {ApolloError} from "apollo-server-core";

export const userResolver = {
    Query: {
        searchUsers: async (
            _: any,
            args: {username: string},
            context: GraphQLContext
        ): Promise<Array<User>> => {
            const {username: searchedUsername} = args;
            const {session, prisma} = context;
            
            console.log(session);
            
            if (!session?.user){
                throw new ApolloError("Not Authorize")
            }

            const {
                user: {username: myUsername},
            } = session;

            try {
                const users = await prisma.user.findMany({
                    where : {
                        username: {
                            contains: searchedUsername,
                            not: myUsername,
                            mode: "insensitive"
                        }
                    }
                })
                return users;
            } catch (error:any) {
                console.log('searchUsers error', error);
                throw new ApolloError(error);
            }

        }
    },
    Mutation: {
        createUsername: async (_: any, args:{username: string}, context:GraphQLContext):Promise<CreateUsernameResponse> => {
            const {username} = args;
            const {session, prisma} = context;
            //console.log('Hey at the API: ', username)
            //console.log('Here is te context ', context.session)
            //console.log('Here is te Session ', session)
            //console.log('Hey at the Cont: ', session)

            if(!session?.user){
                return {
                    error: "Not Authorized",
                };
            }
            const {id: userId} = session.user;
            try {
                const existingUser = await prisma.user.findUnique({
                    where: {
                        username,
                    }
                })
                if (existingUser) {
                    return {
                        error: "Username already taken"
                    }
                }
                await prisma.user.update({
                    where: {
                        id: userId
                    },
                    data: {
                        username,
                    }
                })
                return {success:true};
            } catch (error: any ) {
                //console.log("createUsername error", error);
                return {
                    error: error?.message
                }
            }
        }
    },
    //Subscription: {},
}