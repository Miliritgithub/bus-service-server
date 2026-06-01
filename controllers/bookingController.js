const Booking = require('../models/Booking');
const Route = require('../models/Route');
const Bus = require('../models/Bus');

const createBooking = async (req, res) => {
  try {
    const { routeId, seats } = req.body;
    if (!routeId || !seats || seats.length === 0)
      return res.status(400).json({ message: 'Route and seats are required' });

    const route = await Route.findById(routeId).populate('bus');
    if (!route) return res.status(404).json({ message: 'Route not found' });

    const conflict = seats.filter((s) => route.bookedSeats.includes(s));
    if (conflict.length > 0)
      return res.status(400).json({ message: `Seats ${conflict.join(', ')} already booked` });

    const totalPrice = seats.length * route.price;
    const booking = await Booking.create({
      user: req.user._id, route: routeId, seats, totalPrice, status: 'pending',
    });

    route.bookedSeats.push(...seats);
    route.availableSeats = route.bus.totalSeats - route.bookedSeats.length;
    await route.save();

    await booking.populate({ path: 'route', populate: { path: 'bus' } });
    res.status(201).json({ message: 'Booking created', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate({ path: 'route', populate: { path: 'bus' } })
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id })
      .populate({ path: 'route', populate: { path: 'bus' } });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status === 'cancelled')
      return res.status(400).json({ message: 'Already cancelled' });

    booking.status = 'cancelled';
    await booking.save();

    const route = await Route.findById(booking.route);
    const bus = await Bus.findById(route.bus);
    route.bookedSeats = route.bookedSeats.filter((s) => !booking.seats.includes(s));
    route.availableSeats = bus.totalSeats - route.bookedSeats.length;
    await route.save();

    res.json({ message: 'Booking cancelled', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email phone')
      .populate({ path: 'route', populate: { path: 'bus' } })
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createBooking, getMyBookings, getBookingById, cancelBooking, getAllBookings };