const verifyEmail = async (req, res, next) => {
  const verificationToken = req.params.verificationToken;
  const User = require("../models/userModel");

  try {
    if (!verificationToken) {
      return res.status(400).json({ message: "Invalid verification token" });
    }

    const user = await User.findOne({ verificationToken });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.verify) {
      return res
        .status(400)
        .json({ message: "Email has already been verified" });
    }

    if (user.verificationToken === null) {
      return res.status(400).json({ message: "Invalid verification token" });
    }

    user.verify = true;
    user.verificationToken = true;
    await user.save();

    return res.status(200).json({ message: "Email verification successful" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = verifyEmail;
