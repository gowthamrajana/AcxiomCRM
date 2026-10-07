const FollowUp = require("../models/FollowUp");
const Customer = require("../models/Customer");
const Lead = require("../models/Lead");
const User = require("../models/User");
const createAuditLog = require("../services/auditService");

const validateFollowUpDate = (data) => {
  if (data.status === "Completed") {
    return null;
  }

  if (!data.followUpDate) {
    return "Follow-up date is required";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const followUpDate = new Date(data.followUpDate);
  followUpDate.setHours(0, 0, 0, 0);

  if (followUpDate < today) {
    return "Follow-up date cannot be in the past";
  }

  return null;
};

const validateReferences = async (data) => {
  if (!data.customerId && !data.leadId) {
    return "Customer or Lead is required";
  }

  if (data.customerId && data.leadId) {
    return "Follow-up cannot belong to both Customer and Lead";
  }

  if (data.customerId) {
    const customer = await Customer.findById(data.customerId);
    if (!customer) return "Customer not found";
  }

  if (data.leadId) {
    const lead = await Lead.findById(data.leadId);
    if (!lead) return "Lead not found";
  }

  if (data.assignedTo) {
    const user = await User.findById(data.assignedTo);
    if (!user) return "Assigned user not found";
  }

  return null;
};

const createFollowUp = async (req, res) => {
  try {
    const data = { ...req.body };

    if (req.user.role === "SalesExecutive") {
      data.assignedTo = req.user.userId;
    } else if (!data.assignedTo) {
      data.assignedTo = req.user.userId;
    }

    const dateError = validateFollowUpDate(data);
    if (dateError) {
      return res.status(400).json({ message: dateError });
    }

    const referenceError = await validateReferences(data);
    if (referenceError) {
      return res.status(400).json({ message: referenceError });
    }

    const followUp = await FollowUp.create(data);

    await createAuditLog({
      userId: req.user.userId,
      action: "CREATE",
      entityName: "FollowUp",
      recordId: followUp._id.toString(),
      newValue: followUp.toObject(),
      ipAddress: req.ip
    });

    res.status(201).json(followUp);
  } catch (error) {
    res.status(400).json({
      message: "Failed to create follow-up",
      error: error.message
    });
  }
};

const getFollowUps = async (req, res) => {
  try {
    const filter = {};

    if (req.user.role === "SalesExecutive") {
      filter.assignedTo = req.user.userId;
    }

    const followUps = await FollowUp.find(filter)
      .populate("customerId", "name email phone")
      .populate("leadId", "name email phone")
      .populate("assignedTo", "name email role")
      .sort({ followUpDate: 1 });

    res.status(200).json(followUps);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch follow-ups",
      error: error.message
    });
  }
};

const getFollowUpById = async (req, res) => {
  try {
    const followUp = await FollowUp.findById(req.params.id)
      .populate("customerId", "name email phone")
      .populate("leadId", "name email phone")
      .populate("assignedTo", "name email role");

    if (!followUp) {
      return res.status(404).json({
        message: "Follow-up not found"
      });
    }

    if (
      req.user.role === "SalesExecutive" &&
      followUp.assignedTo._id.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    res.status(200).json(followUp);
  } catch (error) {
    res.status(400).json({
      message: "Invalid follow-up ID"
    });
  }
};

const updateFollowUp = async (req, res) => {
  try {
    const followUp = await FollowUp.findById(req.params.id);

    if (!followUp) {
      return res.status(404).json({
        message: "Follow-up not found"
      });
    }

    if (
      req.user.role === "SalesExecutive" &&
      followUp.assignedTo.toString() !== req.user.userId
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
      ...followUp.toObject(),
      ...data
    };

    const dateError = validateFollowUpDate(mergedData);
    if (dateError) {
      return res.status(400).json({ message: dateError });
    }

    const referenceError = await validateReferences(mergedData);
    if (referenceError) {
      return res.status(400).json({ message: referenceError });
    }

    const oldValue = followUp.toObject();

    Object.assign(followUp, data);

    await followUp.save();

    await createAuditLog({
      userId: req.user.userId,
      action: "UPDATE",
      entityName: "FollowUp",
      recordId: followUp._id.toString(),
      oldValue,
      newValue: followUp.toObject(),
      ipAddress: req.ip
    });

    res.status(200).json(followUp);
  } catch (error) {
    res.status(400).json({
      message: "Failed to update follow-up",
      error: error.message
    });
  }
};

const deleteFollowUp = async (req, res) => {
  try {
    const followUp = await FollowUp.findById(req.params.id);

    if (!followUp) {
      return res.status(404).json({
        message: "Follow-up not found"
      });
    }

    await FollowUp.findByIdAndDelete(req.params.id);

    await createAuditLog({
      userId: req.user.userId,
      action: "DELETE",
      entityName: "FollowUp",
      recordId: followUp._id.toString(),
      oldValue: followUp.toObject(),
      ipAddress: req.ip
    });

    res.status(200).json({
      message: "Follow-up deleted successfully"
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to delete follow-up",
      error: error.message
    });
  }
};

module.exports = {
  createFollowUp,
  getFollowUps,
  getFollowUpById,
  updateFollowUp,
  deleteFollowUp
};