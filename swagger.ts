import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "CoLab API",
      version: "1.0.0",
      description:
        "API documentation for CoLab, a collaborative platform for developers.",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          description:
            "Enter Bearer token obtained from Passport authentication",
        },
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "connect.sid",
          description: "Session cookie for Passport authentication",
        },
        sessionAuth: {
          type: "apiKey",
          in: "header",
          name: "Authorization",
          description: "Session-based authentication via Passport",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "user123",
            },
            username: {
              type: "string",
              example: "john_doe",
            },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            role: {
              type: "string",
              enum: ["USER", "ADMIN"],
              example: "USER",
            },
            isdeleted: {
              type: "boolean",
              example: false,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2023-10-01T12:00:00Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2023-10-01T12:00:00Z",
            },
          },
        },
        LoginCredentials: {
          type: "object",
          required: ["username", "password"],
          properties: {
            username: {
              type: "string",
              example: "john_doe",
            },
            password: {
              type: "string",
              format: "password",
              example: "password123",
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            status: {
              type: "string",
              example: "error",
            },
            message: {
              type: "string",
              example: "Error message",
            },
          },
        },
        SuccessResponse: {
          type: "object",
          properties: {
            status: {
              type: "string",
              example: "success",
            },
            data: {
              type: "object",
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: "Unauthorized - Authentication required",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                status: "error",
                message: "Authentication required",
              },
            },
          },
        },
        ForbiddenError: {
          description: "Forbidden - Insufficient permissions",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                status: "error",
                message: "You Don't have permission to access this resource",
              },
            },
          },
        },
        NotFoundError: {
          description: "Resource not found",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                status: "error",
                message: "User not found",
              },
            },
          },
        },
        ValidationError: {
          description: "Bad request - Validation error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                status: "error",
                message: "you can't update nothing",
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: "Authentication",
        description:
          "User authentication and authorization endpoints using Passport",
      },
      {
        name: "User Management",
        description: "User profile and account management endpoints",
      },
    ],
  },
  apis: ["./api-docs/*.yaml"], // Path to the API docs
};

export default swaggerJSDoc(options);
