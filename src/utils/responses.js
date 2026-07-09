const success = (res, status = 200, message = "success", data = {}) => {
  res.status(status).json({
    success: true,
    message: message,
    data: data,
  });
};

class appError extends Error {
  constructor(status = 500, message = "app error") {
    super(message);
    this.status = status;
    this.message = message;
  }
}
module.exports = { appError, success };
