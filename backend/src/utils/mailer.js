const nodemailer = require('nodemailer');
require('dotenv').config();

// Create default transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
    port: process.env.EMAIL_PORT || 587,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendLowStockEmail = async (lowStockProducts, adminEmail) => {
    try {
        if (!lowStockProducts || lowStockProducts.length === 0) return;

        let itemsHtml = lowStockProducts.map(p => 
            `<li><strong>${p.name}</strong> (Stock: ${p.stockQuantity}, Threshold: ${p.lowStockThreshold})</li>`
        ).join('');

        const mailOptions = {
            from: process.env.EMAIL_FROM || '"MediLink Alerts" <atdharshini708@gmail.com>',
            to: adminEmail || process.env.ADMIN_EMAIL || 'atdharshini708@gmail.com',
            subject: '⚠️ Low Stock Alert - MediLink',
            html: `
                <h2>Low Stock Alert</h2>
                <p>The following products have fallen below their minimum stock threshold:</p>
                <ul>
                    ${itemsHtml}
                </ul>
                <p>Please reorder these products as soon as possible.</p>
                <p>Regards,<br>MediLink System</p>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Low stock alert email sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending low stock email:', error);
        throw error;
    }
};

const sendOrderConfirmationEmail = async (order, user) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM || '"MediLink Order" <atdharshini708@gmail.com>',
            to: user.email,
            subject: `Order Confirmation - ${order.orderNumber}`,
            html: `
                <h2>Thank you for your order!</h2>
                <p>Hello ${user.name},</p>
                <p>Your order <strong>${order.orderNumber}</strong> has been successfully placed and is currently <strong>${order.status}</strong>.</p>
                <p><strong>Order Summary:</strong></p>
                <ul>
                    ${order.items.map(item => `<li>${item.product.name} - ${item.quantity} x ₹${item.unitPrice} = ₹${item.totalPrice}</li>`).join('')}
                </ul>
                <p><strong>Total Amount: ₹${order.finalAmount}</strong></p>
                <p>Our team will review your order shortly. You can track your order status in the dashboard.</p>
                <p>Regards,<br>MediLink Team</p>
            `
        };
        await transporter.sendMail(mailOptions);
        console.log(`Order confirmation email sent to ${user.email}`);
    } catch (error) {
        console.error('Error sending order confirmation email:', error);
    }
};

const sendAdminOrderNotification = async (order, user) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM || '"MediLink Notification" <atdharshini708@gmail.com>',
            to: process.env.ADMIN_EMAIL || 'atdharshini708@gmail.com',
            subject: `New Order Received - ${order.orderNumber}`,
            html: `
                <h2>New Order Received</h2>
                <p>A new order has been placed by <strong>${user.name}</strong> (${user.email}).</p>
                <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                <p><strong>Total Amount:</strong> ₹${order.finalAmount}</p>
                <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/orders">Click here to view and manage orders</a></p>
                <p>Regards,<br>MediLink System</p>
            `
        };
        await transporter.sendMail(mailOptions);
        console.log(`Admin notified of new order ${order.orderNumber}`);
    } catch (error) {
        console.error('Error sending admin order notification:', error);
    }
};

const sendOrderStatusUpdateEmail = async (order, user) => {
    try {
        const statusDetails = {
            'confirmed': {
                subject: 'Order Confirmed - MediLink',
                title: 'Your order has been confirmed!',
                message: `Great news! Your order <strong>${order.orderNumber}</strong> has been confirmed by our team.`
            },
            'delivered': {
                subject: 'Order Delivered - MediLink',
                title: 'Your order has been delivered!',
                message: `Your order <strong>${order.orderNumber}</strong> has been marked as delivered. We hope you are satisfied with your purchase!`
            }
        };

        const details = statusDetails[order.status];
        if (!details) return;

        const mailOptions = {
            from: process.env.EMAIL_FROM || '"MediLink Updates" <atdharshini708@gmail.com>',
            to: user.email,
            subject: details.subject,
            html: `
                <h2>${details.title}</h2>
                <p>Hello ${user.name},</p>
                <p>${details.message}</p>
                <p><strong>Order Summary:</strong></p>
                <ul>
                    ${order.items.map(item => `<li>${item.product.name} - ${item.quantity} x ₹${item.unitPrice} = ₹${item.totalPrice}</li>`).join('')}
                </ul>
                <p><strong>Total Amount: ₹${order.finalAmount}</strong></p>
                <p>You can view full details in your dashboard.</p>
                <p>Regards,<br>MediLink Team</p>
            `
        };
        await transporter.sendMail(mailOptions);
        console.log(`Status update (${order.status}) email sent to ${user.email}`);
    } catch (error) {
        console.error('Error sending status update email:', error);
    }
};

module.exports = {
    sendLowStockEmail,
    sendOrderConfirmationEmail,
    sendAdminOrderNotification,
    sendOrderStatusUpdateEmail
};
