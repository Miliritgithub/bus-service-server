const Razorpay = require('razorpay');
const crypto   = require('crypto');
const Booking  = require('../models/Booking');
const Route    = require('../models/Route');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── POST /api/payments/create-order ──────────────────────────────────────────
// Frontend sends: { amount, currency }
// We create a Razorpay order and return the order id to open the popup
const createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR' } = req.body;

    if (!amount || amount <= 0)
      return res.status(400).json({ message: 'Invalid amount' });

    const order = await razorpay.orders.create({
      amount:          Math.round(amount * 100), // paise
      currency,
      receipt:         `busgo_${Date.now()}`,
      payment_capture: 1,
    });

    res.json({
      id:       order.id,       // frontend uses this as order_id
      amount:   order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error('createOrder error:', err);
    res.status(500).json({ message: err.message || 'Could not create order' });
  }
};

// ── POST /api/payments/verify ─────────────────────────────────────────────────
// Frontend sends after successful payment:
//   razorpay_payment_id, razorpay_order_id, razorpay_signature,
//   routeId, seats, promoCode, discount, amount
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      routeId,
      seats,
      promoCode,
      discount,
      amount,
    } = req.body;

    // 1. Verify HMAC signature — prevents fake/tampered payments
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (expectedSig !== razorpay_signature)
      return res.status(400).json({ message: 'Payment verification failed — invalid signature' });

    // 2. Load route and check seats are still free
    const route = await Route.findById(routeId);
    if (!route) return res.status(404).json({ message: 'Route not found' });

    const takenSeats = seats.filter(s => route.bookedSeats.includes(s));
    if (takenSeats.length)
      return res.status(409).json({
        message: `Seat(s) ${takenSeats.join(', ')} just got booked by someone else. Please pick different seats.`,
      });

    // 3. Mark seats as booked on the route
    route.bookedSeats.push(...seats);
    await route.save();

    // 4. Create confirmed booking record
    const booking = await Booking.create({
      user:          req.user._id,
      route:         routeId,
      seats,
      promoCode:     promoCode || null,
      discount:      discount  || 0,
      totalPrice:    amount,
      paymentId:     razorpay_payment_id,
      paymentOrderId: razorpay_order_id,
      status:        'confirmed',
    });

    await booking.populate('route');

    res.json({ booking });
  } catch (err) {
    console.error('verifyPayment error:', err);
    res.status(500).json({ message: err.message || 'Booking confirmation failed' });
  }
};

module.exports = { createOrder, verifyPayment };