const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const productController = require('../controllers/productController');
const { auth, adminOnly } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// Public product routes (authenticated)
router.get('/', auth, productController.getAll);
router.get('/admin/all', auth, adminOnly, productController.getAllAdmin);
router.get('/low-stock', auth, adminOnly, productController.getLowStock);
router.get('/:id', auth, productController.getOne);

// Admin-only product routes
router.post('/', auth, adminOnly, [
    body('name').notEmpty().withMessage('Product name is required'),
    body('categoryId').isMongoId().withMessage('Valid category is required'),
    body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
    validate
], productController.create);

router.put('/:id', auth, adminOnly, productController.update);
router.put('/:id/stock', auth, adminOnly, [
    body('quantity').isInt({ min: 0 }).withMessage('Valid quantity is required'),
    body('type').isIn(['addition', 'deduction', 'adjustment']).withMessage('Valid type is required'),
    validate
], productController.updateStock);
router.delete('/:id', auth, adminOnly, productController.delete);

module.exports = router;
