import { Box, Flex } from "@chakra-ui/react";
import { Session } from "next-auth";
import { useRouter } from "next/router";
import React from "react";

interface FeedWrapperProps {
    session: Session;
}

export const FeedWrapper:React.FC<FeedWrapperProps> = ({
    session
}) => {
  const router = useRouter();
  const {conversationId} = router.query;

  return (
    <Flex display={{base: conversationId ? 'flex' : 'none', md:"flex"}} width="100%" direction={'column'} border={'solid red'}>
      {conversationId ? (
        <Flex>{conversationId}</Flex>
      ) : (
        <div>No conversation Selected</div>
      )}
    </Flex>
  )
};
