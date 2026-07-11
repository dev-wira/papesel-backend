const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");

console.log("Resolved path:", path.join(__dirname, "../routers/*.js"));

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Papesel API",
      version: "1.0.0",
      description:
        "API for Papesel — a requirement-versioning SaaS for freelancers and clients . readme recomended -> https://github.com/dev-wira/papesel-backend/blob/main/README.md",
    },
    servers: [
      {
        url: process.env.BASE_URL || "http://localhost:3000",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "auth_token",
        },
      },
    },
    security: [{ cookieAuth: [] }],
  },
  apis: ["./src/routers/*.js"], // <-- adjust this path to wherever your route files live
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
