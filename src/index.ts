import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import { typeDefs } from './schema/typeDefs';
import { resolvers } from './schema/resolvers';
import { prisma } from './config/prisma';
import { formatError } from './utils/errors';
import { createLoaders, Context } from './utils/dataLoaders';
import { apiLimiter } from './middleware/rateLimiter';
import { graphqlRateLimiter } from './middleware/graphqlRateLimiter';

// Create and configure Express app without starting the server
export async function createApp(): Promise<express.Application> {
  const app = express();
  
  const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.ALLOWED_ORIGINS?.split(',')
      : '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // 24 hours
  };
  
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false
  }));
  
  app.use(apiLimiter);

  const httpServer = http.createServer(app);

  const server = new ApolloServer<Context>({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    formatError,
    introspection: process.env.ALLOW_INTROSPECTION === 'true',
  });

  await server.start();
  
  app.use('/graphql', graphqlRateLimiter);
  
  app.use('/graphql', [
    cors(corsOptions),
    express.json(),
    expressMiddleware(server, {
      context: async () => {
        const loaders = createLoaders(prisma);
        return { prisma, loaders };
      },
    }) as unknown as express.RequestHandler,
  ]); 

  app.get('/', (_, res) => {
    res.send('GraphQL API is running. Visit /graphql to use the API.');
  });

  app.get('/health', (_, res) => {
    res.status(200).send('OK');
  });

  // Store the httpServer on the app for when we need to start listening
  (app as any).httpServer = httpServer;
  
  return app;
}

// Start the server (only used in development)
export async function startServer(): Promise<express.Application> {
  const app = await createApp();
  const httpServer = (app as any).httpServer;
  
  const PORT = process.env.PORT || 4000;
  await new Promise<void>(resolve => httpServer.listen({ port: PORT }, resolve));
  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  
  return app;
}

// For Vercel (serverless) - just create the app without listening
export default createApp();

// For local development - start the server
if (process.env.NODE_ENV !== 'production') {
  startServer().catch(err => {
    console.error('Failed to start server:', err);
  });
}