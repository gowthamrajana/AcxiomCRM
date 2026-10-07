const Joi = require("joi");

const leadSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required(),
  company: Joi.string().trim().max(150).allow(""),
  source: Joi.string().trim().max(100).allow(""),
  status: Joi.string().valid(
    "New",
    "Contacted",
    "Qualified",
    "Unqualified",
    "Converted",
    "Lost"
  ),
  expectedValue: Joi.number().min(0).required(),
  assignedTo: Joi.string().required()
});

module.exports = {
  leadSchema
};