const express = require("express");
const router = express.Router();
const {
  register,
  login,
  updateSubscription,
  getCurrentUser,
  logout,
} = require("../../controllers/authController");
const verifyToken = require("../../middlewares/authenticate");

router.post("/register", register);
router.post("/login", login);
router.get("/current", verifyToken, getCurrentUser);
router.patch("/subscription", verifyToken, updateSubscription);
router.post("/logout", verifyToken, logout);


module.exports = router;
