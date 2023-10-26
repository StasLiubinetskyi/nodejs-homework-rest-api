const path = require("path");
const fs = require("fs").promises;
const Jimp = require("jimp");

const AVATARS_TMP_DIR = path.join(__dirname, "../tmp");
const AVATARS_PUBLIC_DIR = path.join(__dirname, "../public/avatars");

const saveAvatar = async (avatarPath) => {
  const newAvatarName = path.join(
    AVATARS_TMP_DIR,
    `${Date.now()}-${path.basename(avatarPath)}`
  );
  await fs.rename(avatarPath, newAvatarName);
  return newAvatarName;
};

const processAvatar = async (tempAvatarPath) => {
  const image = await Jimp.read(tempAvatarPath);
  image.resize(250, 250).write(tempAvatarPath);
};

const moveAvatar = async (userId, avatarPath) => {
  const avatarName = `${userId}-${Date.now()}.png`;
  const newAvatarPath = path.join(AVATARS_PUBLIC_DIR, avatarName);
  await processAvatar(avatarPath);
  await fs.rename(avatarPath, newAvatarPath);
  return `/avatars/${avatarName}`;
};

module.exports = {
  saveAvatar,
  processAvatar,
  moveAvatar,
};
