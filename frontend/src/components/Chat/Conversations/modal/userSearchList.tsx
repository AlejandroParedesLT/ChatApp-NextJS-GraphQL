import { SearchedUser } from "@/utils/types";
import { Avatar, Flex, Stack, Text } from "@chakra-ui/react";
import React from "react";

interface UserSearchListProps {
    users: Array<SearchedUser>;
    addParticipant: (user:SearchedUser) => void;
}

export const UserSearchList: React.FC<UserSearchListProps> = ({users, addParticipant}) => {
    const onChangePage = () => {
        console.log('Clicked Element')
    }
    return (
    <>
        {users.length === 0 ? (
            <Text>No Users found</Text>
        ): (
            <Stack mt={6}>
                {users.map(user=>(
                    <div onClick={() => addParticipant(user)}>
                        <Stack 
                            key={user.id}
                            direction={'row'} 
                            align={'center'} 
                            spacing={4} 
                            py={6} 
                            px={10} 
                            borderRadius={10}
                            _hover={{bg:'whiteAlpha.300'}}
                        >
                            <Avatar />
                            
                                <Flex justify={'space-between'} align={'center'} width={'100%'}>
                                    <Text color={'whiteAlpha.500'}>{user.username}</Text>
                                </Flex>
                            
                        </Stack>
                    </div>
                ))}
            </Stack>
        )
        }
    </>
    )
};
