const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["dev", "client"],
      default: "dev",
    },
    verified: {
      type: Boolean,
      default: false,
    },
    ownerDeveloper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
).index(
  { createdAt: 1 },
  { expireAfterSeconds: 3600, partialFilterExpression: { verified: false } },
);

const User = mongoose.model("User", userSchema);
module.exports = User;
