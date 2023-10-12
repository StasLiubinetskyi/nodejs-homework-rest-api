const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const verifyToken = require("../../middlewares/authenticate");

router.post("/register", authController.register);
router.post("/login", authController.login);

router.get("/protected-route", verifyToken, (req, res) => {
  res.status(200).json({ message: "Protected route" });
});

router.patch("/subscription", verifyToken, authController.updateSubscription);

module.exports = router;
