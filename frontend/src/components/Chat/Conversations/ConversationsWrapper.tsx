import { Box } from "@chakra-ui/react";
import { Session } from "next-auth";
import { ConversationList } from "./ConversationList";
import { useLazyQuery, useQuery } from "@apollo/client";
import ConversationOperations from "../../../graphql/operations/conversations"
import toast from "react-hot-toast";
import { ConversationsData } from "@/utils/types";

interface ConversationsWrapperProps {
    session: Session;
};

const ConversationsWrapper: React.FC<ConversationsWrapperProps> = ({
    session,
}) => {
    console.log('Query enviado al server',ConversationOperations.Queries.conversations )
    
    /*  
    const [searchUsers, {data, error, loading}] = useLazyQuery<ConversationsData, null>(ConversationOperations.Queries.conversations);

    <ConversationList session={session} conversations={conversationData?.conversations || []}/>
        */
    
    const {
        data: conversationsData,
        loading: conversationsLoading,
        error: conversationsError,
        subscribeToMore,
      } = useQuery<ConversationsData, null>(
        ConversationOperations.Queries.conversations,
        {
          onError: ({ message }) => {
            toast.error(message);
          },
        }
      );
    
        console.log('Otro marcador desde aqui afuera',conversationsData)
    
    return (
        <Box width={{ base:"100%", md:"400px" }} bg="blackAlpha.700" py={6} px={3}>
            {/* Sekeleton Loader */}
            <ConversationList session={session} conversations={conversationsData?.conversations || []}/>
        </Box>
    )
}
export default ConversationsWrapper;