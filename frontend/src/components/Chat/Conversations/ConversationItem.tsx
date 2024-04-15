import React from "react";
import { ConversationPopulated } from "../../../../../backend/src/utils/types";
import { Stack, Text } from "@chakra-ui/react";

interface ConversationItemProps {
    conversation: ConversationPopulated;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({conversation}) => {
    //console.log("CONVERSATION", conversation);
    return (
        <Stack border={'1px solid red'} >
            <Text color={'whiteAlpha.800'}>{conversation.id}</Text>
        </Stack>
    )
};


/*p={4} _hover={{bg:"whiteAlpha.200"}} borderRadius={4}*/