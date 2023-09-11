import { Box } from "@chakra-ui/react";
import { Session } from "next-auth";
import { ConversationList } from "./ConversationList";

interface ConversationsWrapperProps {
    session: Session;
};

const ConversationsWrapper: React.FC<ConversationsWrapperProps> = ({
    session,
}) => {
    return (
        <Box width={{ base:"100%", md:"400px" }} bg="blackAlpha.700" py={6} px={3}>
            {/* Sekeleton Loader */}
            <ConversationList session={session} />
        </Box>
    )
}
export default ConversationsWrapper;