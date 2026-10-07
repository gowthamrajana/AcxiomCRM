const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  createActivity,
  getActivities,
  updateActivity,
  deleteActivity
} = require("../controllers/activityController");

const router = express.Router();

router.use(authMiddleware);

router.get(
  "/",
  authorizeRoles("Admin", "Manager", "SalesExecutive"),
  getActivities
);

router.post(
  "/",
  authorizeRoles("Admin", "Manager", "SalesExecutive"),
  createActivity
);

router.put(
  "/:id",
  authorizeRoles("Admin", "Manager", "SalesExecutive"),
  updateActivity
);

router.delete(
  "/:id",
  authorizeRoles("Admin", "Manager"),
  deleteActivity
);

module.exports = router;