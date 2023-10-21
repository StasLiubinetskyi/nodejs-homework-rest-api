const mongoose = require("mongoose");
const Contact = require("../models/contactsModel");
const {
  contactSchema,
  updateFavoriteSchema,
} = require("../schemas/contactsSchemas");

exports.listContacts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const favorite = req.query.favorite === "true" || false; 

    const skip = (page - 1) * limit;

    const query = { owner: req.user._id };
    if (favorite) {
      query.favorite = true;
    }

    const contacts = await Contact.find(query).skip(skip).limit(limit).exec();

    res.status(200).json(contacts);
  } catch (error) {
    next(error);
  }
};


exports.getContactById = async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).json({ message: "Not found" });
    return;
  }

  try {
    const contact = await Contact.findById(id);

    if (!contact) {
      res.status(404).json({ message: "Not found" });
      return;
    }

    res.status(200).json(contact);
  } catch (error) {
    next(error);
  }
};

exports.addContact = async (req, res, next) => {
  const { body } = req;
  const existingContact = await Contact.findOne({
    $or: [{ email: body.email }, { phone: body.phone }],
  });

  if (existingContact) {
    return res
      .status(400)
      .json({ message: "A contact with this information already exists" });
  }

  const requiredFields = ["name", "email", "phone"];
  const errorMessages = {
    name: "missing required 'name' field",
    email: "missing required 'email' field",
    phone: "missing required 'phone' field",
  };
  const missingFields = requiredFields.filter((field) => !body[field]);

  if (missingFields.length > 0) {
    return res.status(400).json({ message: errorMessages[missingFields[0]] });
  }

  const { error } = contactSchema.validate(body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const newContact = await Contact.create({ ...body, owner: req.user._id });
    res.status(201).json(newContact);
  } catch (error) {
    next(error);
  }
};

exports.updateContact = async (req, res, next) => {
  const { id } = req.params;
  const { body } = req;

  const { error } = contactSchema.validate(body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
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

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).json({ message: "Not found" });
    return;
  }
  try {
    const contact = await Contact.findByIdAndDelete(id);
    if (!contact) {
      res.status(404).json({ message: "Not found" });
      return;
    }
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

  const { error } = updateFavoriteSchema.validate({ favorite });

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
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
