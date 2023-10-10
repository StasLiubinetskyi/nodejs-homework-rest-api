const Joi = require("joi");

const contactSchema = Joi.object({
  name: Joi.string().required().messages({
    "any.required": "missing required 'name' field",
  }),
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    .optional(),
  phone: Joi.string()
    .pattern(/^[0-9-+() ]+$/)
    .optional(),
  favorite: Joi.boolean().optional(),
});

const updateFavoriteSchema = Joi.object({
  favorite: Joi.boolean().strict().required(),
});

module.exports = {
  contactSchema,
  updateFavoriteSchema,
};
