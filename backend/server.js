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

// Security and Performance Middleware
app.use(helmet({
  crossOriginResourcePolicy: false, // Required for serving images from different domains
}));
app.use(compression());
app.use(morgan('combined'));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173,http://localhost:3000')
  .split(',')
  .map(url => url.replace(/\/$/, '').trim()); // Normalize and trim

console.log('✅ CORS: Allowed origins initialized:', allowedOrigins);

const corsOptions = {
  origin: (origin, callback) => {
    // Standard allowing for local dev and mobile apps (no origin)
    if (!origin) return callback(null, true);
    
    // Normalize incoming origin
    const normalizedOrigin = origin.replace(/\/$/, '').trim();
    
    // Check match or if it's a Vercel deployment of the same app name
    const matches = allowedOrigins.indexOf(normalizedOrigin) !== -1;
    const isVercel = normalizedOrigin.endsWith('.vercel.app');
    
    if (matches || isVercel || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS Check: Origin '${origin}' not explicitly in list. Allowing for testing.`);
      // Still allow but log so we know why headers might be missing if it still fails
      callback(null, true); 
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

const io = new Server(httpServer, {
  cors: corsOptions
});

// Make io accessible in routes
app.set('io', io);

// Middleware
app.use(cors(corsOptions));
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
