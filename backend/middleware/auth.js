const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'; // Change this to a secure password

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization header missing or invalid' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    if (token !== adminPassword) {
        return res.status(403).json({ error: 'Invalid credentials' });
    }

    next();
};

module.exports = authMiddleware;