const Joi = require("joi");

const customerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required(),
  company: Joi.string().trim().max(150).allow(""),
  address: Joi.string().trim().max(250).allow(""),
  city: Joi.string().trim().max(100).allow(""),
  state: Joi.string().trim().max(100).allow(""),
  status: Joi.string().valid("Active", "Inactive")
});

module.exports = {
  customerSchema
};