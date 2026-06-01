const Bus = require('../models/Bus');

const getAllBuses = async (req, res) => {
  try {
    const buses = await Bus.find({ isActive: true });
    res.json(buses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBusById = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) return res.status(404).json({ message: 'Bus not found' });
    res.json(bus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createBus = async (req, res) => {
  try {
    const bus = await Bus.create(req.body);
    res.status(201).json({ message: 'Bus created', bus });
  } catch (error) {
    if (error.code === 11000)
      return res.status(400).json({ message: 'Bus number already exists' });
    res.status(500).json({ message: error.message });
  }
};

const updateBus = async (req, res) => {
  try {
    const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!bus) return res.status(404).json({ message: 'Bus not found' });
    res.json({ message: 'Bus updated', bus });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteBus = async (req, res) => {
  try {
    await Bus.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Bus deactivated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllBuses, getBusById, createBus, updateBus, deleteBus };