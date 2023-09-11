import { useLazyQuery } from '@apollo/client';
import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, Stack, Input } from '@chakra-ui/react';
import React, { useState } from "react";
import userOperation from '../../../../graphql/operations/users'
import { SearchUsersData, SearchUsersInput } from '@/utils/types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConversationModal:React.FC<ModalProps> = ({isOpen, onClose}) => {
  const [userName, setuserName] = useState("");

  const [searchUsers, {data, error, loading}] = useLazyQuery<SearchUsersData, SearchUsersInput>(userOperation.Queries.searchUsers);
  
  const onSearch = async (event:React.FormEvent) => {
    event.preventDefault();
    searchUsers({variables:{userName}})
    console.log("Inside Onsubmit", userName)
  };
  
  console.log("Here is seach data: ", data);

  return (
    <>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent bg={"#2d2d2d"} pb={4}>
              <ModalHeader>Find a user</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                  <form onSubmit={onSearch}>
                    <Stack spacing={4}>
                      <Input 
                        placeholder='Enter a username'
                        value={userName}
                        onChange={event => setuserName(event.target.value)}
                      />
                      <Button type='submit' isDisabled={!userName} isLoading={loading}>Search</Button>
                    </Stack>
                  </form>
              </ModalBody>
          </ModalContent>
        </Modal>
    </>
  )
};
