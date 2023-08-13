import Auth from "@/components/Auth/Auth";
import Chat from "@/components/Chat/Chat";
import { Box } from "@chakra-ui/react";
import { NextPageContext } from "next";
import { getSession, useSession } from "next-auth/react";
//import { Session } from  "next-auth";

export default function Home() {
  const {data: session} = useSession();
  console.log('Call from index.tsx frontend: ', session)
  const reloadSessionf = () => {};
  return (
    <Box>{
      session?.user?.username ? 
        <Chat /> : 
        <Auth session={session} reloadSession={reloadSessionf} />
    }</Box>
  )
}

export async function getServerSideProps(ctx: NextPageContext) {
  const session = await getSession(ctx);
  return {
    props: {
      session,
    },
  };
}
/*<div>
  {data?.user ? 
    (
      <button onClick={()=>signOut()}>Sign Out</button>
    ) :
    (
      <button onClick={()=>signIn('google')}>Sign In</button>
    )
  }
</div>*/