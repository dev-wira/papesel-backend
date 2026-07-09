const { ObjectId } = require("mongodb");
const { appError } = require("../utils/responses");

const validateId = (id, message) => {
  if (!id || !ObjectId.isValid(id)) {
    throw new appError(400, message);
  }
};

const validateField = (feild, message) => {
  if (!feild || feild.length === 0) {
    throw new appError(400, message);
  }
};

module.exports = { validateId, validateField };
