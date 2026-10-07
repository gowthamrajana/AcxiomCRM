const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  getMonthlySales,
  getConversionReport
} = require("../controllers/reportController");

const router = express.Router();

router.use(authMiddleware);

router.get(
  "/monthly-sales",
  authorizeRoles("Admin", "Manager"),
  getMonthlySales
);

router.get(
  "/conversion",
  authorizeRoles("Admin", "Manager"),
  getConversionReport
);

module.exports = router;