const { appError } = require("../utils/responses");
const User = require("../models/user");
const { mail, verifyEmail } = require("../utils/emailOptions");
const { generateOTP, verifyOTP, password } = require("../utils/random");
const { redis } = require("../configs/upstashRedis");
const jwt = require("jsonwebtoken");
const { hash, compare } = require("../utils/hash");

const sign_up = async (name, email, password) => {
  const exists = await User.exists({ email });
  if (exists) throw new appError(400, "user already exists");
  const hashedPassword = await hash(password);
  const { otp, hashedOTP } = generateOTP();

  await mail(email, "OTP verification", `<h1>Your OTP: ${otp}</h1>`);

  await User.create({
    email,
    password: hashedPassword,
    name,
  });

  await redis.set(`${email}`, hashedOTP, { ex: 300 });

  return { message: "an OTP is sent to your email to verify if it is you ." };
};

const verify_otp = async (email, otp) => {
  const [data, user] = await Promise.all([
    redis.get(`${email}`),
    User.findOne({ email }),
  ]);

  if (!user) throw new appError(400, "unexpected error.. try signup again");
  if (!data) throw new appError(400, "otp expired or invalid");

  const matched = verifyOTP(otp, data);
  if (!matched) throw new appError(400, "invalid otp");

  await Promise.all([
    redis.del(`${email}`),
    User.findOneAndUpdate({ email }, { verified: true }),
  ]);

  const token = jwt.sign(
    { _id: user._id, role: user.role },
    process.env.MY_JWT_SECRET,
    { expiresIn: "7d" },
  );

  return { message: "user verified!!", token };
};

const resend_otp = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new appError(400, "email not found ! register first !!");
  }
  const cooldown = await redis.get(`cooldown:${email}`);
  if (cooldown) {
    throw new appError(400, "please wait for sometime...");
  }
  const { otp, hashedOTP } = generateOTP();
  await Promise.all([
    redis.set(`${email}`, hashedOTP, { ex: 300 }),
    mail(email, "OTP verification", `<h1>Your OTP: ${otp}</h1>`),
    redis.set(`cooldown:${email}`, "1", { ex: 60 }),
  ]);
  return {
    message: "otp has been sent to your mail",
  };
};

const log_in = async (email, password) => {
  const exists = await User.findOne({ email });
  if (!exists) {
    throw new appError(400, "email not found ..kindly register yourself.");
  }
  if (!exists.verified) {
    throw new appError(400, "unverified entity ! sign up recomended .");
  }
  const matched = await compare(password, exists.password);
  if (!matched) {
    throw new appError(
      400,
      "either password or email but something is invalid..check again !!",
    );
  }
  const token = jwt.sign(
    { _id: exists.id, role: exists.role },
    process.env.MY_JWT_SECRET,
    { expiresIn: "7d" },
  );
  return {
    message: "user logged in ",
    token,
  };
};

const create_client = async (name, email, developer) => {
  const exists = await User.exists({ email });
  if (exists) {
    throw new appError(400, "user with that email already exists");
  }
  const hashedPassword = await hash(password(8));

  const inviteToken = await jwt.sign(
    {
      email,
    },
    process.env.MY_JWT_SECRET,
    { expiresIn: "1h" },
  );

  const link = process.env.BASE_URL + "user/update-password/" + inviteToken;

  await Promise.all([
    User.create({
      name,
      email,
      role: "client",
      password: hashedPassword,
      ownerDeveloper: developer,
    }),
    mail(
      email,
      "PAPESEL INVITATION",
      `<h1>you have been invited on papesel regarding your project.. follow this link :${link} . kindly login on papesel . ignore this mail if this does not belongs to you !!</h1>`,
    ),
  ]);
  return {
    message: "client created",
  };
};

const forget_password = async (email) => {
  const resetToken = jwt.sign(
    {
      email,
    },
    process.env.MY_JWT_SECRET,
    {
      expiresIn: "1h",
    },
  );
  const link = process.env.BASE_URL + "user/update-password/" + resetToken;
  await mail(
    email,
    "Reset your password",
    `<h1>Click here to reset: ${link}</h1>`,
  );
  return {
    message: "an email is sent to you to help you reset your password !!",
  };
};

const reset_password = async (token, password) => {
  const data = jwt.verify(token, process.env.MY_JWT_SECRET);
  const exists = await User.findOne({ email: data.email });
  if (!exists) {
    throw new appError(400, "invalid email creds !");
  }
  const hashedPassword = await hash(password);
  const updateData = { password: hashedPassword };
  if (!exists.verified) {
    updateData.verified = true;
  }
  const user = await User.findByIdAndUpdate(exists._id, updateData);
  return {
    message: "password changed succfully",
    user: exists._id,
  };
};

const delete_client = async (client, developer) => {
  const exists = await User.findOne({
    _id: client,
    role: "client",
    ownerDeveloper: developer,
  });
  if (!exists) {
    throw new appError(400, "no user exists to delete !!");
  }
  await User.findByIdAndDelete(exists._id);
  return {
    message: "client deleted .",
    data: {
      CLIENT_NAME: exists.name,
    },
  };
};
const get_my_clients = async (developer) => {
  const clients = await User.find(
    {
      role: "client",
      ownerDeveloper: developer,
    },
    {
      name: 1,
      email: 1,
    },
  );

  return {
    message: "clients fetched successfully",
    clients,
  };
};
module.exports = {
  sign_up,
  verify_otp,
  create_client,
  log_in,
  resend_otp,
  forget_password,
  reset_password,
  delete_client,
  get_my_clients,
};
