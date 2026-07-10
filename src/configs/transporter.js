const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com", // Brevo SMTP host
  port: 587, // use 587 for TLS, or 465 with secure: true
  secure: false, // set to true if you switch to port 465
  auth: {
    user: process.env.BREVO_USER, // your Brevo account email
    pass: process.env.BREVO_SMTP_KEY, // your Brevo SMTP key from dashboard
  },
});

module.exports = transporter;
