const mongoose = require("mongoose");

const followUpSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer"
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead"
    },
    followUpDate: {
      type: Date,
      required: true
    },
    followUpType: {
      type: String,
      enum: ["Call", "Meeting", "Email", "Task"],
      required: true
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: 500
    },
    status: {
      type: String,
      enum: ["Planned", "Completed", "Missed", "Cancelled"],
      default: "Planned"
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("FollowUp", followUpSchema);