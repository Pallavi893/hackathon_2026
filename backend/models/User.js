const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Define roles as constants for consistency
const ROLES = {
  STUDENT: "student",
  FACULTY: "faculty",
  ADMIN: "admin",
};

// Approval status for faculty accounts
const APPROVAL_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

// Define faculty email domains (customize as needed)
const FACULTY_EMAIL_DOMAINS = ["faculty.edu", "gmail.com", "professor.edu", "staff.university.edu"];

// Get admin emails from environment variable
const getAdminEmails = () => {
  const adminEmails = process.env.ADMIN_EMAILS || "";
  return adminEmails.split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: function () {
        // Password is required only if not using OAuth
        return !this.googleId;
      },
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password by default
    },
    avatar: {
      type: String,
      default: "",
    },
    // Role-Based Access Control
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.STUDENT,
    },
    // Faculty approval status
    approvalStatus: {
      type: String,
      enum: Object.values(APPROVAL_STATUS),
      default: APPROVAL_STATUS.APPROVED, // Students are auto-approved
    },
    approvalNote: {
      type: String,
      default: "",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: {
      type: Date,
    },
    // Google OAuth fields
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    // Email verification (for security)
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    // Account status
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
    },
    quizzesCreated: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz",
      },
    ],
    quizzesTaken: [
      {
        quiz: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Quiz",
        },
        score: Number,
        totalQuestions: Number,
        completedAt: Date,
        timeTaken: Number, // in seconds
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Static method to check if email is admin
userSchema.statics.isAdminEmail = function (email) {
  const adminEmails = getAdminEmails();
  return adminEmails.includes(email.toLowerCase());
};

// Static method to determine role based on email
userSchema.statics.determineRoleByEmail = function (email) {
  // Check if admin email first
  if (this.isAdminEmail(email)) {
    return ROLES.ADMIN;
  }
  const domain = email.split("@")[1];
  if (FACULTY_EMAIL_DOMAINS.includes(domain)) {
    return ROLES.FACULTY;
  }
  return ROLES.STUDENT;
};

// Static method to determine approval status based on role
userSchema.statics.getInitialApprovalStatus = function (role) {
  // Faculty accounts require approval, others are auto-approved
  if (role === ROLES.FACULTY) {
    return APPROVAL_STATUS.PENDING;
  }
  return APPROVAL_STATUS.APPROVED;
};

// Instance method to check if user can login (approved or not faculty)
userSchema.methods.canLogin = function () {
  // Admins and students can always login
  if (this.role !== ROLES.FACULTY) {
    return true;
  }
  // Faculty must be approved
  return this.approvalStatus === APPROVAL_STATUS.APPROVED;
};
userSchema.statics.determineRoleByEmail = function (email) {
  const domain = email.split("@")[1];
  if (FACULTY_EMAIL_DOMAINS.includes(domain)) {
    return ROLES.FACULTY;
  }
  return ROLES.STUDENT;
};

// Instance method to check if user has specific role
userSchema.methods.hasRole = function (role) {
  return this.role === role;
};

// Instance method to check if user is faculty
userSchema.methods.isFaculty = function () {
  return this.role === ROLES.FACULTY;
};

// Instance method to check if user is student
userSchema.methods.isStudent = function () {
  return this.role === ROLES.STUDENT;
};

// Instance method to check if user is admin
userSchema.methods.isAdmin = function () {
  return this.role === ROLES.ADMIN;
};

// Instance method to check if faculty is pending approval
userSchema.methods.isPendingApproval = function () {
  return this.role === ROLES.FACULTY && this.approvalStatus === APPROVAL_STATUS.PENDING;
};

// Hash password before saving
userSchema.pre("save", async function (next) {
  // Skip if password is not modified or if using OAuth
  if (!this.isModified("password") || !this.password) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Update last login timestamp
userSchema.methods.updateLastLogin = async function () {
  this.lastLoginAt = new Date();
  return this.save();
};

const User = mongoose.model("User", userSchema);

module.exports = { User, ROLES, APPROVAL_STATUS, FACULTY_EMAIL_DOMAINS };
