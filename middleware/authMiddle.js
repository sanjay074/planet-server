const jwt = require('jsonwebtoken');
const admin = require('../models/admin');

// Middleware to require sign-in and validate JWT token
async function requireSignIn(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: "Authorization token is missing or invalid",
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid token",
        });
    }
}

// Middleware to check if the user is an admin
async function isAdminMd(req, res, next) {
    try {
        const user = await admin.findById(req.userId);
        
        if (!user || !user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized access",
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error checking admin status",
        });
    }
}

// General auth middleware for token verification
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: "Authorization token is required",
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.userId = decoded.id;
        

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid token",
        });
    }
};

module.exports = {
    requireSignIn,
    isAdminMd,
    authMiddleware,
};
