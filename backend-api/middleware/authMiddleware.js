const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token      = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Access denied. No token provided.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError'
      ? 'Token has expired. Please login again.'
      : 'Invalid token. Please login again.';
    return res.status(401).json({ status: 'error', message });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({
      status: 'error',
      message: 'Forbidden. You do not have permission to perform this action.',
    });
  }
  next();
};

module.exports = { authenticate, authorize };
