// ============================================================
// server/index.js — Express entry point
// Boots the API, connects to MongoDB Atlas, and (in production)
// also serves the compiled React app from client/dist.
// ============================================================
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
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

// --- Middleware -------------------------------------------------------------

// CORS: only the web app's own origin may call this API (assignment requirement).
// Locally that's the Vite dev server; in production it's the public site URL.
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));

// Parse JSON request bodies into req.body.
app.use(express.json());

// --- Routes -----------------------------------------------------------------

// All device CRUD lives in routes/devices.js, mounted under /api/devices.
app.use('/api/devices', devicesRouter);

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
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
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
    app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
