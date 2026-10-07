const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  createOpportunity,
  getOpportunities,
  getOpportunityById,
  updateOpportunity,
  deleteOpportunity,
  getPipeline
} = require("../controllers/opportunityController");

const router = express.Router();

router.use(authMiddleware);

router.get(
  "/",
  authorizeRoles("Admin", "Manager", "SalesExecutive"),
  getOpportunities
);

router.get(
  "/pipeline",
  authorizeRoles("Admin", "Manager", "SalesExecutive"),
  getPipeline
);

router.get(
  "/:id",
  authorizeRoles("Admin", "Manager", "SalesExecutive"),
  getOpportunityById
);

router.post(
  "/",
  authorizeRoles("Admin", "Manager", "SalesExecutive"),
  createOpportunity
);

router.put(
  "/:id",
  authorizeRoles("Admin", "Manager", "SalesExecutive"),
  updateOpportunity
);

router.delete(
  "/:id",
  authorizeRoles("Admin", "Manager"),
  deleteOpportunity
);

module.exports = router;