const Joi = require("joi");

const activitySchema = Joi.object({
  type: Joi.string()
    .valid("Call", "Meeting", "Email", "Task")
    .required(),
  subject: Joi.string().trim().min(2).max(150).required(),
  description: Joi.string().trim().max(500).allow(""),
  date: Joi.date().required(),
  customerId: Joi.string().allow(""),
  leadId: Joi.string().allow(""),
  assignedTo: Joi.string().required(),
  status: Joi.string().valid(
    "Planned",
    "Completed",
    "Cancelled"
  )
});

module.exports = {
  activitySchema
};