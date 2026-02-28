const authController = require("./authController");
const quizController = require("./quizController");
const generateController = require("./generateController");

module.exports = {
  ...authController,
  ...quizController,
  ...generateController,
};
