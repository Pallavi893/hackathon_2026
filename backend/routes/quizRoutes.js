const express = require("express");
const router = express.Router();
const {
  createQuiz,
  getQuizzes,
  getMyQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  updateQuestions,
  submitQuizAttempt,
  getQuizAttempts,
  getUserAttemptHistory,
} = require("../controllers/quizController");
const { protect, optionalAuth } = require("../middleware");

// User's quizzes and attempt history (must be before /:id routes)
router.get("/my", protect, getMyQuizzes);
router.get("/attempts/history", protect, getUserAttemptHistory);

// Public/Semi-public routes
router.get("/", optionalAuth, getQuizzes);
router.get("/:id", optionalAuth, getQuizById);

// Protected routes - CRUD operations
router.post("/", protect, createQuiz);
router.put("/:id", protect, updateQuiz);
router.delete("/:id", protect, deleteQuiz);

// Questions management
router.put("/:id/questions", protect, updateQuestions);

// Quiz attempts
router.post("/:id/attempt", protect, submitQuizAttempt);
router.get("/:id/attempts", protect, getQuizAttempts);

module.exports = router;
