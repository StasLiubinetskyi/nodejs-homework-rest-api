const { contactSchema, updateContactSchema } = require("./validation");
const Joi = require("joi");

const validateBody = (schema) => {
  return (req, res, next) => {
    const { body } = req;
    const { error } = schema.validate(body);

    if (error instanceof Joi.ValidationError) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");
      return res.status(400).json({ message: errorMessage });
    }
    next();
  };
};

module.exports = {
  validateContactBody: validateBody(contactSchema),
  validateUpdateContactBody: validateBody(updateContactSchema),
};
