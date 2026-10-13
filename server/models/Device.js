// ============================================================
// server/models/Device.js — Mongoose model for a managed device
// Defines the shape of a document in the `devices` collection and
// the validation rules MongoDB enforces on every write.
// ============================================================
import mongoose from 'mongoose';

// Schema = the "table definition". Each field lists its type, defaults,
// and constraints. Enums restrict platform/status to known values so the
// UI dropdowns and the database always agree.
const deviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Device name is required'], trim: true, maxlength: 80 },
    serial: { type: String, required: [true, 'Serial number is required'], trim: true, uppercase: true, maxlength: 64 },
    platform: { type: String, enum: ['android', 'ios', 'wearos', 'windows'], default: 'android' },
    osVersion: { type: String, trim: true, maxlength: 32, default: '' },
    status: { type: String, enum: ['pending', 'enrolled', 'retired'], default: 'pending' },
    assignedTo: { type: String, trim: true, maxlength: 80, default: '' },
    notes: { type: String, trim: true, maxlength: 1000, default: '' },
  },
  // timestamps: true auto-adds createdAt and updatedAt on every document.
  { timestamps: true }
);

// Model name 'Device' → Mongoose pluralises/lowercases it to the `devices` collection.
export default mongoose.model('Device', deviceSchema);
