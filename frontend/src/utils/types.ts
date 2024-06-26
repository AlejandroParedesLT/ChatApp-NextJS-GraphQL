import { ConversationPopulated } from '../../../backend/src/utils/types';
/**
 * Users
 */

export interface CreateUsernameData {
    createUsername: {
        success: boolean,
        error: string,
    },
}

export interface CreateUsernameVariables {
    username: string,
}

export interface SearchUsersInput {
    username: string,
}

export interface SearchUsersData {
    searchUsers: Array<SearchedUser>,
}

export interface SearchedUser {
    id: string,
    username: string,
}

/**
 * Conversations
 */

export interface CreateConversationData {
    createConversation: {
        conversationId: string;
    };
}

export interface CreateConversationInput {
    participantIds: Array<string>;
}

export interface ConversationsData {
    conversations: Array<ConversationPopulated>
}