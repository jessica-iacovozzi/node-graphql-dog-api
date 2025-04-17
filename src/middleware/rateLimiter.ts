import rateLimit, { Options } from 'express-rate-limit';
import { Request, Response } from 'express';

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  standardHeaders: boolean;
  legacyHeaders: boolean;
}

const defaultConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
};

export const createRateLimiter = (config: Partial<RateLimitConfig> = {}) => {
  const limiterConfig: RateLimitConfig = { ...defaultConfig, ...config };
  
  const options: Partial<Options> = {
    windowMs: limiterConfig.windowMs,
    max: limiterConfig.max,
    message: limiterConfig.message,
    standardHeaders: limiterConfig.standardHeaders,
    legacyHeaders: limiterConfig.legacyHeaders,
    keyGenerator: (req: Request): string => {
      return req.ip || 'unknown-ip';
    },
    handler: (_req: Request, res: Response): void => {
      res.status(429).json({
        errors: [{
          message: limiterConfig.message,
          extensions: {
            code: 'RATE_LIMITED'
          }
        }]
      });
    }
  };
  
  try {
    if (process.env.REDIS_URL) {
      const { createClient } = require('@redis/client');
      const { RedisStore } = require('rate-limit-redis');
      
      const redisClient = createClient({
        url: process.env.REDIS_URL,
      });
    
      // Connect to Redis in a non-blocking way
      redisClient.connect().catch((err: Error) => {
        console.error('Redis connection failed, falling back to memory store:', err);
      });
    
      redisClient.on('error', (err: Error) => {
        console.error('Redis error:', err);
      });
    
      options.store = new RedisStore({
        sendCommand: (...args: string[]) => redisClient.sendCommand(args),
      });
    }
  } catch (error) {
    console.error('Redis setup failed, using memory store instead:', error);
  }
      
  return rateLimit(options);
};

export const apiLimiter = createRateLimiter();

export const mutationLimiter = createRateLimiter({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), 
  max: parseInt(process.env.MUTATION_RATE_LIMIT || '50'),
  message: 'Too many mutation requests, please try again later.'
});

export const queryLimiter = createRateLimiter({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.QUERY_RATE_LIMIT || '200'),
  message: 'Too many query requests, please try again later.'
});