const { appError } = require("../utils/responses");

const requireRole = (role) => (req, res, next) => {
  const userRole = req.user.role;
  if (!role || !["client", "dev"].includes(role)) {
    throw new appError(401, "unaothorized access denied..role invalid");
  }
  if (userRole !== role) {
    throw new appError(401, "protected route ...permission denied .");
  }
  next();
};

module.exports = { requireRole };
