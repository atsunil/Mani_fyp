const { Order, OrderItem, Product, User, Retailer, Inventory } = require('../models');
const mongoose = require('mongoose');
const { 
    sendOrderConfirmationEmail, 
    sendAdminOrderNotification, 
    sendOrderStatusUpdateEmail 
} = require('../utils/mailer');

const generateOrderNumber = () => {
    const now = new Date();
    const y = now.getFullYear().toString().slice(-2);
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const rand = Math.floor(Math.random() * 9000 + 1000);
    return `ORD-${y}${m}${d}-${rand}`;
};

// Helper to populate order with items and retailer info
const populateOrder = async (orderId) => {
    const order = await Order.findById(orderId)
        .populate('retailerId', 'userId name email phone');

    if (!order) return null;

    const items = await OrderItem.find({ orderId: order._id })
        .populate('productId');

    const retailerInfo = order.retailerId
        ? await Retailer.findOne({ userId: order.retailerId._id })
        : null;

    const orderObj = order.toObject();
    orderObj.retailer = orderObj.retailerId;
    if (orderObj.retailer && retailerInfo) {
        orderObj.retailer.retailer = retailerInfo;
    }
    delete orderObj.retailerId;

    orderObj.items = items.map(item => {
        const itemObj = item.toObject();
        itemObj.product = itemObj.productId;
        delete itemObj.productId;
        return itemObj;
    });

    return orderObj;
};

// Place an order (retailer)
exports.placeOrder = async (req, res) => {
    try {
        const { items, shippingAddress, notes } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Order must have at least one item' });
        }

        let orderNumber = generateOrderNumber();
        while (await Order.findOne({ orderNumber })) {
            orderNumber = generateOrderNumber();
        }

        let totalAmount = 0;
        const orderItemsData = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
            }
            if (!product.isActive) {
                return res.status(400).json({ message: `Product "${product.name}" is not available` });
            }
            if (product.stockQuantity < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for "${product.name}". Available: ${product.stockQuantity}` });
            }

            const itemTotal = parseFloat(product.price) * item.quantity;
            totalAmount += itemTotal;
            orderItemsData.push({
                productId: product._id,
                quantity: item.quantity,
                unitPrice: product.price,
                totalPrice: itemTotal
            });
        }

        const order = await Order.create({
            orderNumber,
            retailerId: req.user._id,
            status: 'pending',
            totalAmount,
            finalAmount: totalAmount,
            paymentStatus: 'unpaid',
            shippingAddress,
            notes
        });

        for (const itemData of orderItemsData) {
            await OrderItem.create({ ...itemData, orderId: order._id });
        }

        const createdOrder = await populateOrder(order._id);

        // Send confirmation emails (async)
        sendOrderConfirmationEmail(createdOrder, req.user);
        sendAdminOrderNotification(createdOrder, req.user);

        res.status(201).json({ message: 'Order placed successfully', order: createdOrder });
    } catch (error) {
        console.error('Place order error:', error);
        res.status(500).json({ message: 'Failed to place order', error: error.message });
    }
};

// Get all orders (admin)
exports.getAllOrders = async (req, res) => {
    try {
        const { status, retailerId, startDate, endDate } = req.query;
        const filter = {};

        if (status) filter.status = status;
        if (retailerId) filter.retailerId = retailerId;
        if (startDate && endDate) {
            filter.orderDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate + 'T23:59:59')
            };
        }

        const orders = await Order.find(filter)
            .populate('retailerId', 'userId name email')
            .sort({ createdAt: -1 });

        // Enrich with items and retailer shop info
        const enrichedOrders = await Promise.all(orders.map(async (order) => {
            const items = await OrderItem.find({ orderId: order._id })
                .populate('productId', 'name price');

            const retailerInfo = order.retailerId
                ? await Retailer.findOne({ userId: order.retailerId._id })
                : null;

            const orderObj = order.toObject();
            orderObj.retailer = orderObj.retailerId;
            if (orderObj.retailer && retailerInfo) {
                orderObj.retailer.retailer = { shopName: retailerInfo.shopName };
            }
            delete orderObj.retailerId;

            orderObj.items = items.map(item => {
                const itemObj = item.toObject();
                itemObj.product = itemObj.productId;
                delete itemObj.productId;
                return itemObj;
            });

            return orderObj;
        }));

        res.json({ orders: enrichedOrders });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
    }
};

// Get retailer's orders
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ retailerId: req.user._id })
            .sort({ createdAt: -1 });

        const enrichedOrders = await Promise.all(orders.map(async (order) => {
            const items = await OrderItem.find({ orderId: order._id })
                .populate('productId', 'name price');

            const orderObj = order.toObject();
            orderObj.items = items.map(item => {
                const itemObj = item.toObject();
                itemObj.product = itemObj.productId;
                delete itemObj.productId;
                return itemObj;
            });

            return orderObj;
        }));

        res.json({ orders: enrichedOrders });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
    }
};

// Get single order
exports.getOrder = async (req, res) => {
    try {
        const order = await populateOrder(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Retailer can only see their own orders
        const retailerIdStr = order.retailer?._id?.toString() || order.retailer?.toString();
        if (req.user.role === 'retailer' && retailerIdStr !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json({ order });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch order', error: error.message });
    }
};

// Update order status (admin)
exports.updateStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const orderItems = await OrderItem.find({ orderId: order._id });

        const { status, discountPercent, paymentDueDate } = req.body;
        const validTransitions = {
            'pending': ['confirmed', 'cancelled'],
            'confirmed': ['delivered', 'cancelled'],
            'delivered': [],
            'cancelled': []
        };

        if (!validTransitions[order.status]?.includes(status)) {
            return res.status(400).json({ message: `Cannot change status from ${order.status} to ${status}` });
        }

        if (status === 'confirmed') {
            order.confirmedAt = new Date();

            // Apply discount if provided by admin
            if (discountPercent !== undefined && discountPercent > 0) {
                const dp = Math.min(Math.max(parseFloat(discountPercent), 0), 100);
                order.discountPercent = dp;
                order.discountAmount = parseFloat((order.totalAmount * dp / 100).toFixed(2));
                order.finalAmount = parseFloat((order.totalAmount - order.discountAmount).toFixed(2));
            } else {
                order.discountPercent = 0;
                order.discountAmount = 0;
                order.finalAmount = order.totalAmount;
            }

            // Set payment due date if provided
            if (paymentDueDate) {
                order.paymentDueDate = new Date(paymentDueDate);
            }

            // Deduct stock on confirmation
            for (const item of orderItems) {
                const product = await Product.findById(item.productId);
                if (product) {
                    const prevQty = product.stockQuantity;
                    const newQty = prevQty - item.quantity;
                    if (newQty < 0) {
                        return res.status(400).json({ message: `Insufficient stock for product ID ${product._id}` });
                    }
                    product.stockQuantity = newQty;
                    await product.save();
                    await Inventory.create({
                        productId: product._id,
                        changeType: 'deduction',
                        quantityChanged: item.quantity,
                        previousQuantity: prevQty,
                        newQuantity: newQty,
                        reason: `Order ${order.orderNumber} confirmed`,
                        orderId: order._id,
                        updatedByUserId: req.user._id
                    });
                }
            }
        }
        if (status === 'delivered') order.deliveredAt = new Date();

        order.status = status;
        await order.save();

        const updatedOrder = await populateOrder(order._id);

        // Send status update email if confirmed or delivered
        if (status === 'confirmed' || status === 'delivered') {
            if (updatedOrder.retailer) {
                sendOrderStatusUpdateEmail(updatedOrder, updatedOrder.retailer);
            }
        }

        res.json({ message: `Order ${status}`, order: updatedOrder });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ message: 'Failed to update order status', error: error.message });
    }
};

// Update payment status (admin)
exports.updatePaymentStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const { paymentStatus } = req.body;
        if (!['unpaid', 'partial', 'paid'].includes(paymentStatus)) {
            return res.status(400).json({ message: 'Invalid payment status' });
        }

        order.paymentStatus = paymentStatus;
        await order.save();

        const updatedOrder = await populateOrder(order._id);
        res.json({ message: `Payment marked as ${paymentStatus}`, order: updatedOrder });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update payment status', error: error.message });
    }
};

// Retailer pays their own order
exports.payOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Verify this order belongs to the logged-in retailer
        if (order.retailerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (!['confirmed', 'delivered'].includes(order.status)) {
            return res.status(400).json({ message: 'Can only pay for confirmed or delivered orders' });
        }

        if (order.paymentStatus === 'paid') {
            return res.status(400).json({ message: 'Order is already paid' });
        }

        order.paymentStatus = 'paid';
        order.paidAt = new Date();
        await order.save();

        const updatedOrder = await populateOrder(order._id);
        res.json({ message: 'Payment successful', order: updatedOrder });
    } catch (error) {
        res.status(500).json({ message: 'Payment failed', error: error.message });
    }
};

// Admin: get all pending payments grouped by retailer
exports.getPendingPayments = async (req, res) => {
    try {
        const orders = await Order.find({
            status: { $in: ['confirmed', 'delivered'] },
            paymentStatus: { $ne: 'paid' }
        })
            .populate('retailerId', 'userId name email phone')
            .sort({ paymentDueDate: 1, createdAt: -1 });

        // Group by retailer
        const retailerMap = {};
        for (const order of orders) {
            const retailerId = order.retailerId?._id?.toString();
            if (!retailerId) continue;

            if (!retailerMap[retailerId]) {
                const retailerInfo = await Retailer.findOne({ userId: order.retailerId._id });
                retailerMap[retailerId] = {
                    retailer: {
                        _id: order.retailerId._id,
                        userId: order.retailerId.userId,
                        name: order.retailerId.name,
                        email: order.retailerId.email,
                        phone: order.retailerId.phone,
                        shopName: retailerInfo?.shopName || '',
                        city: retailerInfo?.city || ''
                    },
                    orders: [],
                    totalDue: 0,
                    overdueAmount: 0,
                    overdueCount: 0
                };
            }

            const amount = parseFloat(order.finalAmount || order.totalAmount);
            retailerMap[retailerId].orders.push({
                _id: order._id,
                orderNumber: order.orderNumber,
                totalAmount: order.totalAmount,
                discountPercent: order.discountPercent,
                finalAmount: order.finalAmount,
                paymentDueDate: order.paymentDueDate,
                paymentStatus: order.paymentStatus,
                status: order.status,
                orderDate: order.orderDate
            });
            retailerMap[retailerId].totalDue += amount;

            if (order.paymentDueDate && new Date(order.paymentDueDate) < new Date()) {
                retailerMap[retailerId].overdueAmount += amount;
                retailerMap[retailerId].overdueCount++;
            }
        }

        const retailers = Object.values(retailerMap).sort((a, b) => b.totalDue - a.totalDue);
        const grandTotal = retailers.reduce((s, r) => s + r.totalDue, 0);
        const totalOverdue = retailers.reduce((s, r) => s + r.overdueAmount, 0);

        res.json({ retailers, grandTotal, totalOverdue, totalOrders: orders.length });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch pending payments', error: error.message });
    }
};
