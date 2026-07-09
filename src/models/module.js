const mongoose = require("mongoose");
const requiremnets = require("./requiremnets");

const ModuleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  requiremnets: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
  ],
  description: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["active", "completed", "on-hold"],
    default: "active",
  },
});

const Module = mongoose.model("Module", ModuleSchema);

module.exports = Module;
