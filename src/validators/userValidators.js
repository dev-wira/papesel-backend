const { isEmail, verifyEmail } = require("../utils/emailOptions");
const { appError } = require("../utils/responses");
const { validateField } = require("./fieldValidation");

const signUpValidation = (body) => {
  const { name, email, password } = body;
  validateField(name, "name is required !!");
  verifyEmail(email);
  validateField(password, "password is required !!");
};

const logInValidation = (body) => {
  const { email, password } = body;
  verifyEmail(email);
  validateField(password, "password is required !!");
};

const verifyOTPValidation = (body) => {
  const { email, code } = body;
  verifyEmail(email);
  validateField(code, "code is missing !!");
};

const createClientValidation = (body) => {
  const { name, email } = body;
  validateField(name, "name is missing !!");
  verifyEmail(email);
};

module.exports = {
  signUpValidation,
  verifyOTPValidation,
  createClientValidation,
  logInValidation,
};
