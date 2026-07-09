const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.PAPESEL_GMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

module.exports = transporter;
