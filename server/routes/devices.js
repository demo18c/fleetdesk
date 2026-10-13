// ============================================================
// server/routes/devices.js — REST endpoints for devices
// One handler per CRUD operation. Each is async, awaits Mongoose,
// and forwards failures to the central error handler via next(err).
// ============================================================
import { Router } from 'express';
import mongoose from 'mongoose';
import Device from '../models/Device.js';

const router = Router();

// Map Mongoose error types to HTTP status codes so the client gets a
// 400 for bad input (missing name, invalid id) instead of a generic 500.
const statusFor = (err) => {
  if (err instanceof mongoose.Error.ValidationError) return 400;
  if (err instanceof mongoose.Error.CastError) return 400;
  return 500;
};

// Whitelist request-body fields. Anything not in the schema (or anything
// malicious like _id / __proto__) is dropped before it reaches Mongoose.
const pick = (body = {}) => {
  const out = {};
  for (const k of ['name', 'serial', 'platform', 'osVersion', 'status', 'assignedTo', 'notes']) {
    if (body[k] !== undefined) out[k] = body[k];
  }
  return out;
};

// GET /api/devices
// READ: return every device, newest first. This is the "select all" the
// client loads on page open.
router.get('/', async (_req, res, next) => {
  try {
    const devices = await Device.find().sort({ createdAt: -1 });
    res.json(devices);
  } catch (err) {
    next(err);
  }
});

// POST /api/devices
// CREATE: insert a new device from the JSON body. Mongoose runs the schema
// validation (e.g. required name/serial). Responds 201 with the saved
// document, which now includes its generated _id and timestamps.
router.post('/', async (req, res, next) => {
  try {
    const device = await Device.create(pick(req.body));
    res.status(201).json(device);
  } catch (err) {
    err.status = statusFor(err);
    next(err);
  }
});

// PUT /api/devices/:id
// UPDATE: apply the body fields to the device with that id.
//   new: true           → return the updated doc, not the pre-update one
//   runValidators: true → enforce schema rules on updates too (off by default)
// 404 if no device has that id.
router.put('/:id', async (req, res, next) => {
  try {
    const device = await Device.findByIdAndUpdate(req.params.id, pick(req.body), {
      new: true,
      runValidators: true,
    });
    if (!device) return res.status(404).json({ error: 'Device not found' });
    res.json(device);
  } catch (err) {
    err.status = statusFor(err);
    next(err);
  }
});

// DELETE /api/devices/:id
// DELETE: remove the device. 204 No Content on success (nothing to return),
// 404 if it didn't exist.
router.delete('/:id', async (req, res, next) => {
  try {
    const device = await Device.findByIdAndDelete(req.params.id);
    if (!device) return res.status(404).json({ error: 'Device not found' });
    res.status(204).end();
  } catch (err) {
    err.status = statusFor(err);
    next(err);
  }
});

export default router;
