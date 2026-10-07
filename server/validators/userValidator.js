const Joi = require("joi");

const createUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(/[A-Z]/)
    .pattern(/[a-z]/)
    .pattern(/[0-9]/)
    .required(),
  role: Joi.string()
    .valid("Admin", "Manager", "SalesExecutive")
    .required()
});

const updateUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  role: Joi.string().valid("Admin", "Manager", "SalesExecutive"),
  isActive: Joi.boolean()
}).min(1);

module.exports = {
  createUserSchema,
  updateUserSchema
};