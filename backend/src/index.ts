// npm install @apollo/server express graphql cors body-parser
//import * as React from 'react'
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import {createServer} from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import { PubSub } from "graphql-subscriptions";

import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';

import { typeDefs, resolvers } from './graphql/schema.js';
import * as dotenv from 'dotenv' ;
import { getSession } from 'next-auth/react';
import type { GraphQLContext, Session, SubscriptionContext} from './utils/types.js';
import { PrismaClient } from '@prisma/client';
//import { json } from "body-parser";

//import expressPlayground from 'graphql-playground-middleware-express'
//const graphQLPlayground = expressPlayground.default

/*interface MyContext {
  token?: string;
}*/

async function main() {
    dotenv.config();
    const schema = makeExecutableSchema({ 
        typeDefs, 
        resolvers,
    }); 
    
    const app = express();
    const httpServer = createServer(app);

    const wsServer = new WebSocketServer({
        server: httpServer,
        path: "/graphql/subscriptions",
    });

    const prisma = new PrismaClient();
    const pubsub = new PubSub();

    const getSubscriptionContext = async (
        ctx: SubscriptionContext
      ): Promise<GraphQLContext> => {
        ctx;
        // ctx is the graphql-ws Context where connectionParams live
        if (ctx.connectionParams && ctx.connectionParams.session) {
          const { session } = ctx.connectionParams;
          return { session, prisma, pubsub };
        }
        // Otherwise let our resolvers know we don't have a current user
        return { session: null, prisma, pubsub };
      };

    // Save the returned server's info so we can shutdown this server later
    //const serverCleanup = useServer({ schema }, wsServer);
    // Save the returned server's info so we can shutdown this server later
    const serverCleanup = useServer(
        {
            schema,
            context: (ctx: SubscriptionContext) => {
            // This will be run every time the client sends a subscription request
            // Returning an object will add that information to our
            // GraphQL context, which all of our resolvers have access to.
            return getSubscriptionContext(ctx);
            },
        },
        wsServer
    );


    const server = new ApolloServer({
        schema,
        csrfPrevention: true,
        plugins: [
            ApolloServerPluginDrainHttpServer({ httpServer }),
            {
                async serverWillStart() {
                    return {
                        async drainServer() {
                        await serverCleanup.dispose();
                        },
                    };
                },
            },
        ],
    });
    await server.start();

    const corsOption = {
        origin: process.env['CLIENT_ORIGIN'],
        //origin: '*',
        credentials: true,
    }
    app.use(
        '/graphql',
        cors<cors.CorsRequest>(corsOption),//corsOption
        //bodyParser.json({ limit: '50mb' }),
        bodyParser.json(),
        expressMiddleware(server, {
            context: async ({ req }) :Promise<GraphQLContext> =>
            { 
                //token: req.headers['token'], 
                //console.log('Sesion Backend principal: ',req.headers, req.body, req.params, req.query);
                const session = await getSession({req});
                //console.log('Sesion Backend principal: ',session);
                return {session : session as unknown as Session, prisma, pubsub};
            },
        }),
    );
    //app.get("/playground", graphQLPlayground({ endpoint: "/graphql" }));

    await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve));
    console.log(`🚀 Server ready at http://localhost:4000/graphql`);
}

main().catch((err) => console.log(err))



// Connect the client
//await prisma.$connect()

// Creating the WebSocket server
/*const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/',
});*/