const { Category } = require('../models');

// Get all categories
exports.getAll = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json({ categories });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
    }
};

// Get single category
exports.getOne = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.json({ category });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch category', error: error.message });
    }
};

// Create category
exports.create = async (req, res) => {
    try {
        const { name, description } = req.body;
        const existing = await Category.findOne({ name });
        if (existing) return res.status(400).json({ message: 'Category already exists' });

        const category = await Category.create({ name, description });
        res.status(201).json({ message: 'Category created', category });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create category', error: error.message });
    }
};

// Update category
exports.update = async (req, res) => {
    try {
        const { name, description, isActive } = req.body;
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { name, description, isActive },
            { new: true, runValidators: true }
        );
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.json({ message: 'Category updated', category });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update category', error: error.message });
    }
};

// Delete category
exports.delete = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete category', error: error.message });
    }
};
