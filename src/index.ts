import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { typeDefs } from './schema/typeDefs';
import { resolvers } from './schema/resolvers';
import { prisma } from './config/prisma';
import { formatError } from './utils/errors';
import { createLoaders, Context } from './utils/dataLoaders';
import { apiLimiter } from './middleware/rateLimiter';
import { graphqlRateLimiter } from './middleware/graphqlRateLimiter';

async function startServer() {
  const app = express();
  app.use(apiLimiter);

  const httpServer = http.createServer(app);

  const server = new ApolloServer<Context>({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    formatError,
  });

  await server.start();

  app.use('/graphql', graphqlRateLimiter);

  app.use('/graphql', [
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async () => {
        const loaders = createLoaders(prisma);
        return { prisma, loaders };
      },
    }) as unknown as express.RequestHandler,
  ]);

  const PORT = process.env.PORT || 4000;
  await new Promise<void>(resolve => httpServer.listen({ port: PORT }, resolve));
  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
