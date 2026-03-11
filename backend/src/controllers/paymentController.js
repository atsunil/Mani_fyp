const { Payment, Order, User, Retailer } = require('../models');

// Record payment
exports.recordPayment = async (req, res) => {
    try {
        const { orderId, retailerId, amountCollected, paymentMethod, paymentDate, notes, agentName } = req.body;

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        const retailer = await User.findById(retailerId);
        if (!retailer) return res.status(404).json({ message: 'Retailer not found' });

        let receiptImage = null;
        if (req.file) {
            receiptImage = req.file.filename;
        }

        const payment = await Payment.create({
            orderId,
            retailerId,
            agentName,
            amountCollected,
            paymentMethod,
            paymentDate,
            receiptImage,
            notes
        });

        res.status(201).json({ message: 'Payment recorded', payment });
    } catch (error) {
        res.status(500).json({ message: 'Failed to record payment', error: error.message });
    }
};

// Get all payments (admin)
exports.getAllPayments = async (req, res) => {
    try {
        const { verified, retailerId, startDate, endDate } = req.query;
        const filter = {};

        if (verified !== undefined) filter.isVerified = verified === 'true';
        if (retailerId) filter.retailerId = retailerId;
        if (startDate && endDate) {
            filter.paymentDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const payments = await Payment.find(filter)
            .populate('orderId', 'orderNumber totalAmount')
            .populate('retailerId', 'userId name email')
            .sort({ createdAt: -1 });

        // Enrich with retailer shop info
        const enrichedPayments = await Promise.all(payments.map(async (payment) => {
            const payObj = payment.toObject();

            // Map populated fields for frontend compatibility
            payObj.order = payObj.orderId;
            delete payObj.orderId;

            const retailerInfo = payObj.retailerId
                ? await Retailer.findOne({ userId: payObj.retailerId._id })
                : null;

            payObj.paymentRetailer = payObj.retailerId;
            if (payObj.paymentRetailer && retailerInfo) {
                payObj.paymentRetailer.retailer = { shopName: retailerInfo.shopName };
            }
            delete payObj.retailerId;

            return payObj;
        }));

        res.json({ payments: enrichedPayments });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch payments', error: error.message });
    }
};

// Verify payment (admin)
exports.verifyPayment = async (req, res) => {
    try {
        const payment = await Payment.findByIdAndUpdate(
            req.params.id,
            {
                isVerified: true,
                verifiedBy: req.user._id,
                verifiedAt: new Date()
            },
            { new: true }
        );
        if (!payment) return res.status(404).json({ message: 'Payment not found' });

        res.json({ message: 'Payment verified', payment });
    } catch (error) {
        res.status(500).json({ message: 'Failed to verify payment', error: error.message });
    }
};

// Get payment by order
exports.getByOrder = async (req, res) => {
    try {
        const payments = await Payment.find({ orderId: req.params.orderId })
            .populate('retailerId', 'userId name')
            .sort({ createdAt: -1 });

        const result = payments.map(p => {
            const obj = p.toObject();
            obj.paymentRetailer = obj.retailerId;
            delete obj.retailerId;
            return obj;
        });

        res.json({ payments: result });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch payments', error: error.message });
    }
};
