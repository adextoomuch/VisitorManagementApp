const jwt = require('jsonwebtoken');
const Users = require('../models/Users');

// A. VERIFY TOKEN GATEWAY: Validates if the user is logged into an authentic session
exports.protectRoute = async (req, res, next) => {
    try {
        let token;
        
        // Extract token from standard HTTP Authorization header "Bearer <token>"
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ success: false, message: "Access Denied: You must be logged in to view this resource." });
        }

        // Decode token to read user parameters
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_123');

        // Check if user still exists in the database
        const currentUser = await Users.findById(decoded.id);
        if (!currentUser) {
            return res.status(401).json({ success: false, message: "The user session belonging to this token no longer exists." });
        }

        // Attach user object globally to the request cycle for downstream filtering
        req.user = currentUser;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Session expired or invalid authorization token signature." });
    }
};

// B. ROLE CHECK SHIELD: Grants path entrance strictly if the user possesses matching privileges
exports.restrictTo = (...allowedRoles) => {
    return (req, res, next) => {
        // req.user was populated right above in protectRoute
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Forbidden: Your current authorization level (${req.user.role}) does not have permission to execute this operation.`
            });
        }
        next();
    };
};
