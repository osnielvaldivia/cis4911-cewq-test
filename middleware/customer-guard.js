const jwt = require('jsonwebtoken');
const config = require('config');
const roles = require('../models/roles');

module.exports = async function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if not token
  if (!token) {
    // Not authorized
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));
    req.user = decoded.user;

    try {
      // Get user from db
      const user = await User.findById(req.user.id).select('-password');

      if (user.role === roles.CUSTOMER || user.role === roles.SUPERADMIN) {
        // Authorized
        next();
      } else {
        // Forbidden
        return res.status(403).json({ msg: 'Forbidden' });
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
