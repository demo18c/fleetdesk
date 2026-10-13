// ============================================================
// server/seed.js — load sample devices
// Usage:  npm run seed            (uses MONGODB_URI from the root .env)
// Inserts a realistic starter fleet. Safe to re-run: it skips serials
// that already exist, so it never creates duplicates.
// ============================================================
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Device from './models/Device.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const SAMPLE = [
  { name: 'Galaxy Tab Active5', serial: 'R52X1A7K3PD', platform: 'android', osVersion: '14', status: 'enrolled', assignedTo: 'Field Team A', notes: 'Rugged tablet, vehicle mount' },
  { name: 'Galaxy Tab Active5', serial: 'R52X1A7K4QE', platform: 'android', osVersion: '14', status: 'enrolled', assignedTo: 'Field Team A', notes: '' },
  { name: 'Galaxy S24', serial: 'R5CX20F9ZTB', platform: 'android', osVersion: '15', status: 'enrolled', assignedTo: 'J. Alvarez', notes: 'Primary phone' },
  { name: 'Galaxy S24', serial: 'R5CX20G1HMA', platform: 'android', osVersion: '15', status: 'pending', assignedTo: 'M. Chen', notes: 'Awaiting enrollment at onboarding' },
  { name: 'Galaxy XCover6 Pro', serial: 'R58W40QV8XK', platform: 'android', osVersion: '14', status: 'enrolled', assignedTo: 'Warehouse', notes: 'Barcode scanner sled attached' },
  { name: 'iPhone 15', serial: 'F2LW9K0XPQ3H', platform: 'ios', osVersion: '18.1', status: 'enrolled', assignedTo: 'S. Patel', notes: '' },
  { name: 'iPhone 15', serial: 'F2LW9K1YRT7J', platform: 'ios', osVersion: '18.1', status: 'pending', assignedTo: '', notes: 'Spare, boxed' },
  { name: 'iPad 10th gen', serial: 'DMPTX4C2Q1GC', platform: 'ios', osVersion: '18.0', status: 'enrolled', assignedTo: 'Front desk', notes: 'Kiosk mode' },
  { name: 'Galaxy Watch7', serial: 'RFAW70Q2M8N', platform: 'wearos', osVersion: '5.0', status: 'enrolled', assignedTo: 'J. Alvarez', notes: 'Paired to S24' },
  { name: 'Galaxy Watch7', serial: 'RFAW70Q3P1R', platform: 'wearos', osVersion: '5.0', status: 'pending', assignedTo: '', notes: '' },
  { name: 'Surface Pro 9', serial: '0F1K2B3L4M5N', platform: 'windows', osVersion: '11 23H2', status: 'enrolled', assignedTo: 'IT', notes: 'Admin workstation' },
  { name: 'Galaxy Tab A8', serial: 'R9WR30X7Y2Z', platform: 'android', osVersion: '13', status: 'retired', assignedTo: '', notes: 'Cracked screen, wiped 2026-09' },
  { name: 'Galaxy S21', serial: 'R58N81KQ4VW', platform: 'android', osVersion: '13', status: 'retired', assignedTo: '', notes: 'Replaced by S24' },
];

await mongoose.connect(process.env.MONGODB_URI);
const existing = new Set((await Device.find({}, 'serial')).map((d) => d.serial));
const fresh = SAMPLE.filter((d) => !existing.has(d.serial));
if (fresh.length) await Device.insertMany(fresh);
console.log(`Seeded ${fresh.length} new device(s); ${existing.size} already present.`);
await mongoose.disconnect();
