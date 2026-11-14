// ============================================================
// server/index.js — Express entry point
// Boots the API, connects to MongoDB Atlas, and (in production)
// also serves the compiled React app from client/dist.
// ============================================================
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { timingSafeEqual } from 'node:crypto';
import mongoose from 'mongoose';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import devicesRouter from './routes/devices.js';

// ES modules don't have __dirname, so rebuild it from import.meta.url.
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load the repo-root .env explicitly. npm workspaces run this script with
// cwd = server/, so the default dotenv lookup would miss the root file.
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const PORT = process.env.PORT || 5001;
const isProd = process.env.NODE_ENV === 'production';

const app = express();

// Production requests arrive through the local Caddy reverse proxy.
app.disable('x-powered-by');
if (isProd) app.set('trust proxy', 'loopback');
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use('/api', (_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
app.use('/api', rateLimit({
  windowMs: 60_000,
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests. Try again in a minute.' },
}));

const accessKey = Buffer.from(process.env.FLEETDESK_ACCESS_KEY || '');
app.use('/api/devices', (req, res, next) => {
  const key = Buffer.from(req.get('authorization')?.match(/^Bearer (.+)$/i)?.[1] || '');
  if (!accessKey.length || key.length !== accessKey.length || !timingSafeEqual(key, accessKey)) {
    res.set('WWW-Authenticate', 'Bearer');
    return res.status(401).json({ error: 'A valid FleetDesk access key is required.' });
  }
  next();
}, express.json({ limit: '16kb', inflate: false }), devicesRouter);
app.use('/api', (_req, res) => res.status(404).json({ error: 'API route not found.' }));

// In production the React build is static files; serve them from this same
// server so one process (and one URL) handles both the UI and the API.
// The catch-all sends index.html so client-side routing/refreshes work.
if (isProd) {
  const dist = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

// --- Error handler ----------------------------------------------------------

// Final middleware: any error passed to next(err) ends up here and is
// returned as JSON with a consistent shape { error: "..." }.
app.use((err, _req, res, _next) => {
  if (err.code === 11000 && (err.keyPattern?.serial || err.keyValue?.serial)) {
    return res.status(409).json({ error: 'A device with this serial number already exists. Edit the existing device or use a different serial.' });
  }
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON.' });
  if (err.status === 413) return res.status(413).json({ error: 'Request body is too large.' });
  if (err.status === 415) return res.status(415).json({ error: 'Unsupported request encoding or charset.' });
  if (err.status === 400) return res.status(400).json({ error: 'Invalid device data or ID.' });
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

// --- Startup ----------------------------------------------------------------

// Connect to MongoDB first; only start accepting HTTP requests once the
// database is reachable. If the connection fails, exit so PM2 restarts us.
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    // Ensure the unique serial index exists before accepting writes.
    await mongoose.model('Device').init();
    console.log('MongoDB connected');
    app.listen(PORT, '127.0.0.1', () => console.log(`API listening on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
