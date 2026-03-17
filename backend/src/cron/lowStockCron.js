const cron = require('node-cron');
const Product = require('../models/Product');
const User = require('../models/User');
const { sendLowStockEmail } = require('../utils/mailer');

const startLowStockCron = () => {
    // Run every day at 08:00 AM
    cron.schedule('0 8 * * *', async () => {
        console.log('Running background task: Checking for low stock products...');
        try {
            // Find products where stockQuantity <= lowStockThreshold and is active
            const lowStockProducts = await Product.find({
                isActive: true,
                $expr: { $lte: ["$stockQuantity", "$lowStockThreshold"] }
            });

            if (lowStockProducts.length > 0) {
                // Find admin email
                const admin = await User.findOne({ role: 'admin' });
                const adminEmail = admin ? admin.email : null;

                if (adminEmail) {
                    await sendLowStockEmail(lowStockProducts, adminEmail);
                    console.log(`Low stock alert sent to Admin: ${adminEmail} for ${lowStockProducts.length} items`);
                } else {
                    console.error('Low stock products found, but no admin user exists to email.');
                }
            } else {
                console.log('Stock levels are sufficient. No need to send alerts.');
            }
        } catch (error) {
            console.error('Error in low stock background task:', error);
        }
    });
    console.log('Cron job initialized: Low stock checks scheduled daily at 08:00 AM');
};

module.exports = { startLowStockCron };
