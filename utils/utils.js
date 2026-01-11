const jwt = require('jsonwebtoken');

const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret_key_change_in_production', {
    expiresIn: '15d',
  });

  res.cookie('jwt', token, {
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
    httpOnly: true, // prevents XSS attacks
    sameSite: 'strict', // CSRF protection
    secure: process.env.NODE_ENV !== 'development', // HTTPS in production
  });
};

module.exports = { generateToken };

