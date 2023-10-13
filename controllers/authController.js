const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { registrationSchema, loginSchema } = require("../schemas/userSchemas");

const generateToken = (userId) => {
  return jwt.sign({ userId }, "your-secret-key", {
    expiresIn: "1h",
  });
};

const handleRegistration = async (email, password) => {
  const { error } = registrationSchema.validate({ email, password });

  if (error) {
    throw new Error(error.details[0].message);
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("Email in use");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({ email, password: hashedPassword });
  await user.save();

  return user;
};

const handleLogin = async (email, password) => {
  const { error } = loginSchema.validate({ email, password });

  if (error) {
    throw new Error(error.details[0].message);
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Email or password is wrong");
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    throw new Error("Email or password is wrong");
  }

  return user;
};

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await handleRegistration(email, password);

    res.status(201).json({
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await handleLogin(email, password);

    const token = generateToken(user._id);

    res.status(200).json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: error.message });
  }
};

exports.getCurrentUser = async (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), "your-secret-key");

    const userId = decoded.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    res.status(200).json({
      email: user.email,
      subscription: user.subscription,
    });
  } catch (error) {
    return res.status(401).json({ message: "Not authorized" });
  }
};

exports.updateSubscription = async (req, res, next) => {
  const { subscription } = req.body;

  if (!["starter", "pro", "business"].includes(subscription)) {
    return res.status(400).json({ message: "Invalid subscription type" });
  }

  try {
    req.user.subscription = subscription;
    await req.user.save();

    res.status(200).json({ subscription: req.user.subscription });
  } catch (error) {
    next(error);
  }
};