const { Product, Category, Inventory } = require('../models');

// Get all products
exports.getAll = async (req, res) => {
    try {
        const { category, search, inStock } = req.query;
        const filter = { isActive: true };

        if (category) filter.categoryId = category;
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            filter.$or = [
                { name: searchRegex },
                { description: searchRegex },
                { manufacturer: searchRegex }
            ];
        }
        if (inStock === 'true') filter.stockQuantity = { $gt: 0 };

        const products = await Product.find(filter)
            .populate('categoryId', 'name')
            .sort({ name: 1 });

        // Map to keep consistent response shape
        const result = products.map(p => {
            const obj = p.toObject();
            obj.category = obj.categoryId;
            return obj;
        });

        res.json({ products: result });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch products', error: error.message });
    }
};

// Get all products (admin - includes inactive)
exports.getAllAdmin = async (req, res) => {
    try {
        const products = await Product.find()
            .populate('categoryId', 'name')
            .sort({ name: 1 });

        const result = products.map(p => {
            const obj = p.toObject();
            obj.category = obj.categoryId;
            return obj;
        });

        res.json({ products: result });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch products', error: error.message });
    }
};

// Get single product
exports.getOne = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('categoryId');
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const obj = product.toObject();
        obj.category = obj.categoryId;

        res.json({ product: obj });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch product', error: error.message });
    }
};

// Create product
exports.create = async (req, res) => {
    try {
        const { name, categoryId, description, price, costPrice, stockQuantity, lowStockThreshold, expiryDate, manufacturer, batchNumber } = req.body;

        const product = await Product.create({
            name, categoryId, description, price, costPrice,
            stockQuantity: stockQuantity || 0,
            lowStockThreshold: lowStockThreshold || 10,
            expiryDate, manufacturer, batchNumber
        });

        // Log initial inventory
        if (stockQuantity > 0) {
            await Inventory.create({
                productId: product._id,
                changeType: 'addition',
                quantityChanged: stockQuantity,
                previousQuantity: 0,
                newQuantity: stockQuantity,
                reason: 'Initial stock',
                updatedByUserId: req.user._id
            });
        }

        const createdProduct = await Product.findById(product._id)
            .populate('categoryId');
        const obj = createdProduct.toObject();
        obj.category = obj.categoryId;

        res.status(201).json({ message: 'Product created', product: obj });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create product', error: error.message });
    }
};

// Update product
exports.update = async (req, res) => {
    try {
        const { name, categoryId, description, price, costPrice, lowStockThreshold, expiryDate, manufacturer, batchNumber, isActive } = req.body;

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { name, categoryId, description, price, costPrice, lowStockThreshold, expiryDate, manufacturer, batchNumber, isActive },
            { new: true, runValidators: true }
        ).populate('categoryId');

        if (!product) return res.status(404).json({ message: 'Product not found' });

        const obj = product.toObject();
        obj.category = obj.categoryId;

        res.json({ message: 'Product updated', product: obj });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update product', error: error.message });
    }
};

// Update stock
exports.updateStock = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const { quantity, type, reason } = req.body;
        const previousQuantity = product.stockQuantity;
        let newQuantity;

        if (type === 'addition') {
            newQuantity = previousQuantity + quantity;
        } else if (type === 'deduction') {
            if (previousQuantity < quantity) {
                return res.status(400).json({ message: 'Insufficient stock' });
            }
            newQuantity = previousQuantity - quantity;
        } else {
            newQuantity = quantity; // adjustment - set exact value
        }

        product.stockQuantity = newQuantity;
        await product.save();

        await Inventory.create({
            productId: product._id,
            changeType: type || 'adjustment',
            quantityChanged: quantity,
            previousQuantity,
            newQuantity,
            reason: reason || 'Manual update',
            updatedByUserId: req.user._id
        });

        res.json({ message: 'Stock updated', product });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update stock', error: error.message });
    }
};

// Delete product
exports.delete = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product removed' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete product', error: error.message });
    }
};

// Get low stock products
exports.getLowStock = async (req, res) => {
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
        res.status(500).json({ message: 'Failed to fetch low stock products', error: error.message });
    }
};
