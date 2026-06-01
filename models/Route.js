const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  bus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
  from: { type: String, required: true, trim: true },
  to: { type: String, required: true, trim: true },
  departureTime: { type: String },
  arrivalTime: { type: String },
  price: { type: Number, required: true },
  date: { type: Date },
  availableSeats: { type: Number, default: 0 },
  bookedSeats: { type: [Number], default: [] },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Route', routeSchema);