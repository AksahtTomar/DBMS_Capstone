const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { adminAuth } = require('../middleware/authMiddleware');

router.get('/config', paymentController.getPaymentConfig);
router.get('/upi-qr', paymentController.generateUpiQr);
router.post('/create-order', paymentController.createOrder);
router.post('/verify', paymentController.verifyPayment);
router.get('/history', adminAuth, paymentController.getPaymentHistory);

module.exports = router;
