import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import categoryRoutes from './routes/categoryRoutes';
import cors from 'cors';

const app = express();

// Enable CORS
app.use(cors());

// Middleware
app.use(bodyParser.json());
app.use('/api/categories', categoryRoutes);

// Handle 404 for unknown routes
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

// Custom error class
class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Centralized error-handling middleware
app.use((err: AppError | Error, req: Request, res: Response) => {
  console.error(err.stack || err.message);

  // Handle known errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  // Handle unexpected errors
  res.status(500).json({ message: 'Internal Server Error' });
});

export default app;
