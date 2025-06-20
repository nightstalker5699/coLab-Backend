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
          description: "Enter Bearer token obtained from authentication",
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
              format: "uuid",
              example: "123e4567-e89b-12d3-a456-426614174000",
            },
            username: {
              type: "string",
              pattern: "^[a-zA-Z0-9]",
              example: "john_doe",
            },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            photo: {
              type: "string",
              format: "uri",
              nullable: true,
              example: "https://example.com/images/profile.jpg",
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
            updatedPasswordAt: {
              type: "string",
              format: "date-time",
              nullable: true,
              example: "2023-10-01T12:00:00Z",
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
                message: "you must use characters",
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
