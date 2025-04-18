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

let cachedApp: express.Application | null = null; // helpful in serverless

export async function createApp(): Promise<express.Application> {
  if (cachedApp) return cachedApp;

  const app = express();

  const corsOptions = {
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.ALLOWED_ORIGINS?.split(',')
        : '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400, // 24 hours
  };

  app.use(
    helmet({
      contentSecurityPolicy:
        process.env.NODE_ENV === 'production' ? undefined : false,
    })
  );

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

  app.use(
    '/graphql',
    [
      cors(corsOptions),
      express.json(),
      expressMiddleware(server, {
        context: async () => {
          const loaders = createLoaders(prisma);
          return { prisma, loaders };
        },
      }) as unknown as express.RequestHandler,
    ]
  );

  app.get('/', (_, res) => {
    res.send('GraphQL API is running. Visit /graphql to use the API.');
  });

  app.get('/health', (_, res) => {
    res.status(200).send('OK');
  });

  cachedApp = app;
  return app;
}

// Only listen locally, not in Vercel
if (process.env.NODE_ENV !== 'production' && process.env.VERCEL !== '1') {
  createApp().then((app) => {
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
    });
  });
}

// Vercel serverless handler: initializes (cached) Express app and proxies requests
const handler = async (req: any, res: any) => {
  const app = await createApp();
  return app(req, res);
};

export default handler;
