import { Prisma, type User } from '@prisma/client';
import {ApolloError} from "apollo-server-core";
import { withFilter } from "graphql-subscriptions";
import { GraphQLError } from "graphql";
//import { userIsConversationParticipant } from "../utils/functions";
import { GraphQLScalarType, Kind } from "graphql";

import type {
    ConversationPopulated,
    ConversationUpdatedSubscriptionData,
    ConversationCreatedSubscriptionPayload,
    ConversationDeletedSubscriptionPayload,
    CreateUsernameResponse,
    MessagePopulated,
    SendMessageArguments,
    SendMessageSubscriptionPayload,
    GraphQLContext,
    ParticipantPopulated,
  } from '../utils/types';

export const userResolver = {
    Query: {
        searchUsers: async (
            _: any,
            args: {username: string},
            context: GraphQLContext
        ): Promise<Array<User>> => {
            const {username: searchedUsername} = args;
            const {session, prisma} = context;
            
            console.log('Llego a la session: ', session);
            
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


export const conversationResolver = {
    Query: {
        conversations: async function getConversations(
          _: any,
          //args: Record<string, never>,
          context: GraphQLContext
        ): Promise<Array<ConversationPopulated>> {
          const { session, prisma } = context;
    
          if (!session?.user) {
            throw new GraphQLError("Not authorized");
          }
    
          try {
            const { id } = session.user;
            /**
             * Find all conversations that user is part of
             */
            const conversations = await prisma.conversation.findMany({
              /**
               * Below has been confirmed to be the correct
               * query by the Prisma team. Has been confirmed
               * that there is an issue on their end
               * Issue seems specific to Mongo
               */
              // where: {
              //   participants: {
              //     some: {
              //       userId: {
              //         equals: id,
              //       },
              //     },
              //   },
              // },
              include: conversationPopulated,
            });
    
            /**
             * Since above query does not work
             */
            return conversations.filter(
              (conversation) =>
                !!conversation.participants.find((p) => p.userId === id)
            );
          } catch (error: any) {
            console.log("error", error);
            throw new GraphQLError(error?.message);
          }
        },
      },
      Mutation: {
        createConversation: async function (
          _: any,
          args: { participantIds: Array<string> },
          context: GraphQLContext
        ): Promise<{ conversationId: string }> {
          const { session, prisma, pubsub } = context;
          const { participantIds } = args;
    
          if (!session?.user) {
            throw new GraphQLError("Not authorized");
          }
    
          const { id: userId } = session.user;
    
          try {
            /**
             * create Conversation entity
             */
            const conversation = await prisma.conversation.create({
              data: {
                participants: {
                  createMany: {
                    data: participantIds.map((id) => ({
                      userId: id,
                      hasSeenLatestMessage: id === userId,
                    })),
                  },
                },
              },
              include: conversationPopulated,
            });
    
            pubsub.publish("CONVERSATION_CREATED", {
              conversationCreated: conversation,
            });
    
            return { conversationId: conversation.id };
          } catch (error) {
            console.log("createConversation error", error);
            throw new GraphQLError("Error creating conversation");
          }
        },
        markConversationAsRead: async function (
          _: any,
          args: { userId: string; conversationId: string },
          context: GraphQLContext
        ): Promise<boolean> {
          const { userId, conversationId } = args;
          const { session, prisma } = context;
    
          if (!session?.user) {
            throw new GraphQLError("Not authorized");
          }
    
          try {
            await prisma.conversationParticipant.updateMany({
              where: {
                userId,
                conversationId,
              },
              data: {
                hasSeenLatestMessage: true,
              },
            });
    
            return true;
          } catch (error: any) {
            console.log("markConversationAsRead error", error);
            throw new GraphQLError(error.message);
          }
        },
        deleteConversation: async function (
          _: any,
          args: { conversationId: string },
          context: GraphQLContext
        ): Promise<boolean> {
          const { session, prisma, pubsub } = context;
          const { conversationId } = args;
    
          if (!session?.user) {
            throw new GraphQLError("Not authorized");
          }
    
          try {
            /**
             * Delete conversation and all related entities
             */
            const [deletedConversation] = await prisma.$transaction([
              prisma.conversation.delete({
                where: {
                  id: conversationId,
                },
                include: conversationPopulated,
              }),
              prisma.conversationParticipant.deleteMany({
                where: {
                  conversationId,
                },
              }),
              prisma.message.deleteMany({
                where: {
                  conversationId,
                },
              }),
            ]);
    
            pubsub.publish("CONVERSATION_DELETED", {
              conversationDeleted: deletedConversation,
            });
    
            return true;
          } catch (error: any) {
            console.log("deleteConversation error", error);
            throw new GraphQLError(error?.message);
          }
        },
        updateParticipants: async function (
          _: any,
          args: { conversationId: string; participantIds: Array<string> },
          context: GraphQLContext
        ): Promise<boolean> {
          const { session, prisma, pubsub } = context;
          const { conversationId, participantIds } = args;
    
          if (!session?.user) {
            throw new GraphQLError("Not authorized");
          }
    
          const {
            user: { id: userId },
          } = session;
    
          try {
            const participants = await prisma.conversationParticipant.findMany({
              where: {
                conversationId,
              },
            });
    
            const existingParticipants = participants.map((p) => p.userId);
    
            const participantsToDelete = existingParticipants.filter(
              (id) => !participantIds.includes(id)
            );
    
            const participantsToCreate = participantIds.filter(
              (id) => !existingParticipants.includes(id)
            );
    
            const transactionStatements = [
              prisma.conversation.update({
                where: {
                  id: conversationId,
                },
                data: {
                  participants: {
                    deleteMany: {
                      userId: {
                        in: participantsToDelete,
                      },
                      conversationId,
                    },
                  },
                },
                include: conversationPopulated,
              }),
            ];
    
            if (participantsToCreate.length) {
              transactionStatements.push(
                prisma.conversation.update({
                  where: {
                    id: conversationId,
                  },
                  data: {
                    participants: {
                      createMany: {
                        data: participantsToCreate.map((id) => ({
                          userId: id,
                          hasSeenLatestMessage: true,
                        })),
                      },
                    },
                  },
                  include: conversationPopulated,
                })
              );
            }
    
            const [deleteUpdate, addUpdate] = await prisma.$transaction(
              transactionStatements
            );
    
            pubsub.publish("CONVERSATION_UPDATED", {
              conversationUpdated: {
                conversation: addUpdate || deleteUpdate,
                addedUserIds: participantsToCreate,
                removedUserIds: participantsToDelete,
              },
            });
    
            return true;
          } catch (error: any) {
            console.log("updateParticipants error", error);
            throw new GraphQLError(error?.message);
          }
        },
      },
      Subscription: {
        conversationCreated: {
          subscribe: withFilter(
            (_: any, __: any, context: GraphQLContext) => {
              const { pubsub } = context;
    
              return pubsub.asyncIterator(["CONVERSATION_CREATED"]);
            },
            (
              payload: ConversationCreatedSubscriptionPayload,
              _,
              context: GraphQLContext
            ) => {
              const { session } = context;
    
              if (!session?.user) {
                throw new GraphQLError("Not authorized");
              }
    
              const { id: userId } = session.user;
              const {
                conversationCreated: { participants },
              } = payload;
    
              return userIsConversationParticipant(participants, userId);
            }
          ),
        },
        conversationUpdated: {
          subscribe: withFilter(
            (_: any, __: any, context: GraphQLContext) => {
              const { pubsub } = context;
    
              return pubsub.asyncIterator(["CONVERSATION_UPDATED"]);
            },
            (
              payload: ConversationUpdatedSubscriptionData,
              _,
              context: GraphQLContext
            ) => {
              const { session } = context;
    
              if (!session?.user) {
                throw new GraphQLError("Not authorized");
              }
    
              const { id: userId } = session.user;
              const {
                conversationUpdated: {
                  conversation: { participants },
                  //addedUserIds,
                  removedUserIds,
                },
              } = payload;
    
              const userIsParticipant = userIsConversationParticipant(
                participants,
                userId
              );
    
              const userSentLatestMessage =
                payload.conversationUpdated.conversation.latestMessage?.senderId ===
                userId;
    
              const userIsBeingRemoved =
                removedUserIds &&
                Boolean(removedUserIds.find((id) => id === userId));
    
              return (
                (userIsParticipant && !userSentLatestMessage) ||
                userSentLatestMessage ||
                userIsBeingRemoved
              );
            }
          ),
        },
        conversationDeleted: {
          subscribe: withFilter(
            (_: any, __: any, context: GraphQLContext) => {
              const { pubsub } = context;
    
              return pubsub.asyncIterator(["CONVERSATION_DELETED"]);
            },
            (
              payload: ConversationDeletedSubscriptionPayload,
              _,
              context: GraphQLContext
            ) => {
              const { session } = context;
    
              if (!session?.user) {
                throw new GraphQLError("Not authorized");
              }
    
              const { id: userId } = session.user;
              const {
                conversationDeleted: { participants },
              } = payload;
    
              return userIsConversationParticipant(participants, userId);
            }
          ),
        },
    },
};

export const messagesResolvers = {
    Query: {
      messages: async function (
        _: any,
        args: { conversationId: string },
        context: GraphQLContext
      ): Promise<Array<MessagePopulated>> {
        const { session, prisma } = context;
        const { conversationId } = args;
  
        if (!session?.user) {
          throw new GraphQLError("Not authorized");
        }
  
        const {
          user: { id: userId },
        } = session;
  
        /**
         * Verify that user is a participant
         */
        const conversation = await prisma.conversation.findUnique({
          where: {
            id: conversationId,
          },
          include: conversationPopulated,
        });
  
        if (!conversation) {
          throw new GraphQLError("Conversation Not Found");
        }
  
        const allowedToView = userIsConversationParticipant(
          conversation.participants,
          userId
        );
  
        if (!allowedToView) {
          throw new Error("Not Authorized");
        }
  
        try {
          const messages = await prisma.message.findMany({
            where: {
              conversationId,
            },
            include: messagePopulated,
            orderBy: {
              createdAt: "desc",
            },
          });
  
          return messages;
        } catch (error: any) {
          console.log("messages error", error);
          throw new GraphQLError(error?.message);
        }
      },
    },
    Mutation: {
      sendMessage: async function (
        _: any,
        args: SendMessageArguments,
        context: GraphQLContext
      ): Promise<boolean> {
        const { session, prisma, pubsub } = context;
  
        if (!session?.user) {
          throw new GraphQLError("Not authorized");
        }
  
        const { id: userId } = session.user;
        const { id: messageId, senderId, conversationId, body } = args;
  
        try {
          /**
           * Create new message entity
           */
          const newMessage = await prisma.message.create({
            data: {
              id: messageId,
              senderId,
              conversationId,
              body,
            },
            include: messagePopulated,
          });
  
          /**
           * Could cache this in production
           */
          const participant = await prisma.conversationParticipant.findFirst({
            where: {
              userId,
              conversationId,
            },
          });
  
          /**
           * Should always exist
           */
          if (!participant) {
            throw new GraphQLError("Participant does not exist");
          }
  
          const { id: participantId } = participant;
  
          /**
           * Update conversation latestMessage
           */
          const conversation = await prisma.conversation.update({
            where: {
              id: conversationId,
            },
            data: {
              latestMessageId: newMessage.id,
              participants: {
                update: {
                  where: {
                    id: participantId,
                  },
                  data: {
                    hasSeenLatestMessage: true,
                  },
                },
                updateMany: {
                  where: {
                    NOT: {
                      userId,
                    },
                  },
                  data: {
                    hasSeenLatestMessage: false,
                  },
                },
              },
            },
            include: conversationPopulated,
          });
  
          pubsub.publish("MESSAGE_SENT", { messageSent: newMessage });
          pubsub.publish("CONVERSATION_UPDATED", {
            conversationUpdated: {
              conversation,
            },
          });
  
          return true;
        } catch (error) {
          console.log("sendMessage error", error);
          throw new GraphQLError("Error sending message");
        }
      },
    },
    Subscription: {
      messageSent: {
        subscribe: withFilter(
          (_: any, __: any, context: GraphQLContext) => {
            const { pubsub } = context;
  
            return pubsub.asyncIterator(["MESSAGE_SENT"]);
          },
          (
            payload: SendMessageSubscriptionPayload,
            args: { conversationId: string },
            //context: GraphQLContext
          ) => {
            return payload.messageSent.conversationId === args.conversationId;
          }
        ),
      },
    },
};   

export const dateScalarResolver = new GraphQLScalarType({
  name: "Date",
  description: "Date custom scalar type",
  serialize(value: any) {
    return value.getTime(); // Convert outgoing Date to integer for JSON
  },
  parseValue(value: any) {
    return new Date(value); // Convert incoming integer to Date
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return new Date(parseInt(ast.value, 10)); // Convert hard-coded AST string to integer and then to Date
    }
    return null; // Invalid hard-coded value (not an integer)
  },
});


export const participantPopulated =
  Prisma.validator<Prisma.ConversationParticipantInclude>()({
    user: {
      select: {
        id: true,
        username: true,
      },
    },
  });

export const conversationPopulated =
  Prisma.validator<Prisma.ConversationInclude>()({
    participants: {
      include: participantPopulated,
    },
    latestMessage: {
      include: {
        sender: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    },
  });

export const messagePopulated = 
Prisma.validator<Prisma.MessageInclude>()({
sender: {
    select: {
    id: true,
    username: true,
    },
},
});


export const userIsConversationParticipant = (
    participants: Array<ParticipantPopulated>,
    userId: string
  ): boolean => {
    return !!participants.find((participant) => participant.userId === userId);
  }