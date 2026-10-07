const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { getDashboardStats } = require("../controllers/dashboardController");

const router = express.Router();

router.use(authMiddleware);

router.get(
  "/stats",
  authorizeRoles("Admin", "Manager", "SalesExecutive"),
  getDashboardStats
);

module.exports = router;