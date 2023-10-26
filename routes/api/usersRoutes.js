const express = require("express");
const router = express.Router();
const {
  register,
  login,
  updateSubscription,
  getCurrentUser,
  logout,
  uploadAvatar,
} = require("../../controllers/usersControllers");
const verifyToken = require("../../middlewares/authenticate");
const multer = require("multer");

router.post("/register", register);
router.post("/login", login);
router.get("/current", verifyToken, getCurrentUser);
router.patch("/subscription", verifyToken, updateSubscription);
router.post("/logout", verifyToken, logout);

const upload = multer({ dest: "tmp" });
router.patch("/avatars", verifyToken, upload.single("avatar"), uploadAvatar);

module.exports = router;
