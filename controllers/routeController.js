const Route = require('../models/Route');
const Bus = require('../models/Bus');

const searchRoutes = async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ message: 'From and to required' });
    
    const fromLower = from.trim().toLowerCase();
    const toLower = to.trim().toLowerCase();
    
    const allRoutes = await Route.find({ isActive: true }).populate('bus');
    const routes = allRoutes.filter(r =>
      r.from.toLowerCase().includes(fromLower) &&
      r.to.toLowerCase().includes(toLower)
    );
    
    console.log('Routes found:', routes.length);
    res.json(routes);
  } catch (error) {
    console.log('FULL ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

const getAllRoutes = async (req, res) => {
  try {
    const routes = await Route.find().populate('bus').sort({ date: 1 });
    res.json(routes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRouteById = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id).populate('bus');
    if (!route) return res.status(404).json({ message: 'Route not found' });
    res.json(route);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createRoute = async (req, res) => {
  try {
    const { bus, from, to, departureTime, arrivalTime, price } = req.body;
    const busDoc = await Bus.findById(bus);
    if (!busDoc) return res.status(404).json({ message: 'Bus not found' });
    const route = await Route.create({ bus, from, to, departureTime, arrivalTime, price, availableSeats: busDoc.totalSeats });
    await route.populate('bus');
    res.status(201).json({ message: 'Route created', route });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateRoute = async (req, res) => {
  try {
    const route = await Route.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('bus');
    if (!route) return res.status(404).json({ message: 'Route not found' });
    res.json({ message: 'Route updated', route });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteRoute = async (req, res) => {
  try {
    const route = await Route.findByIdAndDelete(req.params.id);
    if (!route) return res.status(404).json({ message: 'Route not found' });
    res.json({ message: 'Route deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { searchRoutes, getAllRoutes, getRouteById, createRoute, updateRoute, deleteRoute };