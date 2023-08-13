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
import { typeDefs, resolvers } from './graphql/schema';
async function main() {
    const schema = makeExecutableSchema({ typeDefs, resolvers });
    const app = express();
    const httpServer = http.createServer(app);
    // Creating the WebSocket server
    const wsServer = new WebSocketServer({
        server: httpServer,
        path: '/',
    });
    // Save the returned server's info so we can shutdown this server later
    const serverCleanup = useServer({ schema }, wsServer);
    const server = new ApolloServer({
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
    app.use('/', cors(), bodyParser.json(), expressMiddleware(server, {
        context: async ({ req }) => ({ token: req.headers.token }),
    }));
    await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
    console.log(`🚀 Server ready at http://localhost:4000/`);
}
main().catch((err) => console.log(err));
