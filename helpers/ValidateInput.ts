import { ZodSchema, ZodError, z } from "zod";
import { IRequest } from "../types/generalTypes";
import appError from "./appError";

const ValidateInput = <T extends ZodSchema>(
  input: any,
  zodSchema: T
): z.infer<T> => {
  try {
    const data = zodSchema.parse(input);
    return data;
  } catch (err) {
    if (err instanceof ZodError) {
      // Format Zod errors into user-friendly messages
      const errorMessages = err.errors.map((err) => {
        const path = err.path.length > 0 ? ` at ${err.path.join(".")}` : "";
        return `${err.message}${path}`;
      });
      throw new appError(
        `Validation failed: ${errorMessages.join(", ")}`,
        400,
        "ValidationError"
      );
    }
    // Handle unexpected errors
    throw new appError(
      "An unexpected validation error occurred",
      500,
      "InternalError"
    );
  }
};

export default ValidateInput;

export const validateId = z.string().uuid();
