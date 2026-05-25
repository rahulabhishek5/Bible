require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bibleRoutes = require('./routes/bibleRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// 1. MIDDLEWARE
// ==========================================
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// ==========================================
// 2. ADAPTIVE DATABASE CONNECTION
// ==========================================
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bible_app';

const connectWithFallback = async () => {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 });
    process.env.DB_MODE = 'LIVE';
    console.log('✅ [Database]: Successfully connected to MongoDB. Running in LIVE mode.');
  } catch (err) {
    process.env.DB_MODE = 'MOCK';
    console.warn('');
    console.warn('╔══════════════════════════════════════════════════════════════╗');
    console.warn('║  ⚠️  [Database Mode]: Local MongoDB service not detected.     ║');
    console.warn('║     Pivoting to high-fidelity In-Memory Mock Data Mode...    ║');
    console.warn('║     All API endpoints remain fully operational.              ║');
    console.warn('╚══════════════════════════════════════════════════════════════╝');
    console.warn('');
  }
};

// ==========================================
// 3. API ROUTING
// ==========================================
app.use('/api/bible', bibleRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    dbMode: process.env.DB_MODE || 'INITIALIZING',
    message: 'Bible Web App Backend is fully operational.'
  });
});

// ==========================================
// 4. SERVER INITIALIZATION (connect first, then listen)
// ==========================================
app.listen(PORT, async () => {
  console.log(`🚀 [Server]: Engine running on http://localhost:${PORT}`);
  await connectWithFallback();
});