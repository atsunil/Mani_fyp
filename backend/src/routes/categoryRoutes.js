const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const categoryController = require('../controllers/categoryController');
const { auth, adminOnly } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.get('/', auth, categoryController.getAll);
router.get('/:id', auth, categoryController.getOne);

router.post('/', auth, adminOnly, [
    body('name').notEmpty().withMessage('Category name is required'),
    validate
], categoryController.create);

router.put('/:id', auth, adminOnly, categoryController.update);
router.delete('/:id', auth, adminOnly, categoryController.delete);

module.exports = router;
