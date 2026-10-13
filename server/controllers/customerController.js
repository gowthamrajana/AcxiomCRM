const Customer = require("../models/Customer");
const createAuditLog = require("../services/auditService");
const mongoose = require("mongoose");

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
        _id: mongoose.trusted({
          $ne: customer._id
        }),
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
        console.log("Duplicate filter:", JSON.stringify(duplicateFilter));
        console.log("Before duplicate check");
        console.log("After duplicate check");
        const duplicate = await Customer.findOne(duplicateFilter);
        console.log("Updating customer ID:", customer._id.toString());
        console.log("Duplicate found:", duplicate?._id?.toString() || "None");
        console.log("Submitted email:", req.body.email);
        console.log("Submitted phone:", req.body.phone);

        if (duplicate) {
          return res.status(409).json({
            message: "Customer with this email or phone already exists"
          });
        }
      }
    }
    console.log("Reached oldValue section");
    const oldValue = customer.toObject();
    console.log("Reached before save");

    console.log("Step 2: oldValue created");

Object.assign(customer, req.body);
console.log("After Object.assign");
console.log("Step 3: Request body assigned");

await customer.save();
console.log("Step 4: Customer saved");

await createAuditLog({
  userId: req.user.userId,
  action: "UPDATE",
  entityName: "Customer",
  recordId: customer._id.toString(),
  oldValue,
  newValue: customer.toObject(),
  ipAddress: req.ip
});
console.log("Step 5: Audit log created");

res.status(200).json(customer);

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