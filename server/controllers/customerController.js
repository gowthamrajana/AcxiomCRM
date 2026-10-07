const Customer = require("../models/Customer");
const createAuditLog = require("../services/auditService");

const createCustomer = async (req, res) => {
  try {
    const { name, email, phone, company, address, city, state, status } =
      req.body;

    const existingCustomer = await Customer.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingCustomer) {
      return res.status(409).json({
        message: "Customer with this email or phone already exists"
      });
    }

    const customer = await Customer.create({
      customerCode: `CUS-${Date.now()}`,
      name,
      email,
      phone,
      company,
      address,
      city,
      state,
      status,
      createdBy: req.user.userId
    });

    await createAuditLog({
      userId: req.user.userId,
      action: "CREATE",
      entityName: "Customer",
      recordId: customer._id.toString(),
      newValue: customer.toObject(),
      ipAddress: req.ip
    });

    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({
      message: "Failed to create customer",
      error: error.message
    });
  }
};

const getCustomers = async (req, res) => {
  try {
    const filter = {};

    if (req.user.role === "SalesExecutive") {
      filter.createdBy = req.user.userId;
    }

    const customers = await Customer.find(filter)
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch customers",
      error: error.message
    });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate("createdBy", "name email role");

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found"
      });
    }

    if (
      req.user.role === "SalesExecutive" &&
      customer.createdBy._id.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    res.status(200).json(customer);
  } catch (error) {
    res.status(400).json({
      message: "Invalid customer ID"
    });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found"
      });
    }

    if (
      req.user.role === "SalesExecutive" &&
      customer.createdBy.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    if (req.body.email || req.body.phone) {
      const duplicateFilter = {
        _id: { $ne: customer._id },
        $or: []
      };

      if (req.body.email) {
        duplicateFilter.$or.push({
          email: req.body.email
        });
      }

      if (req.body.phone) {
        duplicateFilter.$or.push({
          phone: req.body.phone
        });
      }

      if (duplicateFilter.$or.length > 0) {
        const duplicate = await Customer.findOne(duplicateFilter);

        if (duplicate) {
          return res.status(409).json({
            message: "Customer with this email or phone already exists"
          });
        }
      }
    }

    const oldValue = customer.toObject();

    Object.assign(customer, req.body);

    await customer.save();

    await createAuditLog({
      userId: req.user.userId,
      action: "UPDATE",
      entityName: "Customer",
      recordId: customer._id.toString(),
      oldValue,
      newValue: customer.toObject(),
      ipAddress: req.ip
    });

    res.status(200).json(customer);
  } catch (error) {
    res.status(400).json({
      message: "Failed to update customer",
      error: error.message
    });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found"
      });
    }

    await Customer.findByIdAndDelete(req.params.id);

    await createAuditLog({
      userId: req.user.userId,
      action: "DELETE",
      entityName: "Customer",
      recordId: customer._id.toString(),
      oldValue: customer.toObject(),
      ipAddress: req.ip
    });

    res.status(200).json({
      message: "Customer deleted successfully"
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to delete customer",
      error: error.message
    });
  }
};

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer
};