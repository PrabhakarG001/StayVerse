const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        sparse: true, // Allows null/undefined if they sign up with phone
    },
    phone: {
        type: String,
        unique: true,
        sparse: true,
    },
    password: {
        type: String,
    },
    role: {
        type: String,
        enum: ['user', 'host'],
        default: 'user'
    },
    authProvider: {
        type: String,
        enum: ['local', 'google', 'apple', 'phone'],
        default: 'local'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    bookings: [
        {
            propertyId: String,
            name: String,
            image: String,
            price: String,
            date: {
                type: Date,
                default: Date.now
            },
            startDate: {
                type: Date
            },
            endDate: {
                type: Date
            }
        }
    ],
    wishlist: [
        {
            propertyId: String,
            name: String,
            location: String,
            price: String,
            rating: String,
            imageUrl: String,
            isPremium: Boolean
        }
    ]
});

module.exports = mongoose.model("User", userSchema);
