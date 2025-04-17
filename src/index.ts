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

async function startServer() {
  const app = express();
  
  const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.ALLOWED_ORIGINS?.split(',') || '[https://dogbreedsapi.vercel.app](https://dogbreedsapi.vercel.app)' // Change this
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

  app.get('/health', (_, res) => {
    res.status(200).send('OK');
  });

  // For local development
  if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 4000;
    await new Promise<void>(resolve => httpServer.listen({ port: PORT }, resolve));
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  }

  // For serverless environments like Vercel, return the Express app
  return app;
}

// Export for serverless use
export default startServer().then(app => {
  return app;
}) as Promise<express.Application>;

// Start server only in non-production (local development)
if (process.env.NODE_ENV !== 'production') {
  startServer().catch(err => {
    console.error('Failed to start server:', err);
  });
}