const jwt = require("jsonwebtoken");
const { appError } = require("../utils/responses");

const userAuth = (req, res, next) => {
  const token = req.cookies.auth_token;
  if (!token) return next(new appError(401, "unauthorized"));

  try {
    const data = jwt.verify(token, process.env.MY_JWT_SECRET);
    req.user = data;
    next();
  } catch {
    next(new appError(401, "invalid or expired token"));
  }
};

module.exports = { userAuth };
