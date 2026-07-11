const transporter = require("../configs/transporter");
const { validate } = require("../models/user");
const { validateField } = require("../validators/fieldValidation");
const { appError } = require("./responses");
const axios = require("axios");

exports.mail = async (to, subject, htmlContent) => {
  console.log(
    "KEY LOADED:",
    process.env.BREVO_API_KEY
      ? "yes, length=" + process.env.BREVO_API_KEY.length
      : "NO, undefined",
  );
  await axios.post(
    "https://api.brevo.com/v3/smtp/email",
    {
      sender: { email: "papeselorg@gmail.com", name: "Papesel" },
      to: [{ email: to }],
      subject,
      htmlContent,
    },
    {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
    },
  );
};

exports.verifyEmail = (email) => {
  validateField(email, "email is required");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const isValidEmail = emailRegex.test(email);
  if (!isValidEmail) {
    throw new appError(400, "invalid email");
  }
};
