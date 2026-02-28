const { Quiz, QuizAttempt, User } = require("../models");
const { asyncHandler, ApiError } = require("../utils");

/**
 * @desc    Create a new quiz
 * @route   POST /api/quizzes
 * @access  Private
 */
const createQuiz = asyncHandler(async (req, res) => {
  const { title, description, sourceText, questions, settings, topics, topic, difficulty, timeLimit, isPublic, isPublished, tags } = req.body;

  const quiz = await Quiz.create({
    title,
    description,
    sourceText,
    creator: req.user._id,
    questions,
    settings,
    topics,
    topic,
    difficulty,
    timeLimit,
    isPublic,
    isPublished,
    tags,
  });

  // Add quiz to user's created quizzes
  await User.findByIdAndUpdate(req.user._id, {
    $push: { quizzesCreated: quiz._id },
  });

  res.status(201).json({
    success: true,
    data: quiz,
  });
});

/**
 * @desc    Get all quizzes (public or user's own)
 * @route   GET /api/quizzes
 * @access  Public/Private
 */
const getQuizzes = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, tags, examMode, difficulty, topic, isPublic, isPublished } = req.query;

  const query = {};

  // Handle explicit isPublic and isPublished filters (takes priority)
  const hasPublicFilter = isPublic === 'true' || isPublic === 'false';
  const hasPublishedFilter = isPublished === 'true' || isPublished === 'false';
  
  console.log('[getQuizzes] Filters:', { isPublic, isPublished, hasPublicFilter, hasPublishedFilter });
  
  if (hasPublicFilter || hasPublishedFilter) {
    // Explicit filter mode - use direct filters
    if (hasPublicFilter) {
      query.isPublic = isPublic === 'true';
    }
    if (hasPublishedFilter) {
      query.isPublished = isPublished === 'true';
    }
  } else {
    // Default mode - based on authentication
    if (req.user) {
      // For authenticated users: show published public quizzes OR their own quizzes
      query.$or = [
        { isPublic: true, isPublished: true },
        { creator: req.user._id }
      ];
    } else {
      // For guests: only public and published quizzes
      query.isPublic = true;
      query.isPublished = true;
    }
  }

  // Search filter
  if (search) {
    query.$text = { $search: search };
  }

  // Tags filter
  if (tags) {
    query.tags = { $in: tags.split(",") };
  }

  // Exam mode filter
  if (examMode) {
    query["settings.examMode"] = examMode;
  }

  // Difficulty filter
  if (difficulty) {
    query.difficulty = difficulty;
  }

  // Topic filter
  if (topic) {
    query.topic = { $regex: topic, $options: "i" };
  }

  console.log('[getQuizzes] Final query:', JSON.stringify(query));

  const quizzes = await Quiz.find(query)
    .populate("creator", "name email avatar")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .select("-questions -sourceText");

  const total = await Quiz.countDocuments(query);

  res.json({
    success: true,
    data: quizzes,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * @desc    Get user's created quizzes
 * @route   GET /api/quizzes/my
 * @access  Private
 */
const getMyQuizzes = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const quizzes = await Quiz.find({ creator: req.user._id })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .select("-sourceText");

  const total = await Quiz.countDocuments({ creator: req.user._id });

  res.json({
    success: true,
    data: quizzes,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * @desc    Get single quiz by ID
 * @route   GET /api/quizzes/:id
 * @access  Public/Private
 */
const getQuizById = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id).populate(
    "creator",
    "name email avatar"
  );

  if (!quiz) {
    throw new ApiError("Quiz not found", 404);
  }

  // Check access
  if (!quiz.isPublic && (!req.user || quiz.creator._id.toString() !== req.user._id.toString())) {
    throw new ApiError("Not authorized to access this quiz", 403);
  }

  res.json({
    success: true,
    data: quiz,
  });
});

/**
 * @desc    Update quiz
 * @route   PUT /api/quizzes/:id
 * @access  Private
 */
const updateQuiz = asyncHandler(async (req, res) => {
  let quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    throw new ApiError("Quiz not found", 404);
  }

  // Check ownership
  if (quiz.creator.toString() !== req.user._id.toString()) {
    throw new ApiError("Not authorized to update this quiz", 403);
  }

  const { title, description, questions, settings, topics, topic, difficulty, timeLimit, isPublic, isPublished, tags } = req.body;

  quiz = await Quiz.findByIdAndUpdate(
    req.params.id,
    { title, description, questions, settings, topics, topic, difficulty, timeLimit, isPublic, isPublished, tags },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    data: quiz,
  });
});

/**
 * @desc    Delete quiz
 * @route   DELETE /api/quizzes/:id
 * @access  Private
 */
const deleteQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    throw new ApiError("Quiz not found", 404);
  }

  // Check ownership
  if (quiz.creator.toString() !== req.user._id.toString()) {
    throw new ApiError("Not authorized to delete this quiz", 403);
  }

  await quiz.deleteOne();

  // Remove from user's created quizzes
  await User.findByIdAndUpdate(req.user._id, {
    $pull: { quizzesCreated: quiz._id },
  });

  res.json({
    success: true,
    message: "Quiz deleted successfully",
  });
});

/**
 * @desc    Add/Update a question in quiz
 * @route   PUT /api/quizzes/:id/questions
 * @access  Private
 */
const updateQuestions = asyncHandler(async (req, res) => {
  const { questions } = req.body;

  let quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    throw new ApiError("Quiz not found", 404);
  }

  // Check ownership
  if (quiz.creator.toString() !== req.user._id.toString()) {
    throw new ApiError("Not authorized to update this quiz", 403);
  }

  quiz.questions = questions;
  await quiz.save();

  res.json({
    success: true,
    data: quiz,
  });
});

/**
 * @desc    Submit quiz attempt
 * @route   POST /api/quizzes/:id/attempt
 * @access  Private
 */
const submitQuizAttempt = asyncHandler(async (req, res) => {
  const { answers, totalTimeTaken } = req.body;

  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    throw new ApiError("Quiz not found", 404);
  }

  // Calculate score
  let score = 0;
  const processedAnswers = answers.map((answer) => {
    const question = quiz.questions.id(answer.questionId);
    const isCorrect = question && question.correctAnswer === answer.selectedAnswer;
    if (isCorrect) score++;
    return {
      ...answer,
      isCorrect,
    };
  });

  const attempt = await QuizAttempt.create({
    user: req.user._id,
    quiz: quiz._id,
    answers: processedAnswers,
    score,
    totalQuestions: quiz.questions.length,
    totalTimeTaken,
  });

  // Update quiz stats
  const allAttempts = await QuizAttempt.find({ quiz: quiz._id });
  const avgScore =
    allAttempts.reduce((sum, a) => sum + a.percentage, 0) / allAttempts.length;

  quiz.timesPlayed = allAttempts.length;
  quiz.averageScore = Math.round(avgScore);
  await quiz.save();

  // Update user's quizzes taken
  await User.findByIdAndUpdate(req.user._id, {
    $push: {
      quizzesTaken: {
        quiz: quiz._id,
        score,
        totalQuestions: quiz.questions.length,
        completedAt: new Date(),
        timeTaken: totalTimeTaken,
      },
    },
  });

  res.status(201).json({
    success: true,
    data: attempt,
  });
});

/**
 * @desc    Get quiz attempts for a user
 * @route   GET /api/quizzes/:id/attempts
 * @access  Private
 */
const getQuizAttempts = asyncHandler(async (req, res) => {
  const attempts = await QuizAttempt.find({
    quiz: req.params.id,
    user: req.user._id,
  }).sort({ createdAt: -1 });

  res.json({
    success: true,
    data: attempts,
  });
});

/**
 * @desc    Get user's all quiz attempts history
 * @route   GET /api/quizzes/attempts/history
 * @access  Private
 */
const getUserAttemptHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const attempts = await QuizAttempt.find({ user: req.user._id })
    .populate("quiz", "title description")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await QuizAttempt.countDocuments({ user: req.user._id });

  res.json({
    success: true,
    data: attempts,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

module.exports = {
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
};
