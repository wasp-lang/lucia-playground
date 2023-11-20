export function isZodValidationError(e: unknown): e is ZodValidationError {
  return (
    Array.isArray(e) &&
    e.length > 0 &&
    e[0].type === "Body" &&
    e[0].errors &&
    Array.isArray(e[0].errors.issues) &&
    e[0].errors.issues.length > 0 &&
    typeof e[0].errors.issues[0].message === "string"
  );
}

export function getFirstZodValidationError(
  e: ZodValidationError
): string | null {
  return e[0].errors.issues[0].message ?? null;
}

type ZodValidationError = {
  type: "Body";
  errors: {
    issues: {
      message: string;
    }[];
    name: "ZodError";
  };
}[];
