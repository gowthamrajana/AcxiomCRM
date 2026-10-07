const Lead = require("../models/Lead");
const Customer = require("../models/Customer");
const User = require("../models/User");
const createAuditLog = require("../services/auditService");

const allowedTransitions = {
  New: ["Contacted", "Unqualified", "Lost"],
  Contacted: ["Qualified", "Unqualified", "Lost"],
  Qualified: ["Converted", "Lost"],
  Unqualified: ["Contacted", "Lost"],
  Converted: [],
  Lost: []
};

const createLead = async (req, res) => {
  try {
    const data = { ...req.body };

    if (req.user.role === "SalesExecutive") {
      data.assignedTo = req.user.userId;
    }

    const lead = await Lead.create(data);

    await createAuditLog({
      userId: req.user.userId,
      action: "CREATE",
      entityName: "Lead",
      recordId: lead._id.toString(),
      newValue: lead.toObject(),
      ipAddress: req.ip
    });

    res.status(201).json(lead);
  } catch (error) {
    res.status(400).json({
      message: "Failed to create lead",
      error: error.message
    });
  }
};

const getLeads = async (req, res) => {
  try {
    const filter = {};

    if (req.user.role === "SalesExecutive") {
      filter.assignedTo = req.user.userId;
    }

    const leads = await Lead.find(filter)
      .populate("assignedTo", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json(leads);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch leads",
      error: error.message
    });
  }
};

const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate("assignedTo", "name email role");

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found"
      });
    }

    if (
      req.user.role === "SalesExecutive" &&
      lead.assignedTo._id.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    res.status(200).json(lead);
  } catch (error) {
    res.status(400).json({
      message: "Invalid lead ID"
    });
  }
};

const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found"
      });
    }

    if (
      req.user.role === "SalesExecutive" &&
      lead.assignedTo.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    if (req.body.status && req.body.status !== lead.status) {
      const allowedStatuses = allowedTransitions[lead.status] || [];

      if (!allowedStatuses.includes(req.body.status)) {
        return res.status(400).json({
          message: `Invalid status transition from ${lead.status} to ${req.body.status}`
        });
      }
    }

    const oldValue = lead.toObject();

    if (req.user.role === "SalesExecutive") {
      delete req.body.assignedTo;
    }

    Object.assign(lead, req.body);

    await lead.save();

    await createAuditLog({
      userId: req.user.userId,
      action: "UPDATE",
      entityName: "Lead",
      recordId: lead._id.toString(),
      oldValue,
      newValue: lead.toObject(),
      ipAddress: req.ip
    });

    res.status(200).json(lead);
  } catch (error) {
    res.status(400).json({
      message: "Failed to update lead",
      error: error.message
    });
  }
};

const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found"
      });
    }

    await Lead.findByIdAndDelete(req.params.id);

    await createAuditLog({
      userId: req.user.userId,
      action: "DELETE",
      entityName: "Lead",
      recordId: lead._id.toString(),
      oldValue: lead.toObject(),
      ipAddress: req.ip
    });

    res.status(200).json({
      message: "Lead deleted successfully"
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to delete lead",
      error: error.message
    });
  }
};

const convertLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found"
      });
    }

    if (
      req.user.role === "SalesExecutive" &&
      lead.assignedTo.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    if (lead.status === "Converted") {
      return res.status(400).json({
        message: "Lead is already converted"
      });
    }

    const existingCustomer = await Customer.findOne({
      $or: [
        { email: lead.email },
        { phone: lead.phone }
      ]
    });

    if (existingCustomer) {
      return res.status(409).json({
        message: "Customer with this email or phone already exists"
      });
    }

    const customer = await Customer.create({
      customerCode: `CUS-${Date.now()}`,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      status: "Active",
      createdBy: req.user.userId
    });

    const oldValue = lead.toObject();

    lead.status = "Converted";

    await lead.save();

    await createAuditLog({
      userId: req.user.userId,
      action: "CONVERT",
      entityName: "Lead",
      recordId: lead._id.toString(),
      oldValue,
      newValue: lead.toObject(),
      ipAddress: req.ip
    });

    res.status(200).json({
      message: "Lead converted successfully",
      customer,
      lead
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to convert lead",
      error: error.message
    });
  }
};

module.exports = {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  convertLead
};