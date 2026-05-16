import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'ValidationError',
      message: Object.values(err.errors).map((val: any) => val.message).join(', ')
    });
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      error: 'Conflict',
      message: `${field === 'utrNumber' ? 'UTR Number' : field} already exists.`
    });
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token. Please log in again.'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Token expired. Please log in again.'
    });
  }

  // Default Error
  res.status(err.status || 500).json({
    error: err.name || 'ServerError',
    message: err.message || 'Internal server error'
  });
};
