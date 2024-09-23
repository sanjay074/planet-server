const jwt = require('jsonwebtoken');

const generateAccessToken = (userId) => {
    return jwt.sign(
      { id: userId },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } 
    );
  };
  
  const generateRefreshToken = (userId) => {
    return jwt.sign(
      { id: userId },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );
  }

module.exports={
  generateAccessToken,generateRefreshToken
}