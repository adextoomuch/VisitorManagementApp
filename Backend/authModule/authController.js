const Users = require('../models/Users');
const jwt = require('jsonwebtoken');

// Helper function to sign JSON Web Tokens (JWT) for logged-in accounts
const signToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'fallback_secret_key_123', {
        expiresIn: '8h' // Security tokens automatically expire after 8 hours
    });
};

// 1. REGISTER NEW USERS (SuperAdmins & Admins use this to add staff members)
exports.registerUser = async (req, res) => {
    try {
        const { fullName, username, password, role } = req.body;

        // Validation: Prevent low-tier roles from elevating themselves during setup
        if (role === 'SuperAdmin') {
            return res.status(400).json({ success: false, message: "Cannot register an account with SuperAdmin tier privileges manually." });
        }

        const newUser = await Users.create({ fullName, username, password, role });

        res.status(201).json({
            success: true,
            message: `Account successfully created for ${newUser.fullName} as role: ${newUser.role}.`,
            data: {
                id: newUser._id,
                username: newUser.username,
                role: newUser.role
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// 2. LOGIN USER (With Automated SuperAdmin System Seeder Integration!)
exports.loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        // AUTOMATED SEEDER: Check if the database has absolutely zero accounts active
        const userCount = await Users.countDocuments();
        if (userCount === 0) {
            console.log("🚀 System Initialization: No accounts found. Seeding Master SuperAdmin account...");
            
            // This seeds your master profile cleanly into MongoDB
            await Users.create({
                fullName: "System Master SuperAdmin",
                username: "superadmin",
                password: "superadmin", // You can change this to your preferred master password
                role: "SuperAdmin"
            });
            
            console.log("✅ Master SuperAdmin successfully seeded. Username: superadmin");
        }

        if (!username || !password) {
            return res.status(400).json({ success: false, message: "Please provide both username and password." });
        }

        // Fetch user from MongoDB and explicitly request the hidden password field
        const user = await Users.findOne({ username }).select('+password');

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ success: false, message: "Invalid username or password credentials." });
        }

        // Generate a secure access token containing user identity and role assignment
        const token = signToken(user._id, user.role);

        res.status(200).json({
            success: true,
            message: `Login successful. Welcome back, ${user.fullName}!`,
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
