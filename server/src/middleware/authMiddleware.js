const jwt = require('jsonwebtoken');
const Member = require('../models/Member');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.member = await Member.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401).json({ message: '未授权，token无效' });
    }
  }

  if (!token) {
    res.status(401).json({ message: '未授权，缺少token' });
  }
};

const admin = (req, res, next) => {
  if (req.member && req.member.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: '需要管理员权限' });
  }
};

module.exports = { protect, admin };
