import { Box, Text } from "@chakra-ui/react";
import { Session } from "next-auth";;
import React, { useState } from "react";
import { ConversationModal } from './modal/ConversationModal';

interface ConversationListProps {
  session:Session
}

export const ConversationList : React.FC<ConversationListProps> = ({
  session
}) => {
  const [isOpen, setisOpen] = useState(false);
  const onOpen = () => setisOpen(true);
  const onClose = () => setisOpen(false);
  
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
        <ConversationModal isOpen={isOpen} onClose={onClose}/>
      </Box>
    </>
  )
};
