import type { NextFunction, Request, Response } from 'express';

export class AppError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(message: string, statusCode = 400, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const payload: Record<string, unknown> = {
    message: err.message || 'Unexpected server error',
  };

  if (process.env.NODE_ENV !== 'production' && err instanceof AppError && err.details) {
    payload.details = err.details;
  }

  console.error(err);
  return res.status(statusCode).json(payload);
};

