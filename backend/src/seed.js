const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
require('dotenv').config();
const { connectDB } = require('./config/database');
const User = require('./models/User');
const Retailer = require('./models/Retailer');
const Category = require('./models/Category');
const Product = require('./models/Product');

const seedDatabase = async () => {
    try {
        await connectDB();
        console.log('Connected to MongoDB');

        // Clear all collections
        await User.deleteMany({});
        await Retailer.deleteMany({});
        await Category.deleteMany({});
        await Product.deleteMany({});
        console.log('Collections cleared');

        // Create Admin (use save to trigger pre-save hook, or hash manually)
        const admin = await User.create({
            userId: 'ADM-01-001',
            name: 'Admin User',
            email: 'admin@medilink.com',
            password: 'admin123',
            role: 'admin',
            phone: '9876543210'
        });
        console.log('✅ Admin user created: admin@medilink.com / admin123');

        // Create sample retailers
        const retailer1 = await User.create({
            userId: 'ASQ-12-045',
            name: 'Rajesh Kumar',
            email: 'rajesh@pharmacy.com',
            password: 'retailer123',
            role: 'retailer',
            phone: '9123456780'
        });

        await Retailer.create({
            userId: retailer1._id,
            shopName: 'Kumar Medical Store',
            address: '123 Main Street, Market Area',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
            gstNumber: 'GST12345678',
            drugLicenseNumber: 'DL-MH-2024-001'
        });

        const retailer2 = await User.create({
            userId: 'ASQ-34-078',
            name: 'Priya Sharma',
            email: 'priya@medplus.com',
            password: 'retailer123',
            role: 'retailer',
            phone: '9876543211'
        });

        await Retailer.create({
            userId: retailer2._id,
            shopName: 'MedPlus Pharmacy',
            address: '456 Health Lane, City Center',
            city: 'Delhi',
            state: 'Delhi',
            pincode: '110001',
            gstNumber: 'GST87654321',
            drugLicenseNumber: 'DL-DL-2024-002'
        });

        console.log('✅ Sample retailers created');

        // Create categories
        const categories = await Category.insertMany([
            { name: 'Antibiotics', description: 'Medicines that fight bacterial infections' },
            { name: 'Pain Relief', description: 'Analgesics and anti-inflammatory drugs' },
            { name: 'Cardiovascular', description: 'Heart and blood vessel medicines' },
            { name: 'Diabetes', description: 'Insulin and oral hypoglycemic agents' },
            { name: 'Vitamins & Supplements', description: 'Essential vitamins and dietary supplements' },
            { name: 'Respiratory', description: 'Medicines for breathing and lung conditions' },
            { name: 'Gastrointestinal', description: 'Digestive system medicines' },
            { name: 'Dermatology', description: 'Skin care and treatment medicines' }
        ]);
        console.log('✅ Categories created');

        // Create products
        await Product.insertMany([
            { name: 'Amoxicillin 500mg', categoryId: categories[0]._id, description: 'Broad-spectrum antibiotic capsules', price: 85.50, costPrice: 55.00, stockQuantity: 500, lowStockThreshold: 50, expiryDate: new Date('2027-06-15'), manufacturer: 'Cipla', batchNumber: 'AMX-2024-001' },
            { name: 'Azithromycin 250mg', categoryId: categories[0]._id, description: 'Macrolide antibiotic tablets', price: 120.00, costPrice: 78.00, stockQuantity: 300, lowStockThreshold: 30, expiryDate: new Date('2027-08-20'), manufacturer: 'Sun Pharma', batchNumber: 'AZT-2024-002' },
            { name: 'Ciprofloxacin 500mg', categoryId: categories[0]._id, description: 'Fluoroquinolone antibiotic', price: 95.00, costPrice: 60.00, stockQuantity: 200, lowStockThreshold: 25, expiryDate: new Date('2027-04-10'), manufacturer: "Dr. Reddy's", batchNumber: 'CIP-2024-003' },
            { name: 'Paracetamol 500mg', categoryId: categories[1]._id, description: 'Fever and pain relief tablets', price: 25.00, costPrice: 12.00, stockQuantity: 1000, lowStockThreshold: 100, expiryDate: new Date('2028-01-30'), manufacturer: 'Cipla', batchNumber: 'PCM-2024-001' },
            { name: 'Ibuprofen 400mg', categoryId: categories[1]._id, description: 'Anti-inflammatory pain relief', price: 45.00, costPrice: 25.00, stockQuantity: 800, lowStockThreshold: 80, expiryDate: new Date('2027-11-15'), manufacturer: 'Sun Pharma', batchNumber: 'IBU-2024-002' },
            { name: 'Diclofenac 50mg', categoryId: categories[1]._id, description: 'Non-steroidal anti-inflammatory', price: 35.00, costPrice: 18.00, stockQuantity: 600, lowStockThreshold: 60, expiryDate: new Date('2027-09-25'), manufacturer: 'Lupin', batchNumber: 'DCF-2024-003' },
            { name: 'Amlodipine 5mg', categoryId: categories[2]._id, description: 'Calcium channel blocker for hypertension', price: 55.00, costPrice: 30.00, stockQuantity: 400, lowStockThreshold: 40, expiryDate: new Date('2027-12-20'), manufacturer: 'Cipla', batchNumber: 'AML-2024-001' },
            { name: 'Atorvastatin 10mg', categoryId: categories[2]._id, description: 'Cholesterol lowering statin', price: 75.00, costPrice: 42.00, stockQuantity: 350, lowStockThreshold: 35, expiryDate: new Date('2027-10-15'), manufacturer: 'Zydus', batchNumber: 'ATV-2024-002' },
            { name: 'Metformin 500mg', categoryId: categories[3]._id, description: 'Oral hypoglycemic for type 2 diabetes', price: 40.00, costPrice: 20.00, stockQuantity: 700, lowStockThreshold: 70, expiryDate: new Date('2028-03-10'), manufacturer: 'USV', batchNumber: 'MET-2024-001' },
            { name: 'Glimepiride 2mg', categoryId: categories[3]._id, description: 'Sulfonylurea antidiabetic', price: 65.00, costPrice: 35.00, stockQuantity: 250, lowStockThreshold: 25, expiryDate: new Date('2027-07-22'), manufacturer: 'Sanofi', batchNumber: 'GLM-2024-002' },
            { name: 'Vitamin C 500mg', categoryId: categories[4]._id, description: 'Ascorbic acid supplement tablets', price: 90.00, costPrice: 50.00, stockQuantity: 450, lowStockThreshold: 45, expiryDate: new Date('2028-06-15'), manufacturer: 'Mankind', batchNumber: 'VTC-2024-001' },
            { name: 'Multivitamin Tablets', categoryId: categories[4]._id, description: 'Daily multivitamin and mineral supplement', price: 150.00, costPrice: 85.00, stockQuantity: 300, lowStockThreshold: 30, expiryDate: new Date('2028-04-20'), manufacturer: 'Abbott', batchNumber: 'MVT-2024-002' },
            { name: 'Salbutamol Inhaler', categoryId: categories[5]._id, description: 'Bronchodilator metered-dose inhaler', price: 180.00, costPrice: 110.00, stockQuantity: 150, lowStockThreshold: 15, expiryDate: new Date('2027-08-30'), manufacturer: 'Cipla', batchNumber: 'SAL-2024-001' },
            { name: 'Montelukast 10mg', categoryId: categories[5]._id, description: 'Leukotriene receptor antagonist', price: 110.00, costPrice: 65.00, stockQuantity: 200, lowStockThreshold: 20, expiryDate: new Date('2027-11-10'), manufacturer: 'Sun Pharma', batchNumber: 'MON-2024-002' },
            { name: 'Pantoprazole 40mg', categoryId: categories[6]._id, description: 'Proton pump inhibitor for acid reflux', price: 60.00, costPrice: 32.00, stockQuantity: 550, lowStockThreshold: 55, expiryDate: new Date('2027-09-18'), manufacturer: 'Alkem', batchNumber: 'PAN-2024-001' },
            { name: 'Ondansetron 4mg', categoryId: categories[6]._id, description: 'Antiemetic for nausea and vomiting', price: 48.00, costPrice: 25.00, stockQuantity: 8, lowStockThreshold: 30, expiryDate: new Date('2027-05-25'), manufacturer: 'Zydus', batchNumber: 'OND-2024-002' },
            { name: 'Clotrimazole Cream 1%', categoryId: categories[7]._id, description: 'Antifungal topical cream', price: 75.00, costPrice: 40.00, stockQuantity: 5, lowStockThreshold: 20, expiryDate: new Date('2027-10-30'), manufacturer: 'Glenmark', batchNumber: 'CLT-2024-001' },
            { name: 'Betamethasone Cream', categoryId: categories[7]._id, description: 'Corticosteroid cream for skin inflammation', price: 95.00, costPrice: 55.00, stockQuantity: 180, lowStockThreshold: 18, expiryDate: new Date('2027-07-15'), manufacturer: 'GSK', batchNumber: 'BMT-2024-002' },
        ]);
        console.log('✅ Products created');

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📋 Login Credentials:');
        console.log('─────────────────────────────────');
        console.log('Admin:    admin@medilink.com / admin123');
        console.log('Retailer: rajesh@pharmacy.com / retailer123');
        console.log('Retailer: priya@medplus.com / retailer123');
        console.log('─────────────────────────────────\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedDatabase();
