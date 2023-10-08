const Joi = require("joi");

const contactSchema = Joi.object({
  name: Joi.string().default("").min(1).required().messages({
    "string.empty": "missing required name field",
  }),
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    .required(),
  phone: Joi.string()
    .pattern(/^[0-9-+() ]+$/)
    .required(),
});

const updateContactSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    .optional(),
  phone: Joi.string()
    .pattern(/^[0-9-+() ]+$/)
    .optional(),
}).messages({
  "string.empty": "missing required {{#label}} field",
});

module.exports = {
  contactSchema,
  updateContactSchema,
};
