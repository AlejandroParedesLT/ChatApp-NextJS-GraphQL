import { Prisma, PrismaClient } from "@prisma/client";
import { PubSub } from "graphql-subscriptions";
import { ISODateString } from 'next-auth'; //Session
import { Context } from "graphql-ws/lib/server";

export interface GraphQLContext {
    session: Session | null;
    prisma: PrismaClient;
    pubsub: PubSub;
  }

/**
 * Users
 */
export interface Session {
    user:User;
    expires: ISODateString;
}

export interface SubscriptionContext extends Context {
    connectionParams: {
      session?: Session;
    };
  }

export interface User {
    id: string;
    username: string;
    email: string;
    emailVerified: boolean;
    image:string;
    name:string;
}


export interface CreateUsernameResponse {
    success?: boolean;
    error?: string;
}