import { Button, Flex } from '@chakra-ui/react';
import * as React from 'react';
import { signOut } from 'next-auth/react';
import ConversationsWrapper from './Conversations/ConversationsWrapper';
import { ConversationList } from './Conversations/ConversationList';
import { Session } from 'next-auth';
import { FeedWrapper } from './Feed/FeedWrapper';

interface ChatProps {
  session:Session
}

const Chat: React.FC<ChatProps> = (session) => {
  return (
    <Flex height="100vh" >
      <ConversationsWrapper session={session} />
      <FeedWrapper session={session}/>
    </Flex>
  )
};

export default Chat;
