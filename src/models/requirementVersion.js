const mongoose = require("mongoose");

const RequirementVersionSchema = new mongoose.Schema({
  requirement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Requirement",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  version: {
    type: Number,
    required: true,
    default: 1,
  },
  description: {
    type: String,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}).index({ requirement: 1, status: "pending" }, { unique: true });

const RequirementVersion = mongoose.model(
  "Requirement_version",
  RequirementVersionSchema,
);
module.exports = RequirementVersion;
