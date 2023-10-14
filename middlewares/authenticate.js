const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const userId = decoded.userId;

    User.findById(userId, (err, user) => {
      if (err || !user) {
        return res.status(401).json({ message: "Not authorized" });
      }

      req.user = user;
      next();
    });
  } catch (error) {
    return res.status(401).json({ message: "Not authorized" });
  }
};

module.exports = verifyToken;
