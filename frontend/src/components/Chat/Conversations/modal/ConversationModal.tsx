import { useLazyQuery, useMutation } from '@apollo/client';
import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, Stack, Input } from '@chakra-ui/react';
import React, { useState } from "react";
import userOperation from '../../../../graphql/operations/users'
import ConversationOperation from '../../../../graphql/operations/conversations'
import { CreateConversationData, CreateConversationInput, SearchUsersData, SearchUsersInput, SearchedUser } from '@/utils/types';
import { UserSearchList } from './userSearchList';
import { Participants } from './Participants';
import toast from 'react-hot-toast';
import { Session } from "next-auth";
import { useRouter } from 'next/router';

interface ModalProps {
  session: Session;
  isOpen: boolean;
  onClose: () => void;
}

export const ConversationModal:React.FC<ModalProps> = ({session, isOpen, onClose}) => {
  console.log("Conversations modal automated", session.session.user.id)
  const {session:{user : sessionUser}} = session;

  const router = useRouter();

  const [username, setuserName] = useState("");
  const [participants, setparticipants] = useState<Array<SearchedUser>>([]);

  const [searchUsers, {data, error, loading}] = useLazyQuery<SearchUsersData, SearchUsersInput>(userOperation.Queries.searchUsers);

  const [createConversation, {loading:CreateConversationLoading} ] = useMutation<CreateConversationData, CreateConversationInput>(ConversationOperation.Mutations.createConversation)
  
  const onSearch = async (event:React.FormEvent) => {
    event.preventDefault();
    searchUsers({variables:{username}})
    console.log("Inside Onsubmit", username)
  };
  
  const addParticipant = (user: SearchedUser) => {
    setparticipants(prev => [...prev, user]);
  }

  const removeParticipant = (userId: string) => {
    setparticipants(prev => prev.filter((p) => p.id !== userId));
  }

  const onCreateConversation =async () => {
    const participantIds = [sessionUser?.id, ...participants.map((p) => p.id)];
    try {
      console.log("Participantes desde el frontend: ", participantIds)
      const {data } = await createConversation({
        variables: {
          participantIds,
        },
      });
      //console.log("Data from Conversation Modal", data)
      if (!data?.createConversation) {
        throw new Error("Failed to create a conversation")
      }

      const {
        createConversation : {conversationId}
      } = data;

      router.push({query: {conversationId}})
      /**
       * Clear state and close modal
       * on successful creation
       */
      setparticipants([]);
      setuserName('');
      onClose();

    } catch (error) {
      console.log('onCreateConversation error', error);
      toast.error(error?.message);
    }
    
  }
  //console.log("Here is seach data: ", data);

  return (
    <>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent bg={"#2d2d2d"} pb={4} color={'whiteAlpha.500'}>
              <ModalHeader color={'whiteAlpha.500'}>Create a conversation</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                  <form onSubmit={onSearch}>
                    <Stack spacing={4}>
                      <Input 
                        placeholder='Enter a username'
                        value={username}
                        onChange={event => setuserName(event.target.value)}
                      />
                      <Button type='submit' isDisabled={!username} isLoading={loading} color={'gray.300'} bg={'gray.500'}>Search</Button>
                    </Stack>
                  </form>
                  {data?.searchUsers && (<UserSearchList users = {data.searchUsers} addParticipant={addParticipant}/>)}
                  {participants.length !== 0 && (
                  <>
                    <Participants participants={participants} removeParticipant={removeParticipant}/>
                    <Button bg={'gray.500'} width={'100%'} mt={6} _hover={{bg:'gray.400'}} onClick={onCreateConversation} isLoading={CreateConversationLoading}>
                      Create Conversation
                    </Button>
                  </>)}
              </ModalBody>
          </ModalContent>
        </Modal>
    </>
  )
};
