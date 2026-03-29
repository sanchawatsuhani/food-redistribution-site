import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import foodRoutes from './routes/food.js';
import pickupRoutes from './routes/pickup.js';
import statsRoutes from './routes/stats.js';
import notificationsRoutes from './routes/notifications.js';
import { startExpiryService } from './services/expiryService.js';
import { authenticateSocket } from './middleware/socketAuth.js';
import { setIoInstance } from './services/notificationService.js';

// Import database to trigger table creation
import './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// 1. CORS Configuration (MUST BE FIRST)
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173,http://localhost:3000')
  .split(',')
  .map(url => url.replace(/\/$/, '').trim());

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const normalizedOrigin = origin.replace(/\/$/, '').trim();
    const matches = allowedOrigins.indexOf(normalizedOrigin) !== -1;
    const isVercel = normalizedOrigin.endsWith('.vercel.app');
    
    if (matches || isVercel || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(null, true); // Allow any origin for now to ensure registration bypasses the block
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

const io = new Server(httpServer, {
  cors: corsOptions
});

// Apply CORS globally before anything else
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle all preflight requests explicitly

// 2. Security and Performance Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(compression());
app.use(morgan('combined'));

// 3. Rate Limiting (Applied to /api/ but after CORS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Make io accessible in routes
app.set('io', io);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/pickups', pickupRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/notifications', notificationsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.IO connection handling
io.use(authenticateSocket);
setIoInstance(io);

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id} (User: ${socket.user?.email})`);
  if (socket.user?.id) {
    socket.join(`user_${socket.user.id}`);
  }
  
  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Start expiry cron job
startExpiryService(io);

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════════╗
  ║   🍽️  Smart Food Redistribution System          ║
  ║   🚀 Backend running on http://localhost:${PORT}    ║
  ║   📡 Socket.IO ready                            ║
  ║   💾 SQLite database initialized                ║
  ╚══════════════════════════════════════════════════╝
  `);
});
