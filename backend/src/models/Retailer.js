const mongoose = require('mongoose');

const retailerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    shopName: {
        type: String,
        required: true,
        maxlength: 150
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        maxlength: 100
    },
    state: {
        type: String,
        maxlength: 100
    },
    pincode: {
        type: String,
        maxlength: 10
    },
    gstNumber: {
        type: String,
        maxlength: 20
    },
    drugLicenseNumber: {
        type: String,
        maxlength: 50
    }
}, {
    timestamps: true
});

const Retailer = mongoose.model('Retailer', retailerSchema);

module.exports = Retailer;
