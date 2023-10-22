const express = require("express");
const router = express.Router();
const {
  register,
  login,
  updateSubscription,
  getCurrentUser,
  logout,
} = require("../../controllers/usersControllers");
const verifyToken = require("../../middlewares/authenticate");
const { uploadAvatar } = require("../../middlewares/upload");

router.post("/register", register);
router.post("/login", login);
router.get("/current", verifyToken, getCurrentUser);
router.patch("/subscription", verifyToken, updateSubscription);
router.post("/logout", verifyToken, logout);

router.post("/avatar", verifyToken, uploadAvatar, uploadAvatar);

module.exports = router;
