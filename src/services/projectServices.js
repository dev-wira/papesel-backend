const Project = require("../models/project");
const RequirementVersion = require("../models/requirementVersion");
const Requirement = require("../models/requiremnets");
const User = require("../models/user");
const { appError } = require("../utils/responses");
const { ObjectId } = require("mongodb");

const create_project = async (name, client, createdBy, description) => {
  const user = await User.findOne({ _id: client });
  if (!user) {
    throw new appError(400, "no such client exists !! create one .");
  }
  if (!user.verified) {
    throw new appError(400, "user has not verified yet .");
  }
  return await Project.create({
    name,
    client,
    description,
    createdBy,
  });
};

const get_dev_projects = async (_id) => {
  return await Project.find({ createdBy: _id });
};
const get_client_projects = async (_id) => {
  return await Project.find({ client: _id });
};

const add_requirement = async (project, title, description) => {
  const exists = await Project.exists({ _id: project });
  if (!exists) {
    throw new appError(400, "no such project exists !!");
  }
  return await Requirement.create({
    project,
    title,
    description,
  });
};

const update_requirement = async (requirement, title, description) => {
  const [requirement_info, latestVersion] = await Promise.all([
    Requirement.findById(requirement),
    RequirementVersion.findOne({ requirement }).sort({ version: -1 }),
  ]);
  if (!requirement_info) {
    throw new appError(404, `no requirement found with id ${requirement}`);
  }
  if (requirement_info.status === "pending") {
    throw new appError(400, "requirement is pending for review, cannot update");
  }
  await RequirementVersion.create({
    requirement,
    title: requirement_info.title,
    description: requirement_info.description,
    version: latestVersion ? latestVersion.version + 1 : 1,
    status: requirement_info.status,
  });

  return await Requirement.findByIdAndUpdate(
    requirement,
    { title, description, status: "pending" },
    { new: true },
  );
};

const get_requirements = async (project) => {
  const project_info = await Project.exists({ _id: project });
  if (!project_info) throw new appError(404, "no such project exists");
  return await Requirement.find({ project });
};

const get_requirement_versions = async (requirement) => {
  const exists = await Requirement.exists({ _id: requirement });
  if (!exists) throw new appError(404, "no such requirement exists");

  return await RequirementVersion.find({ requirement }).sort({ version: -1 });
};

const review_requirement = async (requirement, status) => {
  const reviewed_requirement = await Requirement.findByIdAndUpdate(
    requirement,
    {
      status,
    },
    { new: true },
  );
  if (!reviewed_requirement) {
    throw new appError(404, "requirement not found");
  }
  return {
    _id: reviewed_requirement._id,
    title: reviewed_requirement.title,
  };
};
const get_pending_requirements = async (project) => {
  return await Requirement.find({ project, status: "pending" });
};

module.exports = {
  create_project,
  add_requirement,
  update_requirement,
  get_requirements,
  get_requirement_versions,
  review_requirement,
  get_pending_requirements,
  get_dev_projects,
  get_client_projects,
};
