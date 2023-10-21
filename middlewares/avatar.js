const path = require("path");
const fs = require("fs").promises;
const Jimp = require("jimp");

const AVATARS_TMP_DIR = path.join(__dirname, "../tmp");
const AVATARS_PUBLIC_DIR = path.join(__dirname, "../public/avatars");

const uploadAvatar = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  req.avatarPath = req.file.path;
  next();
};

const saveAvatarToTmp = async (avatarPath) => {
  const newAvatarName = path.join(
    AVATARS_TMP_DIR,
    `${Date.now()}-${path.basename(avatarPath)}`
  );
  await fs.rename(avatarPath, newAvatarName);
  return newAvatarName;
};

const processAvatar = async (tempAvatarPath) => {
  const image = await Jimp.read(tempAvatarPath);
  await image.cover(250, 250).write(tempAvatarPath);
};

const moveAvatarToPublic = async (userId, avatarPath) => {
  const avatarName = `${userId}-${Date.now()}.png`;
  const newAvatarPath = path.join(AVATARS_PUBLIC_DIR, avatarName);
  await fs.rename(avatarPath, newAvatarPath);
  return `/avatars/${avatarName}`;
};

module.exports = {
  uploadAvatar,
  saveAvatarToTmp,
  processAvatar,
  moveAvatarToPublic,
};
