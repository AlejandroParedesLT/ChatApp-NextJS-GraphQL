/* eslint-disable jsx-a11y/alt-text */
import { useMutation } from '@apollo/client';
import {useState} from 'react';
import { Button, Center, Image, Input, Stack, Text } from '@chakra-ui/react';
import { signIn } from 'next-auth/react';
import { Session } from 'next-auth';
import UserOperations from '../../graphql/operations/users';
import toast from "react-hot-toast";
import { CreateUsernameData, CreateUsernameVariables } from '@/utils/types';

interface AuthProps {
    session: Session | null,
    reloadSession: () => void,
}

const Auth: React.FC<AuthProps> = ({ session, reloadSession }) => {
    const [username, setUsername] = useState("")
    const [createUsername, { data, loading, error }] = useMutation<
        CreateUsernameData,
        CreateUsernameVariables
    >(UserOperations.Mutations.createUsername);

    const onSubmit = async () => {
        console.log('Here is data: ',session, data, loading, error )
        if (!username) return;

        try {
        const { data } = await createUsername({
            variables: {
            username,
            },
        });

        if (!data?.createUsername) {
            throw new Error();
        }

        if (data.createUsername.error) {
            const {
            createUsername: { error },
            } = data;

            toast.error(error);
            return;
        }

        toast.success("Username successfully created");

        /**
         * Reload session to obtain new username
         */
        reloadSession();
        } catch (error) {
        toast.error("There was an error");
        console.log("onSubmit error", error);
        }
    };
  
    return (
        <div>
            <Center height={"100vh"}>
                <Stack spacing={8} align="center">
                    {session ? 
                        (
                            <>
                                <Text fontSize={"3xl"}>Create a Username</Text>
                                <Input
                                    placeholder="Enter a username"
                                    value={username}
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                                        setUsername(event.target.value)
                                    }
                                />
                                <Button onClick={onSubmit} width="100%" isLoading={loading}>
                                Save
                                </Button>
                            </>
                        ):
                        (
                            <>
                                <Text>Google Account</Text>
                                <Button onClick={()=>signIn('google')} leftIcon={<Image height='20px' src='/images/googlelogo.png'/>}>Login with Google</Button>
                            </>
                        )
                    }
                </Stack>
            </Center>
        </div>
    )
};

export default Auth;


/*
<Button width={'100%'} onClick={(e) => {
                                    e.preventDefault();
                                    
                                    onSubmit();
                                }}>Save</Button>
*/
