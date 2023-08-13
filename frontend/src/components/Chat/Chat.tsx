import { Button } from '@chakra-ui/react';
import * as React from 'react';
import { signOut } from 'next-auth/react';

interface IChatProps {}

const Chat: React.FC<IChatProps> = (props) => {
  return (
    <div>
      CHAT
      <Button onClick={() => signOut()}>Logut</Button>
    </div>
  )
};

export default Chat;
