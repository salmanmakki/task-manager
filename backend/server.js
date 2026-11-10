require('dotenv').config({ quiet: true });

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const mongoose = require('mongoose');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const originGuard = require('./middleware/originGuard');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');

const isProduction = () => process.env.NODE_ENV === 'production';

const parseOrigins = () =>
  (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const validateEnv = () => {
  const missing = ['MONGO_URI', 'JWT_SECRET'].filter(
    (key) => !process.env[key] || !process.env[key].trim()
  );

  if (isProduction() && !process.env.CLIENT_URL?.trim()) {
    missing.push('CLIENT_URL');
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (isProduction() && process.env.JWT_SECRET.trim().length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production');
  }

  if (!isProduction()) return;

  for (const origin of parseOrigins()) {
    let parsed;
    try {
      parsed = new URL(origin);
    } catch {
      throw new Error(`CLIENT_URL contains an invalid origin: ${origin}`);
    }

    if (parsed.protocol !== 'https:') {
      throw new Error(`CLIENT_URL must use https in production: ${origin}`);
    }

    if (parsed.origin !== origin) {
      throw new Error(
        `CLIENT_URL must be an origin without a path or trailing slash: ${origin}`
      );
    }
  }
};

try {
  validateEnv();
} catch (error) {
  console.error(`Configuration error: ${error.message}`);
  process.exit(1);
}

const app = express();
const allowedOrigins = parseOrigins();

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);

app.use(originGuard(allowedOrigins));

app.get('/api/health', (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;

  res.status(databaseConnected ? 200 : 503).json({
    success: databaseConnected,
    message: databaseConnected
      ? 'TaskFlow API is running'
      : 'TaskFlow API is starting or the database is unavailable',
    data: {
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: databaseConnected ? 'connected' : 'disconnected',
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

let server;
let shuttingDown = false;

const shutdown = async (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log(`${signal} received. Shutting down TaskFlow API...`);

  const forceExit = setTimeout(() => {
    console.error('Graceful shutdown timed out. Forcing exit.');
    process.exit(1);
  }, 10000);
  forceExit.unref();

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }
    await mongoose.connection.close();
    console.log('Shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error(`Shutdown failed: ${error.message}`);
    process.exit(1);
  }
};

const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(PORT, () => {
      console.log(`TaskFlow API listening on port ${PORT}`);
    });

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error(`Failed to start TaskFlow API: ${error.message}`);
    process.exit(1);
  }
};

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

startServer();
