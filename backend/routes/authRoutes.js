const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  updatePassword,
} = require("../controllers/authController");
const { protect } = require("../middleware");
const { authLimiter } = require("../middleware/rateLimiter");

// Public routes (with rate limiting)
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);

// Protected routes
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/password", protect, updatePassword);

module.exports = router;
