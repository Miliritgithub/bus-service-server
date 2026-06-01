const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  busNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
  busName: { type: String, required: true, trim: true },
  totalSeats: { type: Number, required: true },
  busType: { type: String, enum: ['AC', 'Non-AC', 'Sleeper', 'Semi-Sleeper', 'Luxury'], default: 'AC' },
  amenities: { type: [String], default: [] },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Bus', busSchema);