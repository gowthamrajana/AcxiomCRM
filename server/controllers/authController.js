const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const createAuditLog = require("../services/auditService");

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION = 15 * 60 * 1000;

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "2h"
    }
  );
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const normalizedEmail = email.toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: "SalesExecutive"
    });

    await createAuditLog({
      userId: user._id,
      action: "REGISTER",
      entityName: "User",
      recordId: user._id.toString(),
      newValue: {
        name: user.name,
        email: user.email,
        role: user.role
      },
      ipAddress: req.ip
    });

    res.status(201).json({
      message: "Registration successful"
    });
  } catch (error) {
    res.status(400).json({
      message: "Registration failed",
      error: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail
    });

    if (!user) {
      await createAuditLog({
        action: "LOGIN_FAILED",
        entityName: "User",
        recordId: normalizedEmail,
        newValue: {
          reason: "Invalid credentials"
        },
        ipAddress: req.ip
      });

      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    if (!user.isActive) {
      await createAuditLog({
        userId: user._id,
        action: "LOGIN_FAILED",
        entityName: "User",
        recordId: user._id.toString(),
        newValue: {
          reason: "Account inactive"
        },
        ipAddress: req.ip
      });

      return res.status(403).json({
        message: "Account is inactive"
      });
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      await createAuditLog({
        userId: user._id,
        action: "LOGIN_FAILED",
        entityName: "User",
        recordId: user._id.toString(),
        newValue: {
          reason: "Account locked"
        },
        ipAddress: req.ip
      });

      return res.status(423).json({
        message: "Account is temporarily locked"
      });
    }

    if (user.lockUntil && user.lockUntil <= new Date()) {
      user.lockUntil = null;
      user.failedLoginAttempts = 0;
      await user.save();
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      user.failedLoginAttempts += 1;

      if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCK_DURATION);
        user.failedLoginAttempts = 0;

        await user.save();

        await createAuditLog({
          userId: user._id,
          action: "ACCOUNT_LOCKED",
          entityName: "User",
          recordId: user._id.toString(),
          newValue: {
            durationMinutes: 15
          },
          ipAddress: req.ip
        });

        return res.status(423).json({
          message: "Account locked due to too many failed login attempts"
        });
      }

      await user.save();

      await createAuditLog({
        userId: user._id,
        action: "LOGIN_FAILED",
        entityName: "User",
        recordId: user._id.toString(),
        newValue: {
          reason: "Invalid password",
          failedAttempts: user.failedLoginAttempts
        },
        ipAddress: req.ip
      });

      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = null;

    await user.save();

    const token = generateToken(user);

    await createAuditLog({
      userId: user._id,
      action: "LOGIN_SUCCESS",
      entityName: "User",
      recordId: user._id.toString(),
      ipAddress: req.ip
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message
    });
  }
};

const logout = async (req, res) => {
  try {
    await createAuditLog({
      userId: req.user.userId,
      action: "LOGOUT",
      entityName: "User",
      recordId: req.user.userId,
      ipAddress: req.ip
    });

    res.status(200).json({
      message: "Logout successful"
    });
  } catch (error) {
    res.status(500).json({
      message: "Logout failed",
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  logout
};