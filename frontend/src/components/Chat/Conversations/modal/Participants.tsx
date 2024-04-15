import { SearchedUser } from "@/utils/types";
import { Flex, Stack, Text } from "@chakra-ui/react";
import React from "react";
import { RxCross1 } from 'react-icons/rx';
import { ImCross } from 'react-icons/im';


interface ParticipantProps {
    participants: Array<SearchedUser>;
    removeParticipant: (userId:string) => void;

}

export const Participants : React.FC<ParticipantProps> = ({
    participants,
    removeParticipant,
}) => {
    console.log("Participants: ", participants)
    return (
        <Flex mt={8} gap={"10px"} flexWrap={"wrap"}>
            {participants.map((participant) => (
                <Stack key={participant.id} direction={'row'} align={"center"} bg={'whiteAlpha.200'} borderRadius={20} p={2}>
                    <Text>{participant.username}</Text>
                    <RxCross1 color="white" size={20} cursor={'pointer'} onClick={() => removeParticipant(participant.id)}/>
                </Stack>
            ))}
        </Flex>
    );
};
