const Contact = require("../models/contacts");

exports.listContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.find();
    res.json(contacts);
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
    res.json(contact);
  } catch (error) {
    next(error);
  }
};

exports.addContact = async (req, res, next) => {
  const { body } = req;

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

  try {
    const updatedContact = await Contact.findByIdAndUpdate(id, body, {
      new: true,
    });

    if (!updatedContact) {
      res.status(404).json({ message: "Not found" });
      return;
    }

    res.json(updatedContact);
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
    res.json({ message: "Contact deleted" });
  } catch (error) {
    next(error);
  }
};
