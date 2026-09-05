import { AppError } from "./AppError";

export function assertNonEmptyString(
  value: unknown,
  field: string
): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new AppError(400, `${field} is required and must be a non-empty string`, {
      code: "VALIDATION_ERROR",
      details: { field },
    });
  }
}

export function assertOptionalString(
  value: unknown,
  field: string
): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new AppError(400, `${field} must be a string`, {
      code: "VALIDATION_ERROR",
      details: { field },
    });
  }

  return value;
}

export function assertOptionalEnum<T extends string>(
  value: unknown,
  field: string,
  allowed: readonly T[]
): T | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "string" || !allowed.includes(value as T)) {
    throw new AppError(
      400,
      `${field} must be one of: ${allowed.join(", ")}`,
      {
        code: "VALIDATION_ERROR",
        details: { field, allowed },
      }
    );
  }

  return value as T;
}

export function assertAtLeastOneField(
  body: Record<string, unknown>,
  fields: string[]
): void {
  const hasField = fields.some((field) => body[field] !== undefined);

  if (!hasField) {
    throw new AppError(400, `At least one field is required: ${fields.join(", ")}`, {
      code: "VALIDATION_ERROR",
      details: { fields },
    });
  }
}

export function assertOptionalDate(
  value: unknown,
  field: string
): Date | undefined | null {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  const date = new Date(value as string | number | Date);

  if (Number.isNaN(date.getTime())) {
    throw new AppError(400, `${field} must be a valid ISO date string`, {
      code: "VALIDATION_ERROR",
      details: { field },
    });
  }

  return date;
}
