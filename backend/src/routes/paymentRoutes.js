const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const paymentController = require('../controllers/paymentController');
const { auth, adminOnly } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const upload = require('../middleware/upload');

router.use(auth);

router.post('/', upload.single('receiptImage'), [
    body('orderId').isMongoId().withMessage('Valid order ID is required'),
    body('retailerId').isMongoId().withMessage('Valid retailer ID is required'),
    body('amountCollected').isFloat({ min: 0 }).withMessage('Valid amount is required'),
    body('paymentMethod').isIn(['cash', 'upi', 'card', 'bank_transfer', 'cheque']).withMessage('Valid payment method required'),
    body('paymentDate').notEmpty().withMessage('Payment date is required'),
    validate
], paymentController.recordPayment);

router.get('/', adminOnly, paymentController.getAllPayments);
router.put('/:id/verify', adminOnly, paymentController.verifyPayment);
router.get('/order/:orderId', paymentController.getByOrder);

module.exports = router;
