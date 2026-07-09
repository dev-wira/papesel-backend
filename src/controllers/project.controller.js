const {
  create_project,
  add_requirement,
  update_requirement,
  get_requirements,
  get_requirement_versions,
  review_requirement,
  get_pending_requirements,
  get_dev_projects,
  get_client_projects,
} = require("../services/projectServices");
const {
  createProjectValidation,
  addRequirementValidation,
  updateRequirementValidation,
  reviewRequirementValidation,
} = require("../validators/projectValidator");
const { success, appError } = require("../utils/responses");
const { validateId } = require("../validators/fieldValidation");

const createProject = async (req, res) => {
  createProjectValidation(req.body);
  const { name, client, description } = req.body;
  const createdBy = req.user._id;
  validateId(createdBy, "cred error !!");
  const project = await create_project(name, client, createdBy, description);
  return success(res, 201, "project created", {
    project_id: project._id,
    project_name: project.name,
  });
};

const getProjects = async (req, res) => {
  const { _id, role } = req.user;
  validateId(_id, "invalid project ");
  const roleQuery = role === "dev";
  const projects = roleQuery
    ? await get_dev_projects(_id)
    : await get_client_projects(_id);
  return success(res, 200, "project fetched successfully !!", projects);
};

const addRequirement = async (req, res) => {
  addRequirementValidation(req.body);
  const { project, title, description } = req.body;
  const requirement = await add_requirement(project, title, description);
  return success(res, 201, "requirement added..", {
    _id: requirement._id,
  });
};
const updateRequirement = async (req, res) => {
  updateRequirementValidation(req.body);
  const { requirement } = req.params;
  const { title, description } = req.body;
  const updated = await update_requirement(requirement, title, description);
  return success(res, 200, "requirement updated..", {
    _id: updated._id,
    title: updated.title,
  });
};
const getRequirements = async (req, res) => {
  const { project } = req.params;
  validateId(project, "invalid project !!");
  const requirements = await get_requirements(project);
  return success(res, 200, "requirements fetched", {
    requirements,
  });
};
const getRequirementVersions = async (req, res) => {
  const { requirement } = req.params;
  validateId(requirement, "invalid requirement !!");
  const versions = await get_requirement_versions(requirement);
  return success(res, 200, "requirement versions fetched", {
    versions,
  });
};

const reviewRequirement = async (req, res) => {
  reviewRequirementValidation(req);
  const { requirement } = req.params;
  const { status } = req.body;
  const reviewed = await review_requirement(requirement, status);
  return success(res, 200, "requirement reviewed", {
    _id: reviewed._id,
    title: reviewed.title,
    status,
  });
};

const getPendingRequirements = async (req, res) => {
  const { project } = req.params;
  validateId(project, "invalid project !!");
  const requirements = await get_pending_requirements(project);
  return success(res, 200, "pending requirements fetched", {
    requirements,
  });
};

module.exports = {
  createProject,
  addRequirement,
  updateRequirement,
  getRequirements,
  getRequirementVersions,
  reviewRequirement,
  getPendingRequirements,
  getProjects,
};
