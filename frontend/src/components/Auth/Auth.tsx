/* eslint-disable jsx-a11y/alt-text */
import { useMutation } from '@apollo/client';
import {useState} from 'react';
import { Button, Center, Image, Input, Stack, Text } from '@chakra-ui/react';
import { signIn } from 'next-auth/react';
import { Session } from 'next-auth';
import UserOperations from '../../graphql/operations/user';
import toast from "react-hot-toast";
import { CreateUsernameData, CreateUsernameVariables } from '@/utils/type';

interface AuthProps {
    session: Session | null,
    reloadSession: () => void,
}

const Auth: React.FunctionComponent<AuthProps> = ({session, reloadSession}) => {
    const [username, setUsername] = useState("")
    const [CreateUsername, {data, loading, error}] = useMutation<CreateUsernameData,CreateUsernameVariables>(UserOperations.Mutations.createUsername)
    
    console.log("Here is Data", data, loading, error, username);

    const onSubmit = async () => { //e
        //e.preventDefault()
        if (!username) return;
        console.log(username)
        try {
            const {data} = await CreateUsername({variables:{username}})
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
            console.log("onSubmit error", error)
        }
    }
  
    return (
        <div>
            <Center height={"100vh"}>
                <Stack spacing={8} align="center">
                    {session ? 
                        (
                            <>
                                <Text fontSize={"3xl"}>Create a Username</Text>
                                <Input placeholder='Enter a username' value={username} onChange={(event)=> setUsername(event.target.value)}/>
                                <Button width={'100%'} onClick={onSubmit}>Save</Button>
                            </>
                        ):
                        (
                            <>
                                <Text>Messenger Account</Text>
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
