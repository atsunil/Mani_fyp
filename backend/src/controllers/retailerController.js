const { User, Retailer } = require('../models');

const generateUserId = () => {
    const digits = Math.floor(Math.random() * 900 + 100);
    const dd = String(Math.floor(Math.random() * 90 + 10));
    return `ASQ-${dd}-${digits}`;
};

// Get all retailers
exports.getAllRetailers = async (req, res) => {
    try {
        const users = await User.find({ role: 'retailer' }).sort({ createdAt: -1 });

        const retailers = await Promise.all(users.map(async (user) => {
            const retailerInfo = await Retailer.findOne({ userId: user._id });
            const obj = user.toJSON();
            obj.retailer = retailerInfo;
            return obj;
        }));

        res.json({ retailers });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch retailers', error: error.message });
    }
};

// Get single retailer
exports.getRetailer = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || user.role !== 'retailer') {
            return res.status(404).json({ message: 'Retailer not found' });
        }
        const retailerInfo = await Retailer.findOne({ userId: user._id });
        const obj = user.toJSON();
        obj.retailer = retailerInfo;
        res.json({ retailer: obj });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch retailer', error: error.message });
    }
};

// Create retailer (by admin)
exports.createRetailer = async (req, res) => {
    try {
        const { name, email, password, phone, shopName, address, city, state, pincode, gstNumber, drugLicenseNumber } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered.' });
        }

        let userId = generateUserId();
        while (await User.findOne({ userId })) {
            userId = generateUserId();
        }

        const user = await User.create({
            userId,
            name,
            email,
            password,
            phone,
            role: 'retailer'
        });

        await Retailer.create({
            userId: user._id,
            shopName: shopName || name + "'s Shop",
            address: address || '',
            city,
            state,
            pincode,
            gstNumber,
            drugLicenseNumber
        });

        const createdUser = await User.findById(user._id);
        const retailerInfo = await Retailer.findOne({ userId: user._id });
        const obj = createdUser.toJSON();
        obj.retailer = retailerInfo;

        res.status(201).json({ message: 'Retailer created successfully', retailer: obj });
    } catch (error) {
        console.error('Create retailer error:', error);
        res.status(500).json({ message: 'Failed to create retailer', error: error.message });
    }
};

// Update retailer
exports.updateRetailer = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || user.role !== 'retailer') {
            return res.status(404).json({ message: 'Retailer not found' });
        }

        const { name, email, phone, isActive, shopName, address, city, state, pincode, gstNumber, drugLicenseNumber, password } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (password) {
            user.password = password;
            await user.save(); // triggers pre-save hook for hashing
        }

        if (Object.keys(updateData).length > 0) {
            await User.findByIdAndUpdate(user._id, updateData);
        }

        const retailer = await Retailer.findOne({ userId: user._id });
        if (retailer) {
            const retailerData = {};
            if (shopName) retailerData.shopName = shopName;
            if (address) retailerData.address = address;
            if (city !== undefined) retailerData.city = city;
            if (state !== undefined) retailerData.state = state;
            if (pincode !== undefined) retailerData.pincode = pincode;
            if (gstNumber !== undefined) retailerData.gstNumber = gstNumber;
            if (drugLicenseNumber !== undefined) retailerData.drugLicenseNumber = drugLicenseNumber;
            if (Object.keys(retailerData).length > 0) {
                await Retailer.findByIdAndUpdate(retailer._id, retailerData);
            }
        }

        const updatedUser = await User.findById(user._id);
        const updatedRetailer = await Retailer.findOne({ userId: user._id });
        const obj = updatedUser.toJSON();
        obj.retailer = updatedRetailer;

        res.json({ message: 'Retailer updated', retailer: obj });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update retailer', error: error.message });
    }
};

// Delete retailer
exports.deleteRetailer = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || user.role !== 'retailer') {
            return res.status(404).json({ message: 'Retailer not found' });
        }

        await Retailer.deleteOne({ userId: user._id });
        await User.findByIdAndDelete(user._id);

        res.json({ message: 'Retailer deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete retailer', error: error.message });
    }
};
