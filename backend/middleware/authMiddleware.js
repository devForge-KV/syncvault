const jwt = require('jsonwebtoken');
const User = require('../models/User');

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return process.env.JWT_SECRET;
};

const protect = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, token required' });
    }

    const token = authorization.split(' ')[1];
    const decoded = jwt.verify(token, getJwtSecret());
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }

    return next(error);
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
  }

  return next();
};

const requireSuperAdmin = (req, res, next) => {
  const founderEmail = (process.env.FOUNDER_EMAIL || '').trim().toLowerCase();
  const userEmail = req.user?.email?.trim().toLowerCase();

  if (founderEmail && req.user?.role === 'superadmin' && userEmail === founderEmail) {
    return next();
  }

  return res.status(403).json({ success: false, message: 'Access Denied: Founder Only' });
};

module.exports = { protect, authorize, requireSuperAdmin };
