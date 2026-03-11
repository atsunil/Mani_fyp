const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const retailerController = require('../controllers/retailerController');
const { auth, adminOnly } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.use(auth, adminOnly);

router.get('/', retailerController.getAllRetailers);
router.get('/:id', retailerController.getRetailer);

router.post('/', [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('shopName').notEmpty().withMessage('Shop name is required'),
    body('address').notEmpty().withMessage('Address is required'),
    validate
], retailerController.createRetailer);

router.put('/:id', retailerController.updateRetailer);
router.delete('/:id', retailerController.deleteRetailer);

module.exports = router;
