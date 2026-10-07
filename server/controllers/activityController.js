const Activity = require("../models/Activity");
const Customer = require("../models/Customer");
const Lead = require("../models/Lead");
const User = require("../models/User");
const createAuditLog = require("../services/auditService");

const validateReferences = async (data) => {
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

const createActivity = async (req, res) => {
  try {
    const data = { ...req.body };

    if (req.user.role === "SalesExecutive") {
      data.assignedTo = req.user.userId;
    } else if (!data.assignedTo) {
      data.assignedTo = req.user.userId;
    }

    const referenceError = await validateReferences(data);

    if (referenceError) {
      return res.status(400).json({
        message: referenceError
      });
    }

    const activity = await Activity.create(data);

    await createAuditLog({
      userId: req.user.userId,
      action: "CREATE",
      entityName: "Activity",
      recordId: activity._id.toString(),
      newValue: activity.toObject(),
      ipAddress: req.ip
    });

    res.status(201).json(activity);
  } catch (error) {
    res.status(400).json({
      message: "Failed to create activity",
      error: error.message
    });
  }
};

const getActivities = async (req, res) => {
  try {
    const filter = {};

    if (req.user.role === "SalesExecutive") {
      filter.assignedTo = req.user.userId;
    }

    const activities = await Activity.find(filter)
      .populate("customerId", "name email phone")
      .populate("leadId", "name email phone")
      .populate("assignedTo", "name email role")
      .sort({ date: -1 });

    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch activities",
      error: error.message
    });
  }
};

const getActivityById = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate("customerId", "name email phone")
      .populate("leadId", "name email phone")
      .populate("assignedTo", "name email role");

    if (!activity) {
      return res.status(404).json({
        message: "Activity not found"
      });
    }

    if (
      req.user.role === "SalesExecutive" &&
      activity.assignedTo._id.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    res.status(200).json(activity);
  } catch (error) {
    res.status(400).json({
      message: "Invalid activity ID"
    });
  }
};

const updateActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        message: "Activity not found"
      });
    }

    if (
      req.user.role === "SalesExecutive" &&
      activity.assignedTo.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    const data = { ...req.body };

    if (req.user.role === "SalesExecutive") {
      delete data.assignedTo;
    }

    const referenceError = await validateReferences(data);

    if (referenceError) {
      return res.status(400).json({
        message: referenceError
      });
    }

    const oldValue = activity.toObject();

    Object.assign(activity, data);

    await activity.save();

    await createAuditLog({
      userId: req.user.userId,
      action: "UPDATE",
      entityName: "Activity",
      recordId: activity._id.toString(),
      oldValue,
      newValue: activity.toObject(),
      ipAddress: req.ip
    });

    res.status(200).json(activity);
  } catch (error) {
    res.status(400).json({
      message: "Failed to update activity",
      error: error.message
    });
  }
};

const deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        message: "Activity not found"
      });
    }

    await Activity.findByIdAndDelete(req.params.id);

    await createAuditLog({
      userId: req.user.userId,
      action: "DELETE",
      entityName: "Activity",
      recordId: activity._id.toString(),
      oldValue: activity.toObject(),
      ipAddress: req.ip
    });

    res.status(200).json({
      message: "Activity deleted successfully"
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to delete activity",
      error: error.message
    });
  }
};

module.exports = {
  createActivity,
  getActivities,
  getActivityById,
  updateActivity,
  deleteActivity
};