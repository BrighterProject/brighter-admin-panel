export const isAdmin = (scopes: string[]): boolean =>
  scopes.some((s) => s.startsWith("admin:"));

export const isPropertyOwner = (scopes: string[]): boolean =>
  scopes.includes("properties:me") && !isAdmin(scopes);
