const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { auth, adminOnly } = require('../middleware/auth');

router.use(auth, adminOnly);

router.get('/dashboard', reportController.getDashboardStats);
router.get('/retailer', reportController.retailerReport);
router.get('/daily', reportController.dailyReport);
router.get('/sales', reportController.salesReport);

module.exports = router;
