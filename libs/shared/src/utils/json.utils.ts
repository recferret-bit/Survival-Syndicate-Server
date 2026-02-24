/**
 * Prisma-compatible JSON value types
 * These match Prisma.JsonValue and Prisma.InputJsonValue but don't require Prisma import
 */
type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];
type InputJsonValue = JsonValue | undefined;

/**
 * Type guard to check if value is a JSON object (Record)
 */
export function isJsonObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    value.constructor === Object
  );
}

/**
 * Type guard to check if value is a JSON array
 */
export function isJsonArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * Safely convert Prisma JsonValue or unknown to Record<string, unknown> | undefined
 * Returns undefined if value is null, not an object, or is an array
 */
export function jsonValueToRecord(
  value: JsonValue | unknown | null | undefined,
): Record<string, unknown> | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (isJsonObject(value)) {
    return value;
  }
  return undefined;
}

/**
 * Safely convert Prisma JsonValue to Record<string, string> | undefined
 * For headers and other string-only record types
 */
export function jsonValueToStringRecord(
  value: JsonValue | unknown | null | undefined,
): Record<string, string> | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (isJsonObject(value)) {
    // Validate all values are strings
    const result: Record<string, string> = {};
    for (const [key, val] of Object.entries(value)) {
      if (typeof val === 'string') {
        result[key] = val;
      } else {
        // If any value is not a string, return undefined
        return undefined;
      }
    }
    return result;
  }
  return undefined;
}

/**
 * Convert Record<string, unknown> to Prisma InputJsonValue
 * Safe conversion for Prisma create/update operations
 */
export function recordToInputJsonValue(
  value: Record<string, unknown> | undefined | null,
): InputJsonValue | null {
  if (value === null || value === undefined) {
    return null;
  }
  return value as InputJsonValue;
}

/**
 * Convert Record<string, string> to Prisma InputJsonValue
 * For headers and other string-only record types
 */
export function stringRecordToInputJsonValue(
  value: Record<string, string> | undefined | null,
): InputJsonValue | null {
  if (value === null || value === undefined) {
    return null;
  }
  return value as InputJsonValue;
}
