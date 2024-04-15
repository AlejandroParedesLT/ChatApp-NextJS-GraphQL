import { Box, Text } from "@chakra-ui/react";
import { Session } from "next-auth";;
import React, { useState } from "react";
import { ConversationModal } from './modal/ConversationModal';
import { ConversationPopulated } from "../../../../../backend/src/utils/types";
import { ConversationItem } from "./ConversationItem";

interface ConversationListProps {
  session:Session;
  conversations: Array<ConversationPopulated>;
}

export const ConversationList : React.FC<ConversationListProps> = ({
  session,
  conversations,
}) => {
  const [isOpen, setisOpen] = useState(false);
  const onOpen = () => setisOpen(true);
  const onClose = () => setisOpen(false);
  
  console.log('Conversations reference', conversations)

  return (
    <>
      <Box width="100%" bg={"blackAlpha.700"}>
        <Box 
          py={2} 
          px={4} 
          mb={4}
          bg="blackAlpha.300"
          borderRadius={10}
          cursor="pointer"
          onClick={onOpen}
        >
          <Text textAlign={'center'} color={'whiteAlpha.800'} fontWeight={500}>
            Find or start a conversation
          </Text>
        </Box>
        
        <ConversationModal session = {session} isOpen={isOpen} onClose={onClose}/>

        {conversations.map((conversation) => (
          <ConversationItem key={conversation.id} conversation={conversation} />
        ))}
      
      </Box>
    </>
  )
};
