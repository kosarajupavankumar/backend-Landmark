import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from './logger';

dotenv.config();

class MongoConnection {
  private uri: string;
  private dbName: string;
  private static cachedConnection: mongoose.Connection | null = null; // Cache the connection

  constructor(uri: string, dbName = 'landmark') {
    this.uri = uri;
    this.dbName = dbName;
  }

  // Connect to the database
  async connect(): Promise<mongoose.Connection> {
    try {
      // If a cached connection exists, return it
      if (MongoConnection.cachedConnection) {
        logger.info(`Using cached database connection.`);
        return MongoConnection.cachedConnection;
      }

      logger.info(`Connecting to MongoDB cluster...`);
      await mongoose.connect(this.uri, { dbName: this.dbName });

      MongoConnection.cachedConnection = mongoose.connection; // Cache the connection
      logger.info(
        `Connected to the cluster and using database: ${this.dbName}`,
      );

      return MongoConnection.cachedConnection;
    } catch (error) {
      logger.error(
        'Error connecting to the database:',
        (error as Error).message,
      );
      process.exit(1); // Exit if database connection fails
    }
  }

  // disConnect from mongoDB
  async disconnect(): Promise<void> {
    try {
      if (MongoConnection.cachedConnection) {
        await mongoose.disconnect();
        logger.info('Disconnected from MongoDB');
      }
    } catch (error) {
      logger.error(
        'Error disconnecting from the database:',
        (error as Error).message,
      );
      process.exit(1); // Exit if database disconnection fails
    }
  }
}

const mongoConnection = new MongoConnection(process.env.MONGO_URI!, 'landmark');

export default mongoConnection;
