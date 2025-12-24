const { verifyToken } = require('../utils/crypto');
const userRepository = require('../data/userRepository');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  try {
    const payload = verifyToken(token);
    const user = userRepository.findById(payload.sub);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid session.' });
    }

    req.user = { id: user.id, role: user.role, email: user.email, name: user.name };
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Insufficient privileges.' });
  }
  return next();
};

module.exports = {
  authenticate,
  authorize,
};
