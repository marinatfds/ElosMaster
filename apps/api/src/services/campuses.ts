const FOREIGN_KEY_VIOLATION = "23503";

// O drizzle embrulha o erro do driver em `cause`, então percorremos a cadeia.
export function isForeignKeyViolation(err: unknown): boolean {
  for (let current = err; current instanceof Error; current = current.cause) {
    if ((current as { code?: unknown }).code === FOREIGN_KEY_VIOLATION) return true;
  }
  return false;
}

export const UNKNOWN_CAMPUS_MESSAGE = "Núcleo inexistente";
