const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer
} = require("../controllers/customerController");

const router = express.Router();

router.use(authMiddleware);

router.get(
  "/",
  authorizeRoles("Admin", "Manager", "SalesExecutive"),
  getCustomers
);

router.get(
  "/:id",
  authorizeRoles("Admin", "Manager", "SalesExecutive"),
  getCustomerById
);

router.post(
  "/",
  authorizeRoles("Admin", "Manager", "SalesExecutive"),
  createCustomer
);

router.put(
  "/:id",
  authorizeRoles("Admin", "Manager", "SalesExecutive"),
  updateCustomer
);

router.delete(
  "/:id",
  authorizeRoles("Admin", "Manager"),
  deleteCustomer
);

module.exports = router;