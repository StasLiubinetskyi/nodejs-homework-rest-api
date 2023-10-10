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

router.get("/", listContacts);
router.get("/:id", getContactById);
router.post("/", addContact);
router.put("/:id", updateContact);
router.delete("/:id", removeContact);
router.patch("/:id/favorite", updateFavoriteStatus);

module.exports = router;
