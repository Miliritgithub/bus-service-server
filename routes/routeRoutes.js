const express = require('express');
const router = express.Router();
const {
  searchRoutes, getAllRoutes, getRouteById, createRoute, updateRoute, deleteRoute
} = require('../controllers/routeController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/search', searchRoutes);
router.get('/', protect, adminOnly, getAllRoutes);
router.get('/:id', getRouteById);
router.post('/', protect, adminOnly, createRoute);
router.put('/:id', protect, adminOnly, updateRoute);
router.delete('/:id', protect, adminOnly, deleteRoute);

module.exports = router;