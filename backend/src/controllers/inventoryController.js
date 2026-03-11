const { Inventory, Product, Category } = require('../models');

// Get inventory logs
exports.getLogs = async (req, res) => {
    try {
        const { productId, changeType } = req.query;
        const filter = {};
        if (productId) filter.productId = productId;
        if (changeType) filter.changeType = changeType;

        const logs = await Inventory.find(filter)
            .populate('productId', 'name')
            .sort({ createdAt: -1 })
            .limit(200);

        const result = logs.map(log => {
            const obj = log.toObject();
            obj.product = obj.productId;
            delete obj.productId;
            return obj;
        });

        res.json({ logs: result });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch inventory logs', error: error.message });
    }
};

// Get low stock alert products
exports.getLowStockAlerts = async (req, res) => {
    try {
        const products = await Product.find({
            isActive: true,
            $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] }
        })
            .populate('categoryId', 'name')
            .sort({ stockQuantity: 1 });

        const result = products.map(p => {
            const obj = p.toObject();
            obj.category = obj.categoryId;
            return obj;
        });

        res.json({ products: result });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch low stock alerts', error: error.message });
    }
};

// Get inventory summary
exports.getSummary = async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments({ isActive: true });

        const totalStockResult = await Product.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: null, total: { $sum: '$stockQuantity' } } }
        ]);
        const totalStock = totalStockResult.length > 0 ? totalStockResult[0].total : 0;

        const lowStockCount = await Product.countDocuments({
            isActive: true,
            $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] }
        });

        const outOfStock = await Product.countDocuments({
            isActive: true,
            stockQuantity: 0
        });

        res.json({
            summary: {
                totalProducts,
                totalStock,
                lowStockCount,
                outOfStock
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch inventory summary', error: error.message });
    }
};
