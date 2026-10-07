const bcrypt = require("bcryptjs");
const User = require("../models/User");
const {
  createUserSchema,
  updateUserSchema
} = require("../validators/userValidator");
const createAuditLog = require("../services/auditService");

const createUser = async (req, res) => {
  try {
    const { error, value } = createUserSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message
      });
    }

    const existingUser = await User.findOne({
      email: value.email.toLowerCase()
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User with this email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(value.password, 10);

    const user = await User.create({
      name: value.name,
      email: value.email,
      password: hashedPassword,
      role: value.role
    });

    await createAuditLog({
      userId: req.user.userId,
      action: "CREATE",
      entityName: "User",
      recordId: user._id.toString(),
      newValue: {
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      },
      ipAddress: req.ip
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to create user",
      error: error.message
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({
      message: "Invalid user ID"
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { error, value } = updateUserSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const oldValue = {
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    };

    if (value.name !== undefined) {
      user.name = value.name;
    }

    if (value.role !== undefined) {
      user.role = value.role;
    }

    if (value.isActive !== undefined) {
      user.isActive = value.isActive;
    }

    await user.save();

    await createAuditLog({
      userId: req.user.userId,
      action: "UPDATE",
      entityName: "User",
      recordId: user._id.toString(),
      oldValue,
      newValue: {
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      },
      ipAddress: req.ip
    });

    res.status(200).json({
      message: "User updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to update user",
      error: error.message
    });
  }
};

const unlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = null;

    await user.save();

    await createAuditLog({
      userId: req.user.userId,
      action: "UNLOCK",
      entityName: "User",
      recordId: user._id.toString(),
      newValue: {
        failedLoginAttempts: 0,
        lockUntil: null
      },
      ipAddress: req.ip
    });

    res.status(200).json({
      message: "User unlocked successfully"
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to unlock user",
      error: error.message
    });
  }
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  unlockUser
};