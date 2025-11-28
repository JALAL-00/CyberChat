// backend/src/models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String, default: null }, // Simple placeholder
}, {
    timestamps: true,
});

// Hash password before saving
// Mongoose handles 'next' implicitly when an async function resolves successfully
UserSchema.pre('save', async function (next) { 
    if (!this.isModified('password')) {
        return next(); // Still need next() for the early exit path
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    // REMOVED 'next()' here, as the async function resolving fulfills the hook.
});

// Method to compare password
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', UserSchema);

module.exports = User;