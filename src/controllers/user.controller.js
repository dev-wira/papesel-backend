const {
  sign_up,
  create_client,
  log_in,
  verify_otp,
  resend_otp,
  forget_password,
  reset_password,
  delete_client,
  get_my_clients,
} = require("../services/userServices");
const { success } = require("../utils/responses");
const {
  createClientValidation,
  logInValidation,
  verifyOTPValidation,
  signUpValidation,
} = require("../validators/userValidators");
const { setCookie } = require("../utils/cookieHandler");
const { verifyEmail } = require("../utils/emailOptions");
const { validateField, validateId } = require("../validators/fieldValidation");

const signUp = async (req, res) => {
  signUpValidation(req.body);
  const { name, email, password } = req.body;
  const user = await sign_up(name, email, password);
  return success(res, 201, user.message, {});
};

const verifyOtp = async (req, res) => {
  verifyOTPValidation(req.body);
  const { email, code } = req.body;
  const { token, message } = await verify_otp(email, code);
  setCookie(res, token);
  return success(res, 200, message, {});
};

const logIn = async (req, res) => {
  logInValidation(req.body);
  const { email, password } = req.body;
  const result = await log_in(email, password);
  setCookie(res, result.token);
  return success(res, 200, result.message, {});
};

const createClient = async (req, res) => {
  createClientValidation(req.body);
  const { name, email } = req.body;
  const developer = req.user._id;
  const client = await create_client(name, email, developer);
  return success(res, 201, client.message, {
    client_name: name,
  });
};

const resendOTP = async (req, res) => {
  const email = req.query.email;
  verifyEmail(email);
  const { message } = await resend_otp(email);
  return success(res, 200, message);
};

const forgetPassword = async (req, res) => {
  const email = req.body.email;
  verifyEmail(email);
  const { message } = await forget_password(email);
  return success(res, 200, message);
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  validateField(password, "password is required");
  const { message, user } = await reset_password(token, password);
  return success(res, 200, message, { data: user.id });
};

const deleteClient = async (req, res) => {
  const { client } = req.params;
  const developer = req.user._id;
  validateId(client, "client id missing or invalid .");
  const deletedClient = await delete_client(client, developer);
  return success(res, 200, deletedClient.message, deletedClient.data);
};

const logOut = async (req, res) => {
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  return success(res, 200, "user logged out", {});
};

const getMyClients = async (req, res) => {
  const developer = req.user._id;
  const myClients = await get_my_clients(developer);
  return success(res, 200, myClients.message, myClients.clients);
};

module.exports = {
  signUp,
  verifyOtp,
  logIn,
  logOut,
  createClient,
  forgetPassword,
  resetPassword,
  resendOTP,
  deleteClient,
  getMyClients,
};
