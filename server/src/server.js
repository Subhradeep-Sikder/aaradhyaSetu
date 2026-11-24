import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import dns from 'node:dns';
import { fileURLToPath } from 'url';

try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {
  // ignore
}

import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import bookingRoutes from './routes/bookings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL;

// Connect to MongoDB
connectDB();

const app = express();

const allowedOrigin = FRONTEND_URL ? FRONTEND_URL.replace(/\/$/, '') : null;
app.use(cors({
  origin: allowedOrigin || true,
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "ok",
    service: "API",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

// Serve static frontend assets in production
if (process.env.NODE_ENV === "production") {
  const publicPath = path.join(__dirname, '../public');
  app.use(express.static(publicPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});
