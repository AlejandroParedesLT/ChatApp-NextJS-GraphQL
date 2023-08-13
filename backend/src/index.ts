// npm install @apollo/server express graphql cors body-parser
//import * as React from 'react'
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';

import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';

import { typeDefs, resolvers } from './graphql/schema.js';
import * as dotenv from 'dotenv' ;
import { getSession } from 'next-auth/react';
import type { GraphQLContext, Session } from './utils/types.js';
import { PrismaClient } from '@prisma/client'

interface MyContext {
  token?: string;
}

async function main() {
    dotenv.config();
    const schema = makeExecutableSchema({ typeDefs, resolvers }); 
    
    const app = express();
    const httpServer = http.createServer(app);

    const corsOption = {
        origin: process.env['CLIENT_ORIGIN'],
        //origin: '*',
        credentials: true,
    }

    const prisma = new PrismaClient()

    // Connect the client
    //await prisma.$connect()
    
    // Creating the WebSocket server
    const wsServer = new WebSocketServer({
        server: httpServer,
        path: '/',
    });
    
    // Save the returned server's info so we can shutdown this server later
    const serverCleanup = useServer({ schema }, wsServer);

    const server = new ApolloServer<MyContext>({
        schema,
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

    app.use(
    '/graphql',
    cors<cors.CorsRequest>(corsOption),//corsOption
    bodyParser.json({ limit: '50mb' }),
    expressMiddleware(server, {
        context: async ({ req }) :Promise<GraphQLContext> =>
        { 
            //token: req.headers['token'], 
            const session = await getSession({req});
            console.log('Sesion Backend principal: ',session);
            return {session : session as Session, prisma};
        },
    }),
    );

    await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve));
    console.log(`🚀 Server ready at http://localhost:4000/`);
}

main().catch((err) => console.log(err))