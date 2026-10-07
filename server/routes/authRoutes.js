const express = require("express");
const rateLimit = require("express-rate-limit");

const {
  register,
  login,
  logout
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many login attempts. Please try again later."
  }
});

router.post("/register", register);
router.post("/login", loginLimiter, login);
router.post("/logout", authMiddleware, logout);

module.exports = router;