import { Box, Flex } from "@chakra-ui/react";
import { Session } from "next-auth";
import React from "react";

interface FeedWrapperProps {
    session: Session;
}

export const FeedWrapper:React.FC<FeedWrapperProps> = ({
    session
}) => {
  return <div>FeedWrapperProps</div>;
};
