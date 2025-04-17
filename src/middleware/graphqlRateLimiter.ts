import { Request, Response, NextFunction } from 'express';
import { parse, getOperationAST } from 'graphql';
import { mutationLimiter, queryLimiter } from './rateLimiter';

export const graphqlRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  if (req.path !== '/graphql') {
    return next();
  }

  const query = req.body?.query || '';
  if (!query) {
    return next();
  }

  try {
    const document = parse(query);
    const operationAST = getOperationAST(document);

    if (operationAST?.operation === 'mutation') {
      return mutationLimiter(req, res, next);
    } else {
      return queryLimiter(req, res, next);
    }
  } catch (error) {
    return mutationLimiter(req, res, next);
  }
};