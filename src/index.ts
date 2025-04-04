import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
// Import without type generics
import cors from 'cors';
import { json } from 'body-parser';

import { typeDefs } from './schema/typeDefs';
import { resolvers } from './schema/resolvers';
import { prisma } from './config/prisma';
import { formatError } from './utils/errors';

// Define the context interface
interface MyContext {
  prisma: typeof prisma;
}

async function startServer() {
  // Create Express and HTTP server
  const app = express();
  const httpServer = http.createServer(app);

  // Create Apollo Server with improved error handling
  const server = new ApolloServer<MyContext>({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    // Use our custom error formatter with domain-specific error handling
    formatError,
  });

  // Start Apollo Server
  await server.start();

  // Apply middleware - Using a more type-safe approach
  app.use('/graphql', [
    cors(),
    json(),
    // Using unknown as an intermediate step for the type conversion
    expressMiddleware(server, {
      context: async () => ({ prisma }),
    }) as unknown as express.RequestHandler
  ]);

  // Define port
  const PORT = process.env.PORT || 4000;

  // Start the server
  await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));
  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
