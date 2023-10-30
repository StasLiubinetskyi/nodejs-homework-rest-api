const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { registrationSchema, loginSchema } = require("../schemas/usersSchemas");
const gravatar = require("gravatar");
const { moveAvatar } = require("../middlewares/upload");
const { v4: uuidv4 } = require("uuid");
const sendEmail = require("../middlewares/sendEmail");
require("dotenv").config();

const { BASE_URL } = process.env;

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.SECRET_KEY, {
    expiresIn: "1h",
  });
};

exports.register = async (req, res) => {
  const { email, password } = req.body;
  const { error } = registrationSchema.validate({ email, password });

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(400).json({ message: "Email in use" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const avatarURL = gravatar.url(email, { s: "250", r: "x", d: "retro" });

  const verificationToken = uuidv4();

  const verificationLink = `${BASE_URL}/api/users/verify/${verificationToken}`;

  const message = {
    subject: "Email Verification",
    from: process.env.UKR_NET_EMAIL,
    html: `Please click the following link to verify your email: <a href="${verificationLink}">Click Here</a>`,
    to: email,
  };

  await sendEmail(message);

  const user = new User({
    email,
    password: hashedPassword,
    avatarURL,
    verificationToken,
  });

  await user.save();

  return res.status(201).json({
    user: {
      email: user.email,
      subscription: user.subscription,
      avatarURL: user.avatarURL,
    },
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const { error } = loginSchema.validate({ email, password });

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: "Email or password is wrong" });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return res.status(400).json({ message: "Email or password is wrong" });
  }

  if (!user.verify) {
    return res.status(400).json({ message: "Email is not verified" });
  }

  const token = generateToken(user._id);

  return res.status(200).json({
    token,
    user: {
      email: user.email,
      subscription: user.subscription,
      avatarURL: user.avatarURL,
    },
  });
};

exports.getCurrentUser = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }

  const { email, subscription, avatarURL } = req.user;
  res.status(200).json({
    email,
    subscription,
    avatarURL,
  });
};

exports.logout = async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);

  if (!user) {
    return res.status(401).json({ message: "Not authorized" });
  }

  user.token = undefined;
  await user.save();
  return res.status(204).send();
};

exports.updateSubscription = async (req, res) => {
  const { subscription } = req.body;

  if (!["starter", "pro", "business"].includes(subscription)) {
    return res.status(400).json({ message: "Invalid subscription type" });
  }

  req.user.subscription = subscription;
  await req.user.save();

  return res.status(200).json({ subscription: req.user.subscription });
};

exports.uploadAvatar = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const avatarPath = req.file.path;
  const user = req.user;

  const newAvatarPath = await moveAvatar(user._id, avatarPath);

  user.avatarURL = newAvatarPath;
  await user.save();

  return res.status(200).json({ avatarURL: newAvatarPath });
};

exports.resendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.verify) {
    return res
      .status(400)
      .json({ message: "Verification has already been passed" });
  }

  const verificationToken = uuidv4();

  const verificationLink = `${BASE_URL}/api/users/verify/${verificationToken}`;

  const message = {
    subject: "Email Verification",
    from: process.env.UKR_NET_EMAIL,
    bodyHTML: `Please click the following link to verify your email: <a href="${verificationLink}">Click Here</a>`,
    to: user.email,
  };

  await sendEmail(message);

  user.verificationToken = verificationToken;
  await user.save();

  return res.status(200).json({ message: "Verification email sent" });
};
