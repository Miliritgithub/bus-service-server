const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllUsers, toggleUserStatus, updateBookingStatus } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/toggle', toggleUserStatus);
router.patch('/bookings/:id/status', updateBookingStatus);

module.exports = router;