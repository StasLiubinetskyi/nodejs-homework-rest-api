const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { registrationSchema, loginSchema } = require("../schemas/usersSchemas");
const gravatar = require("gravatar");
const {
  saveAvatarToTmp,
  processAvatar,
  moveAvatarToPublic,
} = require("../middlewares/upload");

const fs = require("fs").promises;

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

    const avatarURL = gravatar.url(email, { s: "250", r: "x", d: "retro" });

    const user = new User({ email, password: hashedPassword, avatarURL }); // Додайте avatarURL

    await user.save();

    return res.status(201).json({
      user: {
        email: user.email,
        subscription: user.subscription,
        avatarURL: user.avatarURL,
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
    user.token = token;
    await user.save();

    return res.status(200).json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
        avatarURL: user.avatarURL,
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
  const { email, subscription, avatarURL } = req.user;
  res.status(200).json({
    email,
    subscription,
    avatarURL,
  });
};

exports.logout = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }
    user.token = undefined;
    await user.save();
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

  req.user.subscription = subscription;
  await req.user.save();

  return res.status(200).json({ subscription: req.user.subscription });
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const avatarPath = req.file.path;
    const user = req.user;

    const tempAvatarPath = await saveAvatarToTmp(avatarPath);
    const processedAvatar = await processAvatar(tempAvatarPath);
    const newAvatarPath = await moveAvatarToPublic(user._id, processedAvatar);
    fs.unlink(tempAvatarPath);

    user.avatarURL = newAvatarPath;
    await user.save();

    return res.status(200).json({ avatarURL: newAvatarPath });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};