const express = require("express");
const router = express.Router();
const {
  register,
  login,
  updateSubscription,
  getCurrentUser,
} = require("../../controllers/authController");
const verifyToken = require("../../middlewares/authenticate");

router.post("/register", register);
router.post("/login", login);
router.get("/current", verifyToken, getCurrentUser);
router.patch("/subscription", verifyToken, updateSubscription);



module.exports = router;
