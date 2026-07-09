const mongoose = require("mongoose");

const RequirementSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  changedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Requirement", RequirementSchema);
