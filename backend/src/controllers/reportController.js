const { Order, OrderItem, Product, User, Retailer, Payment } = require('../models');

// Get dashboard stats (admin)
exports.getDashboardStats = async (req, res) => {
    try {
        const totalRetailers = await User.countDocuments({ role: 'retailer', isActive: true });
        const totalProducts = await Product.countDocuments({ isActive: true });
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: 'pending' });

        const revenueResult = await Order.aggregate([
            { $match: { status: { $in: ['confirmed', 'delivered'] } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        const recentOrdersDocs = await Order.find()
            .populate('retailerId', 'userId name')
            .sort({ createdAt: -1 })
            .limit(5);

        const recentOrders = recentOrdersDocs.map(o => {
            const obj = o.toObject();
            obj.retailer = obj.retailerId;
            delete obj.retailerId;
            return obj;
        });

        // Monthly revenue (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyRevenue = await Order.aggregate([
            {
                $match: {
                    status: { $in: ['confirmed', 'delivered'] },
                    orderDate: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m', date: '$orderDate' } },
                    revenue: { $sum: '$totalAmount' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            {
                $project: {
                    _id: 0,
                    month: '$_id',
                    revenue: 1,
                    orders: 1
                }
            }
        ]);

        res.json({
            stats: {
                totalRetailers,
                totalProducts,
                totalOrders,
                pendingOrders,
                totalRevenue
            },
            recentOrders,
            monthlyRevenue
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch dashboard stats', error: error.message });
    }
};

// Helper to enrich orders with items and retailer info
const enrichOrders = async (orders) => {
    return Promise.all(orders.map(async (order) => {
        const items = await OrderItem.find({ orderId: order._id })
            .populate('productId', 'name price');

        const retailerInfo = order.retailerId
            ? await Retailer.findOne({ userId: order.retailerId._id || order.retailerId })
            : null;

        const orderObj = order.toObject ? order.toObject() : { ...order };
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
};

// Retailer sales report
exports.retailerReport = async (req, res) => {
    try {
        const { retailerId, startDate, endDate } = req.query;
        const filter = {};

        if (retailerId) filter.retailerId = retailerId;
        if (startDate && endDate) {
            filter.orderDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate + 'T23:59:59')
            };
        }

        const orders = await Order.find(filter)
            .populate('retailerId', 'userId name email')
            .sort({ orderDate: -1 });

        const enrichedOrders = await enrichOrders(orders);

        const totalOrders = enrichedOrders.length;
        const totalRevenue = enrichedOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
        const productsSold = enrichedOrders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);

        res.json({
            report: {
                totalOrders,
                totalRevenue,
                productsSold,
                orders: enrichedOrders
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to generate report', error: error.message });
    }
};

// Daily sales report
exports.dailyReport = async (req, res) => {
    try {
        const { date } = req.query;
        const targetDate = date || new Date().toISOString().split('T')[0];

        const orders = await Order.find({
            orderDate: {
                $gte: new Date(targetDate),
                $lte: new Date(targetDate + 'T23:59:59')
            }
        })
            .populate('retailerId', 'userId name')
            .sort({ createdAt: -1 });

        const enrichedOrders = await enrichOrders(orders);

        const totalOrders = enrichedOrders.length;
        const totalRevenue = enrichedOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
        const productsSold = enrichedOrders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);

        res.json({
            report: {
                date: targetDate,
                totalOrders,
                totalRevenue,
                productsSold,
                orders: enrichedOrders
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to generate daily report', error: error.message });
    }
};

// Overall sales report
exports.salesReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const filter = { status: { $in: ['confirmed', 'delivered'] } };

        if (startDate && endDate) {
            filter.orderDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate + 'T23:59:59')
            };
        }

        const orders = await Order.find(filter)
            .populate('retailerId', 'userId name')
            .sort({ orderDate: -1 });

        const enrichedOrders = await enrichOrders(orders);

        // Top products
        const productMap = {};
        enrichedOrders.forEach(order => {
            order.items.forEach(item => {
                const name = item.product?.name || 'Unknown';
                if (!productMap[name]) productMap[name] = { name, quantity: 0, revenue: 0 };
                productMap[name].quantity += item.quantity;
                productMap[name].revenue += parseFloat(item.totalPrice);
            });
        });

        const topProducts = Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
        const totalRevenue = enrichedOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);

        res.json({
            report: {
                totalOrders: enrichedOrders.length,
                totalRevenue,
                topProducts,
                orders: enrichedOrders
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to generate sales report', error: error.message });
    }
};
