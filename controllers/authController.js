const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { registrationSchema, loginSchema } = require("../schemas/userSchemas");

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.SECRET_KEY, {
    expiresIn: "1h",
  });
};

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
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

    return res.status(201).json({
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
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

    const token = generateToken(user._id);

    return res.status(200).json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: error.message });
  }
};

exports.getCurrentUser = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }
  const { email, subscription } = req.user;
  res.status(200).json({
    email,
    subscription,
  });
};

exports.logout = async (req, res) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.updateSubscription = async (req, res) => {
  const { subscription } = req.body;

  if (!["starter", "pro", "business"].includes(subscription)) {
    return res.status(400).json({ message: "Invalid subscription type" });
  }

  try {
    req.user.subscription = subscription;
    await req.user.save();

    return res.status(200).json({ subscription: req.user.subscription });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
