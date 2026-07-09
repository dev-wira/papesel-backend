const errorHandler = (error, req, res, next) => {
  const status = error.status || 500;
  res.status(status).json({
    message: error.message || "Internal Server Error",
  });
  console.log(JSON.stringify(error.errors, null, 2));
  console.log(error.stack);
};

module.exports = errorHandler;
