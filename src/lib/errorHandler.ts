import { ZodError } from "zod";
import type { ErrorHandler } from "hono";

export const globalErrorHandler: ErrorHandler = (err, c) => {
  if (err instanceof ZodError) {
    return c.json(
      {
        success: false,
        message: "Validation failed",
        data: null,
        meta: {
          timestamp: new Date().toISOString(),
          issues: err.issues,
        },
      },
      400,
    );
  }

  return c.json(
    {
      success: false,
      message: "Internal server error",
      data: null,
      meta: { timestamp: new Date().toISOString() },
    },
    500,
  );
};
