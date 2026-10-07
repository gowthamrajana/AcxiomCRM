const express = require("express");

const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  unlockUser
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.use(authorizeRoles("Admin"));

router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", updateUser);
router.post("/:id/unlock", unlockUser);

module.exports = router;