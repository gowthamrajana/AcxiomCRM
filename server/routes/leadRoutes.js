const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  convertLead
} = require("../controllers/leadController");

const router = express.Router();

router.use(authMiddleware);

router.get(
  "/",
  authorizeRoles("Admin", "Manager", "SalesExecutive"),
  getLeads
);

router.get(
  "/:id",
  authorizeRoles("Admin", "Manager", "SalesExecutive"),
  getLeadById
);

router.post(
  "/",
  authorizeRoles("Admin", "Manager", "SalesExecutive"),
  createLead
);

router.put(
  "/:id",
  authorizeRoles("Admin", "Manager", "SalesExecutive"),
  updateLead
);

router.delete(
  "/:id",
  authorizeRoles("Admin", "Manager"),
  deleteLead
);

router.post(
  "/:id/convert",
  authorizeRoles("Admin", "Manager", "SalesExecutive"),
  convertLead
);

module.exports = router;