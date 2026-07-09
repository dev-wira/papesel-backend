const transporter = require("../configs/transporter");
const { validate } = require("../models/user");
const { validateField } = require("../validators/fieldValidation");
const { appError } = require("./responses");

exports.mail = async (to, subject, html) => {
  await transporter.sendMail({
    from: process.env.PAPESEL_GMAIL,
    to,
    subject,
    html,
  });
};

exports.verifyEmail = (email) => {
  validateField(email, "email is required");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const isValidEmail = emailRegex.test(email);
  if (!isValidEmail) {
    throw new appError(400, "invalid email");
  }
};
