///import {gql}  from '@apollo/client';
import gql from 'graphql-tag';
//import type { Message } from '../prisma/schema.prisma';  // Adjust the path accordingly

export const userTypeDefs = gql`
  scalar Date
    type User {
        id: String
        name: String
        username: String
        email: String
        emailVerified: Boolean
        image: String
    }
    
    type SearchedUser {
        id: String
        username: String
    }
    type Query {
        searchUsers(username: String): [SearchedUser]
    }
    type Mutation {
        createUsername(username: String): CreateUsernameResponse
    }
    type CreateUsernameResponse {
        success: Boolean
        error: String
    }
`;

export const conversationTypeDefs = gql`
    type Conversation {
    id: String
    #latestMessage: Message
    participants: [Participant]
    #updatedAt: Date
  }

  type Participant {
    id: String
    user: User
    hasSeenLatestMessage: Boolean
  }

  type CreateConversationResponse {
    conversationId: String
  }

  type ConversationDeletedResponse {
    id: String
  }

  type ConversationUpdatedSubscriptionPayload {
    conversation: Conversation
    addedUserIds: [String]
    removedUserIds: [String]
  }

  type Query {
    conversations: [Conversation]
  }

  type Mutation {
    createConversation(participantIds: [String]): CreateConversationResponse
  }

  type Mutation {
    markConversationAsRead(userId: String!, conversationId: String!): Boolean
  }

  type Mutation {
    deleteConversation(conversationId: String!): Boolean
  }

  type Mutation {
    updateParticipants(
      conversationId: String!
      participantIds: [String]!
    ): Boolean
  }

  type Subscription {
    conversationCreated: Conversation
  }

  type Subscription {
    conversationUpdated: ConversationUpdatedSubscriptionPayload
  }

  type Subscription {
    conversationDeleted: ConversationDeletedResponse
  }
`;

export const MessageTypeDefs = gql`
  type Message {
    id: String
    sender: User
    body: String
    createdAt: Date
  }

  type Query {
    messages(conversationId: String): [Message]
  }

  type Mutation {
    sendMessage(
      id: String
      conversationId: String
      senderId: String
      body: String
    ): Boolean
  }

  type Subscription {
    messageSent(conversationId: String): Message
  }
`;