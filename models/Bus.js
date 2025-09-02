const mongoose = require('mongoose');

const StopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  time: { type: String, required: true }
});

const BusSchema = new mongoose.Schema({
  operator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  busName: { type: String, required: true },
  price: { type: Number, required: true },
  stops: [StopSchema]
});

// --- ADD THIS LINE ---
// Create an index on the 'stops.name' field for faster queries
BusSchema.index({ 'stops.name': 1 });

module.exports = mongoose.model('Bus', BusSchema);