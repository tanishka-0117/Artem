import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  console.error(`[Error] ${req.method} ${req.path}:`, err.message);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid input data' },
    });
    return;
  }

  // Mongoose duplicate key
  if ((err as any).code === 11000) {
    res.status(409).json({
      success: false,
      error: { code: 'DUPLICATE_KEY', message: 'A record with this value already exists' },
    });
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' },
    });
    return;
  }

  // Default server error — never expose internal details
  res.status(500).json({
    success: false,
    error: { code: 'SERVER_ERROR', message: 'An unexpected error occurred. Please try again.' },
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.path} not found` },
  });
}
