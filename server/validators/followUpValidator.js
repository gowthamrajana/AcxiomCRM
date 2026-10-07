const Joi = require("joi");

const followUpSchema = Joi.object({
  customerId: Joi.string(),
  leadId: Joi.string(),
  followUpDate: Joi.date().required(),
  followUpType: Joi.string()
    .valid("Call", "Meeting", "Email", "Task")
    .required(),
  remarks: Joi.string().trim().max(500).allow(""),
  status: Joi.string().valid(
    "Planned",
    "Completed",
    "Missed",
    "Cancelled"
  ),
  assignedTo: Joi.string().required()
});

module.exports = {
  followUpSchema
};
