import type { CreateUsernameResponse, GraphQLContext } from '../utils/types'; //, User

export const userResolver = {
    Query: {
        searchUsers: () => {}
    },
    Mutation: {
        createUsername: async (_: any, args:{username: string}, context:GraphQLContext):Promise<CreateUsernameResponse> => {
            const {username} = args;
            const {session, prisma} = context;
            //console.log('Hey at the API: ', username)
            console.log('Resolvers.ts backend: ', session?.user)
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