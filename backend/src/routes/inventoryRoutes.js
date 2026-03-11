const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { auth, adminOnly } = require('../middleware/auth');

router.use(auth, adminOnly);

router.get('/logs', inventoryController.getLogs);
router.get('/low-stock', inventoryController.getLowStockAlerts);
router.get('/summary', inventoryController.getSummary);

module.exports = router;
