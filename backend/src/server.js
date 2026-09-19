import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/apiRoutes.js';
import { getDatabase } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import helmet from 'helmet';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    const allowed = process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:5173';
    if (!origin || origin === allowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Global API rate limiting
import rateLimit from 'express-rate-limit';
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api', apiLimiter);

// Strict rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 attempts per 15 minutes
  message: { error: 'Too many authentication attempts, please try again later.' }
});
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/request-reset', authLimiter);
app.use('/api/auth/reset-password', authLimiter);

// Request logger for development
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

import swaggerUi from 'swagger-ui-express';
import yaml from 'yaml';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Interactive API Documentation (Swagger UI)
try {
  const file = fs.readFileSync(path.resolve(__dirname, '../openapi.yaml'), 'utf8');
  const swaggerDocument = yaml.parse(file);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (err) {
  console.warn('Swagger docs disabled: openapi.yaml not found.');
}

// API Routes
app.use('/api', apiRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'GiftBro AI – Personalized Gift Recommendation Engine API',
    status: 'running',
    docs: '/api-docs',
    health: '/api/health'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global Centralized Error Handler
app.use(errorHandler);

// Initialize DB and start server
async function startServer() {
  try {
    await getDatabase();
    console.log('✅ SQLite database initialized successfully.');

    app.listen(PORT, () => {
      console.log(`🎁 GiftBro AI Backend listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to initialize server:', err);
    process.exit(1);
  }
}

startServer();

export default app;
