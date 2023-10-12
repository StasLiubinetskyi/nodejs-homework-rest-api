const express = require("express");
const router = express.Router();
const {
  listContacts,
  getContactById,
  addContact,
  updateContact,
  removeContact,
  updateFavoriteStatus,
} = require("../../controllers/contactsСontrollers");
const verifyToken = require("../../middlewares/authenticate");

router.get("/", verifyToken, listContacts);
router.get("/:id", verifyToken, getContactById);
router.post("/", verifyToken, addContact);
router.put("/:id", verifyToken, updateContact);
router.delete("/:id", verifyToken, removeContact);
router.patch("/:id/favorite", verifyToken, updateFavoriteStatus);

module.exports = router;
