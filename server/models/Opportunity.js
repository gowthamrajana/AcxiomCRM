const mongoose = require("mongoose");

const opportunitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer"
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead"
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    stage: {
      type: String,
      enum: [
        "Qualification",
        "Proposal",
        "Negotiation",
        "Won",
        "Lost"
      ],
      default: "Qualification"
    },
    probability: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    expectedCloseDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ["Open", "Won", "Lost"],
      default: "Open"
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

module.exports = mongoose.model("Opportunity", opportunitySchema);