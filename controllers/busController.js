const Bus = require('../models/Bus');
const mongoose = require('mongoose');

// --- Functions for Bus Owners ---

// Add a new bus (Now secure)
exports.addBus = async (req, res) => {
  const { busName, price, stops } = req.body;

  try {
    // Standardize stop names before saving
    const standardizedStops = stops.map(stop => ({
      ...stop,
      name: stop.name.trim().replace(/\b\w/g, l => l.toUpperCase()),
    }));

    const bus = new Bus({
      busName,
      price,
      stops: standardizedStops, // Use the standardized stops
      operator: req.user._id, 
    });

    const createdBus = await bus.save();
    res.status(201).json(createdBus);
  } catch (error) {
    console.error('Add Bus Error:', error);
    res.status(400).json({ message: 'Invalid bus data', error: error.message });
  }
};

// Get all buses belonging to a specific owner
exports.getOwnerBuses = async (req, res) => {
  try {
    const buses = await Bus.find({ operator: req.user._id });
    res.json(buses);
  } catch (error) {
    console.error('Get Owner Buses Error:', error);
    res.status(500).json({ message: 'Server Error while fetching owner buses.' });
  }
};

// --- NEW FUNCTION: Delete a bus ---
exports.deleteBus = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);

    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    if (bus.operator.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await bus.deleteOne();
    res.json({ message: 'Bus removed successfully' });
  } catch (error) {
    console.error('Delete Bus Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


// --- Functions for Public Users (Frontend Features) ---

// Search for buses between two stops
exports.searchBuses = async (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) {
    return res.status(400).json({ message: 'Please provide both from and to locations.' });
  }
  try {
    const potentialBuses = await Bus.find({
      'stops.name': { $all: [new RegExp(from, 'i'), new RegExp(to, 'i')] }
    });
    const validBuses = potentialBuses.filter(bus => {
      const fromIndex = bus.stops.findIndex(stop => new RegExp(from, 'i').test(stop.name));
      const toIndex = bus.stops.findIndex(stop => new RegExp(to, 'i').test(stop.name));
      return fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex;
    });
    res.json(validBuses);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get a list of all unique bus stops
exports.getAllStops = async (req, res) => {
  try {
    const stops = await Bus.distinct('stops.name');
    res.json(stops.sort());
  } catch (error) {
    console.error('Get All Stops Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get details for a single bus by its ID
exports.getBusDetails = async (req, res) => {
    try {
        const bus = await Bus.findById(req.params.id).populate('operator', 'name email');
        
        if (!bus) {
            return res.status(404).json({ message: 'Bus not found' });
        }
        res.json(bus);
    } catch (error) {
        console.error('Get Bus Details Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get all buses that depart from a specific stop
exports.getDeparturesByStop = async (req, res) => {
  try {
    const { stopName } = req.params;
    const buses = await Bus.find({ 'stops.name': new RegExp(`^${stopName}$`, 'i') });
    res.json(buses);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};