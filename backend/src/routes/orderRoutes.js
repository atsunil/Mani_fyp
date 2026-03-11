const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const orderController = require('../controllers/orderController');
const { auth, adminOnly, retailerOnly } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// Retailer order routes
router.post('/', auth, retailerOnly, [
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.productId').isMongoId().withMessage('Valid product ID is required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    validate
], orderController.placeOrder);

router.get('/my-orders', auth, retailerOnly, orderController.getMyOrders);
router.put('/:id/pay', auth, retailerOnly, orderController.payOrder);

// Admin order routes
router.get('/', auth, adminOnly, orderController.getAllOrders);
router.put('/:id/status', auth, adminOnly, [
    body('status').isIn(['confirmed', 'delivered', 'cancelled']).withMessage('Invalid status'),
    body('discountPercent').optional().isFloat({ min: 0, max: 100 }).withMessage('Discount must be 0-100'),
    body('paymentDueDate').optional().isISO8601().withMessage('Invalid due date'),
    validate
], orderController.updateStatus);

router.put('/:id/payment-status', auth, adminOnly, [
    body('paymentStatus').isIn(['unpaid', 'partial', 'paid']).withMessage('Invalid payment status'),
    validate
], orderController.updatePaymentStatus);

router.get('/pending-payments', auth, adminOnly, orderController.getPendingPayments);

// Shared routes
router.get('/:id', auth, orderController.getOrder);

module.exports = router;
