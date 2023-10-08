const Contact = require("../models/contactModel");
const {
  contactSchema,
  updateContactSchema,
} = require("../middlewares/validation");

exports.listContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.find();

    res.status(200).json(contacts);
  } catch (error) {
    next(error);
  }
};

exports.getContactById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const contact = await Contact.findById(id);

    if (!contact) {
      res.status(404).json({ message: "Not found" });
      return;
    }

    res.status(200).json(contact);
  } catch (error) {
    if (error.name === "CastError") {
      res.status(404).json({ message: "Not found" });
    } else {
      next(error);
    }
  }
};

exports.addContact = async (req, res, next) => {
  const { body } = req;

  const { error } = contactSchema.validate(body);

  if (error) {
    res.status(400).json({ message: error.details[0].message });
    return;
  }

  try {
    const newContact = await Contact.create(body);

    res.status(201).json(newContact);
  } catch (error) {
    next(error);
  }
};

exports.updateContact = async (req, res, next) => {
  const { id } = req.params;
  const { body } = req;

  const { error } = updateContactSchema.validate(body);

  if (error) {
    res.status(400).json({ message: error.details[0].message });
    return;
  }

  try {
    const updatedContact = await Contact.findByIdAndUpdate(id, body, {
      new: true,
    });

    if (!updatedContact) {
      res.status(404).json({ message: "Not found" });
      return;
    }

    res.status(200).json(updatedContact);
  } catch (error) {
    next(error);
  }
};

exports.removeContact = async (req, res, next) => {
  const { id } = req.params;
  try {
    const contact = await Contact.findById(id);
    if (!contact) {
      res.status(404).json({ message: "Not found" });
      return;
    }
    await Contact.findByIdAndDelete(id);
    res.status(200).json({ message: "Contact deleted" });
  } catch (error) {
    next(error);
  }
};

exports.updateFavoriteStatus = async (req, res, next) => {
  const { id } = req.params;
  const { favorite } = req.body;
  if (favorite === undefined) {
    return res.status(400).json({ message: "missing field favorite" });
  }
  try {
    const contact = await Contact.findByIdAndUpdate(
      id,
      { favorite },
      { new: true }
    );
    if (!contact) {
      return res.status(404).json({ message: "Not found" });
    }
    res.status(200).json(contact);
  } catch (error) {
    next(error);
  }
};
