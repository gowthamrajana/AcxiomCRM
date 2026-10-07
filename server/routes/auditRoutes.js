const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { getAuditLogs } = require("../controllers/auditController");

const router = express.Router();

router.use(authMiddleware);

router.get(
  "/",
  authorizeRoles("Admin"),
  getAuditLogs
);

module.exports = router;