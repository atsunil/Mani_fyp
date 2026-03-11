const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true,
        required: true,
        maxlength: 30
    },
    retailerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'delivered', 'cancelled'],
        default: 'pending',
        required: true
    },
    totalAmount: {
        type: Number,
        required: true,
        default: 0
    },
    discountPercent: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    discountAmount: {
        type: Number,
        default: 0
    },
    finalAmount: {
        type: Number,
        default: 0
    },
    paymentDueDate: {
        type: Date
    },
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'partial', 'paid'],
        default: 'unpaid'
    },
    shippingAddress: {
        type: String
    },
    notes: {
        type: String
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    confirmedAt: {
        type: Date
    },
    deliveredAt: {
        type: Date
    },
    paidAt: {
        type: Date
    }
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
