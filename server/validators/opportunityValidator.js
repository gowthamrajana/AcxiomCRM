const Joi = require("joi");

const opportunitySchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).required(),
  customerId: Joi.string().allow(""),
  leadId: Joi.string().allow(""),
  amount: Joi.number().positive().required(),
  stage: Joi.string().valid(
    "Qualification",
    "Proposal",
    "Negotiation",
    "Won",
    "Lost"
  ),
  probability: Joi.number().min(0).max(100).required(),
  expectedCloseDate: Joi.date().required(),
  status: Joi.string().valid("Open", "Won", "Lost"),
  assignedTo: Joi.string().required()
});

module.exports = {
  opportunitySchema
};
