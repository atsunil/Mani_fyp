const jwt = require('jsonwebtoken');
const { User, Retailer } = require('../models');

const generateUserId = () => {
    const digits = Math.floor(Math.random() * 900 + 100);
    const dd = String(Math.floor(Math.random() * 90 + 10));
    return `ASQ-${dd}-${digits}`;
};

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role, userId: user.userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

// Register retailer
exports.register = async (req, res) => {
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

        const token = generateToken(user);

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: user.toJSON()
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: 'Account has been disabled. Contact admin.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const token = generateToken(user);

        res.json({
            message: 'Login successful',
            token,
            user: user.toJSON()
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
};

// Get current user profile
exports.getProfile = async (req, res) => {
    try {
        let user = await User.findById(req.user._id);
        let retailer = null;
        if (req.user.role === 'retailer') {
            retailer = await Retailer.findOne({ userId: req.user._id });
        }
        res.json({ user: { ...user.toJSON(), retailer } });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
    }
};

// Update profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, shopName, address, city, state, pincode, gstNumber, drugLicenseNumber } = req.body;

        await User.findByIdAndUpdate(req.user._id, { name, phone });

        if (req.user.role === 'retailer') {
            await Retailer.findOneAndUpdate(
                { userId: req.user._id },
                { shopName, address, city, state, pincode, gstNumber, drugLicenseNumber }
            );
        }

        const updatedUser = await User.findById(req.user._id);
        let retailer = null;
        if (req.user.role === 'retailer') {
            retailer = await Retailer.findOne({ userId: req.user._id });
        }

        res.json({ message: 'Profile updated', user: { ...updatedUser.toJSON(), retailer } });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update profile', error: error.message });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id).select('+password');
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect.' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to change password', error: error.message });
    }
};
