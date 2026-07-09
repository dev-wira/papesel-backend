const { ObjectId } = require("mongodb");
const { appError } = require("../utils/responses");
const { validateField, validateId } = require("./fieldValidation");

const createProjectValidation = (body) => {
  const { name, client, description } = body;
  validateField(name, "project name is required .");
  validateId(client, "invalid client id or missing");
  validateField(description, "project description cannot be empty ");
};

const addRequirementValidation = (body) => {
  const { project, title } = body;
  validateId(project, "project id missing or invalid ");
  validateField(title, "project title missing !!");
};

const updateRequirementValidation = (body) => {
  const { requirement, title } = body;
  validateId(requirement, "requirement missing or invalid .");
};
const reviewRequirementValidation = (req) => {
  const { status } = req.body;
  const { requirement } = req.params;
  validateId(requirement, "invalid requirement cannot be reviewed .");
  if (!["approved", "rejected"].includes(status)) {
    throw new appError(400, "invalid status selection.!!");
  }
};
module.exports = {
  createProjectValidation,
  addRequirementValidation,
  updateRequirementValidation,
  reviewRequirementValidation,
};
