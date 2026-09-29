const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, "Full name is required"]
    },
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        select: false // Automatically hides password hashes from standard database lookups
    },
    role: {
        type: String,
        enum: ['Guard', 'Admin', 'SuperAdmin'],
        default: 'Guard' // Default tier restricts operations automatically
    }
}, { timestamps: true });

// PRE-SAVE HOOK FIXED: Clean async execution without clashing next() calls
userSchema.pre('save', async function () {
    // If the password hasn't been modified, skip hashing entirely
    if (!this.isModified('password')) return;

    // Generate salt and hash the raw password text string securely
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Helper validation utility attached straight to the schema documents
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Users', userSchema);
