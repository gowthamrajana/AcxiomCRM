const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  createFollowUp,
  getFollowUps,
  getFollowUpById,
  updateFollowUp,
  deleteFollowUp
} = require("../controllers/followUpController");

const router = express.Router();

router.use(authMiddleware);

router.get(
  "/",
  authorizeRoles("Admin", "Manager", "SalesExecutive"),
  getFollowUps
);

router.get(
  "/:id",
  authorizeRoles("Admin", "Manager", "SalesExecutive"),
  getFollowUpById
);

router.post(
  "/",
  authorizeRoles("Admin", "Manager", "SalesExecutive"),
  createFollowUp
);

router.put(
  "/:id",
  authorizeRoles("Admin", "Manager", "SalesExecutive"),
  updateFollowUp
);

router.delete(
  "/:id",
  authorizeRoles("Admin", "Manager"),
  deleteFollowUp
);

module.exports = router;