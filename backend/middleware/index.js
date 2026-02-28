const { protect, optionalAuth } = require("./authMiddleware");
const { notFound, errorHandler } = require("./errorMiddleware");
const { apiLimiter, authLimiter, generateLimiter } = require("./rateLimiter");
const {
  registerValidation,
  loginValidation,
  createQuizValidation,
  updateQuizValidation,
  generateQuizValidation,
  submitAttemptValidation,
  paginationValidation,
} = require("./validateMiddleware");

module.exports = {
  protect,
  optionalAuth,
  notFound,
  errorHandler,
  apiLimiter,
  authLimiter,
  generateLimiter,
  registerValidation,
  loginValidation,
  createQuizValidation,
  updateQuizValidation,
  generateQuizValidation,
  submitAttemptValidation,
  paginationValidation,
};
