const User = require('../models/User');
const Bus = require('../models/Bus');
const Route = require('../models/Route');
const Booking = require('../models/Booking');

const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalBuses, totalRoutes, totalBookings,
      confirmedBookings, cancelledBookings, pendingBookings] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Bus.countDocuments({ isActive: true }),
      Route.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.countDocuments({ status: 'cancelled' }),
      Booking.countDocuments({ status: 'pending' }),
    ]);

    const revenueResult = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    const recentBookings = await Booking.find()
      .populate('user', 'name email')
      .populate({ path: 'route', populate: { path: 'bus', select: 'busName' } })
      .sort({ createdAt: -1 }).limit(5);

    res.json({ stats: { totalUsers, totalBuses, totalRoutes, totalBookings, confirmedBookings, cancelledBookings, pendingBookings, totalRevenue }, recentBookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id, { status: req.body.status }, { new: true }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json({ message: 'Status updated', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats, getAllUsers, toggleUserStatus, updateBookingStatus };