const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const { JWT_SECRET } = process.env;

const verifyToken = async (req, res, next) => {
  const { authorization = "" } = req.headers;
  const [bearer, token] = authorization.split(" ");
  if (bearer !== "Bearer") {
    return res.status(401).json({ message: "Not authorized" });
  }
  try {
    const { id } = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(id);
    if (!user || !user.token) {
      return res.status(401).json({ message: "Not authorized" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized" });
  }
};

module.exports = verifyToken;
