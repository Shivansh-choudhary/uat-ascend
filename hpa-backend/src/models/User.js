const mongoose = require("mongoose");
const { USER_ROLES, USER_ROLE_VALUES } = require("../constants/userRoles");

const userSchema = new mongoose.Schema(
  {
    employeeCode: {
      type: String,
      required: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true
    },
    password: {
      type: String,
      trim: true
    },
    Department: {
      type: String,
      required: true,
      trim: true
    },
    Designation: {
      type: String,
      required: true,
      trim: true
    },
    entity: {
      type: String,
      required: true,
      trim: true
    },
    hasCompletedQuestions: {
      type: Boolean,
      required: true,
      default: false
    },
    hasTimedOut: {
      type: Boolean,
      required: true,
      default: false
    },
    role: {
      type: String,
      enum: USER_ROLE_VALUES,
      required: true,
      default: USER_ROLES.USER
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);
