const crypto = require("crypto");

const password = (length) => {
  const tokens =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.&@#";
  let randomPassword = "";

  for (let a = 0; a < length; a++) {
    randomPassword += tokens[crypto.randomInt(tokens.length)];
  }

  return randomPassword;
};

const generateOTP = () => {
  const otp = Math.floor(10000 + Math.random() * 90000).toString();
  const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");
  return { otp, hashedOTP };
};

const verifyOTP = (otp, hashedOTP) => {
  const hashed = crypto.createHash("sha256").update(otp).digest("hex");
  return hashed === hashedOTP;
};

module.exports = { password, generateOTP, verifyOTP };
