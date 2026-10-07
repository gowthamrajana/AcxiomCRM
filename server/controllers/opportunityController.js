const Opportunity = require("../models/Opportunity");
const Customer = require("../models/Customer");
const Lead = require("../models/Lead");
const User = require("../models/User");
const createAuditLog = require("../services/auditService");

const validateOpportunityRules = (data) => {
  if (data.amount !== undefined && Number(data.amount) <= 0) {
    return "Opportunity amount must be greater than 0";
  }

  if (
    data.probability !== undefined &&
    (Number(data.probability) < 0 || Number(data.probability) > 100)
  ) {
    return "Probability must be between 0 and 100";
  }

  if (
    data.expectedCloseDate &&
    data.status !== "Won" &&
    data.status !== "Lost"
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const closeDate = new Date(data.expectedCloseDate);
    closeDate.setHours(0, 0, 0, 0);

    if (closeDate < today) {
      return "Expected close date cannot be in the past for an active opportunity";
    }
  }

  if (data.status === "Won" && data.stage !== "Won") {
    return "Won opportunity must have Won stage";
  }

  if (data.status === "Lost" && data.stage !== "Lost") {
    return "Lost opportunity must have Lost stage";
  }

  if (
    data.status === "Open" &&
    (data.stage === "Won" || data.stage === "Lost")
  ) {
    return "Open opportunity cannot have Won or Lost stage";
  }

  return null;
};

const validateReferences = async (data) => {
  if (data.customerId) {
    const customer = await Customer.findById(data.customerId);

    if (!customer) {
      return "Customer not found";
    }
  }

  if (data.leadId) {
    const lead = await Lead.findById(data.leadId);

    if (!lead) {
      return "Lead not found";
    }
  }

  if (data.assignedTo) {
    const user = await User.findById(data.assignedTo);

    if (!user) {
      return "Assigned user not found";
    }
  }

  return null;
};

const createOpportunity = async (req, res) => {
  try {
    const data = { ...req.body };

    if (req.user.role === "SalesExecutive") {
      data.assignedTo = req.user.userId;
    } else if (!data.assignedTo) {
      data.assignedTo = req.user.userId;
    }

    const ruleError = validateOpportunityRules(data);

    if (ruleError) {
      return res.status(400).json({
        message: ruleError
      });
    }

    const referenceError = await validateReferences(data);

    if (referenceError) {
      return res.status(400).json({
        message: referenceError
      });
    }

    const opportunity = await Opportunity.create(data);

    await createAuditLog({
      userId: req.user.userId,
      action: "CREATE",
      entityName: "Opportunity",
      recordId: opportunity._id.toString(),
      newValue: opportunity.toObject(),
      ipAddress: req.ip
    });

    res.status(201).json(opportunity);
  } catch (error) {
    res.status(400).json({
      message: "Failed to create opportunity",
      error: error.message
    });
  }
};

const getOpportunities = async (req, res) => {
  try {
    const filter = {};

    if (req.user.role === "SalesExecutive") {
      filter.assignedTo = req.user.userId;
    }

    const opportunities = await Opportunity.find(filter)
      .populate("customerId", "customerCode name email")
      .populate("leadId", "leadCode name email")
      .populate("assignedTo", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json(opportunities);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch opportunities",
      error: error.message
    });
  }
};

const getOpportunityById = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id)
      .populate("customerId", "customerCode name email")
      .populate("leadId", "leadCode name email")
      .populate("assignedTo", "name email role");

    if (!opportunity) {
      return res.status(404).json({
        message: "Opportunity not found"
      });
    }

    if (
      req.user.role === "SalesExecutive" &&
      opportunity.assignedTo._id.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    res.status(200).json(opportunity);
  } catch (error) {
    res.status(400).json({
      message: "Invalid opportunity ID"
    });
  }
};

const updateOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({
        message: "Opportunity not found"
      });
    }

    if (
      req.user.role === "SalesExecutive" &&
      opportunity.assignedTo.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    const data = { ...req.body };

    if (req.user.role === "SalesExecutive") {
      delete data.assignedTo;
    }

    const mergedData = {
      ...opportunity.toObject(),
      ...data
    };

    const ruleError = validateOpportunityRules(mergedData);

    if (ruleError) {
      return res.status(400).json({
        message: ruleError
      });
    }

    const referenceError = await validateReferences(data);

    if (referenceError) {
      return res.status(400).json({
        message: referenceError
      });
    }

    const oldValue = opportunity.toObject();

    Object.assign(opportunity, data);

    await opportunity.save();

    await createAuditLog({
      userId: req.user.userId,
      action: "UPDATE",
      entityName: "Opportunity",
      recordId: opportunity._id.toString(),
      oldValue,
      newValue: opportunity.toObject(),
      ipAddress: req.ip
    });

    res.status(200).json(opportunity);
  } catch (error) {
    res.status(400).json({
      message: "Failed to update opportunity",
      error: error.message
    });
  }
};

const deleteOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({
        message: "Opportunity not found"
      });
    }

    await Opportunity.findByIdAndDelete(req.params.id);

    await createAuditLog({
      userId: req.user.userId,
      action: "DELETE",
      entityName: "Opportunity",
      recordId: opportunity._id.toString(),
      oldValue: opportunity.toObject(),
      ipAddress: req.ip
    });

    res.status(200).json({
      message: "Opportunity deleted successfully"
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to delete opportunity",
      error: error.message
    });
  }
};

const getPipeline = async (req, res) => {
  try {
    const filter = {
      status: "Open"
    };

    if (req.user.role === "SalesExecutive") {
      filter.assignedTo = req.user.userId;
    }

    const opportunities = await Opportunity.find(filter);

    const weightedPipelineValue = opportunities.reduce(
      (total, opportunity) => {
        return (
          total +
          (opportunity.amount * opportunity.probability) / 100
        );
      },
      0
    );

    res.status(200).json({
      totalOpenOpportunities: opportunities.length,
      weightedPipelineValue
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to calculate pipeline",
      error: error.message
    });
  }
};

module.exports = {
  createOpportunity,
  getOpportunities,
  getOpportunityById,
  updateOpportunity,
  deleteOpportunity,
  getPipeline
};