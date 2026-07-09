const express = require("express");
const app = express();

const cookieParser = require("cookie-parser");

const errorHandler = require("./middlewares/errorHandler");
const userRouter = require("./routers/user.route");
const projectRouter = require("./routers/project.route");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./configs/swaggerConfig");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware
app.use(express.json());
app.use(cookieParser());
// Routes
app.use("/user", userRouter);
app.use("/project", projectRouter);
app.get("/", (req, res) => {
  res.send("application running...");
});

// Error Handler (must be last)
app.use(errorHandler);

module.exports = app;
