import { gql } from "@apollo/client";
import { MessageFields } from "./messages";

const ConversationFields = `
  id
  updatedAt
  participants {
    user {
      id
      username
    }
  }
`;

/*
const ConversationFields = `
  id
  updatedAt
  participants {
    user {
      id
      username
    }
    hasSeenLatestMessage
  }
  latestMessage {
    ${MessageFields}
  }
`;
*/

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    Queries: {
      conversations: gql`
        query Conversations {
          conversations {
            ${ConversationFields}
          }
        }
      `,
    },
    Mutations: {
        createConversation: gql`
        mutation CreateConversation($participantIds: [String]!) {
            createConversation(participantIds: $participantIds) {
            conversationId
            }
        }
        `,
    }
}