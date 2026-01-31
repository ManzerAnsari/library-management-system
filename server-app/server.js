require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const routes = require('./routes');

const app = express();

// Configuration
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/library';

// Middlewares
app.use(morgan(process.env.LOG_FORMAT || 'dev'));
app.use(helmet());
app.use(cookieParser());
// Allow all origins: reflect request origin (required when credentials: true; * is not allowed)
app.use(
  cors({
    origin(origin, callback) {
      callback(null, origin || true);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Basic rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

// Routes
app.get('/', (req, res) => res.send('Library Management System API'));
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));
app.use('/api', routes);

// 404 + error handlers (centralized)
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
app.use(notFoundHandler);
app.use(errorHandler);

// Startup and graceful shutdown
async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    const server = app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

    const graceful = () => {
      console.log('Shutting down server...');
      server.close(() => {
        mongoose.disconnect().finally(() => process.exit(0));
      });
    };

    process.on('SIGINT', graceful);
    process.on('SIGTERM', graceful);
    process.on('unhandledRejection', (err) => {
      console.error('Unhandled Rejection:', err);
      graceful();
    });
    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err);
      graceful();
    });
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

start();

module.exports = app;