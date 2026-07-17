const Project = require("../models/project");
const RequirementVersion = require("../models/requirementVersion");
const Requirement = require("../models/requiremnets");
const User = require("../models/user");
const { appError } = require("../utils/responses");
const { ObjectId } = require("mongodb");

const create_project = async (name, client, createdBy, description) => {
  const user = await User.findOne({ _id: client, role: "client" });
  if (!user) {
    throw new appError(400, "no such client exists !! create one .");
  }
  if (!user.verified) {
    throw new appError(400, "user has not verified yet .");
  }
  if (!user.ownerDeveloper || !user.ownerDeveloper.equals(createdBy)) {
    throw new appError(403, "the client does not belong to you .");
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

const add_requirement = async (project, title, description, client) => {
  const exists = await Project.exists({ _id: project, client: client });
  if (!exists) {
    throw new appError(400, "no such project exists for you  !!");
  }
  return await Requirement.create({
    project,
    title,
    description,
  });
};

const update_requirement = async (requirement, title, description, client) => {
  const requirement_info = await Requirement.findById(requirement);
  if (!requirement_info) {
    throw new appError(404, `no requirement found with id ${requirement}`);
  }

  const owns = await Project.exists({
    _id: requirement_info.project,
    client: client,
  });
  if (!owns) {
    throw new appError(403, "this requirement does not belong to you .");
  }

  if (requirement_info.status === "pending") {
    throw new appError(400, "requirement is pending for review, cannot update");
  }

  const latestVersion = await RequirementVersion.findOne({ requirement }).sort({
    version: -1,
  });

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
const get_requirements = async (project, userId) => {
  const project_info = await Project.findById(project);
  if (!project_info) throw new appError(404, "no such project exists");

  const isOwner =
    project_info.createdBy.equals(userId) || project_info.client.equals(userId);
  if (!isOwner) {
    throw new appError(403, "you do not have access to this project");
  }

  return await Requirement.find({ project });
};

const get_requirement_versions = async (requirement, userId) => {
  const requirement_info = await Requirement.findById(requirement);
  if (!requirement_info) throw new appError(404, "no such requirement exists");

  const owns = await Project.exists({
    _id: requirement_info.project,
    $or: [{ createdBy: userId }, { client: userId }],
  });
  if (!owns) {
    throw new appError(
      403,
      "you can only view requirement versions of your own project .",
    );
  }

  return await RequirementVersion.find({ requirement }).sort({ version: -1 });
};

const review_requirement = async (requirement, status, dev) => {
  const requirement_info = await Requirement.findById(requirement);
  if (!requirement_info) {
    throw new appError(404, "requirement not found");
  }

  const owns = await Project.exists({
    _id: requirement_info.project,
    createdBy: dev,
  });
  if (!owns) {
    throw new appError(
      403,
      "you can only review requirements of your own project .",
    );
  }

  const reviewed_requirement = await Requirement.findByIdAndUpdate(
    requirement,
    { status },
    { new: true },
  );

  return {
    _id: reviewed_requirement._id,
    title: reviewed_requirement.title,
  };
};

const get_pending_requirements = async (project, userId) => {
  const project_info = await Project.findById(project);
  if (!project_info) throw new appError(404, "no such project exists");

  const isOwner =
    project_info.createdBy.equals(userId) || project_info.client.equals(userId);
  if (!isOwner) {
    throw new appError(403, "you do not have access to this project");
  }

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
