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
const { validateContactBody } = require("../../middlewares/validateBody");

router.use(verifyToken);

router.get("/", listContacts);
router.get("/:id", getContactById);
router.post("/", validateContactBody, addContact);
router.put("/:id", validateContactBody, updateContact);
router.delete("/:id", removeContact);
router.patch("/:id/favorite", updateFavoriteStatus);

module.exports = router;
