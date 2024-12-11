import app from './src/app';
import mongoConnection from './src/config/dbConfig';
import logger from './src/config/logger';

(async () => {
  try {
    // Connect to MongoDB
    await mongoConnection.connect();
    logger.info('Database connection established');

    // Find an available port starting from the default port (5000)
    const port = process.env.PORT || 3000;

    // Start the server
    app.listen(port, () => {
      logger.info(`Server running on port ${port}`);
    });
  } catch (error) {
    logger.error('Error starting the server:', error);
    process.exit(1);
  }
})();
