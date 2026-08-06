/**
 * Catálogo de roles y helpers de autorización.
 * Compatible con roles legacy: Admin, Operador, Ayudante General.
 * Superadministrador quedó deprecado: se trata como Administrador.
 */

export const ROLES = {
  ADMIN: "Administrador",
  USER: "Usuario",
} as const;

export type AppRole = (typeof ROLES)[keyof typeof ROLES];

/** Roles legacy que aún pueden existir en BD. */
export const LEGACY_ROLES = {
  ADMIN: "Admin",
  OPERADOR: "Operador",
  AYUDANTE: "Ayudante General",
} as const;

export const ALL_STORED_ROLES = [
  ROLES.ADMIN,
  ROLES.USER,
  LEGACY_ROLES.ADMIN,
  LEGACY_ROLES.OPERADOR,
  LEGACY_ROLES.AYUDANTE,
] as const;

export type StaffKind = "operador" | "ayudante" | null;

export function normalizeRoleKey(rol?: string | null): string {
  return String(rol || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** Rol canónico de privilegio: admin | user */
export function privilegeTier(rol?: string | null): "admin" | "user" {
  const r = normalizeRoleKey(rol);
  // Legacy Superadministrador → mismo privilegio que Administrador
  if (
    r === "superadministrador" ||
    r === "superadmin" ||
    r === "admin" ||
    r === "administrador"
  ) {
    return "admin";
  }
  return "user";
}

/** @deprecated El rol Superadministrador ya no existe; siempre false. */
export function isSuperAdmin(_rol?: string | null): boolean {
  return false;
}

/** Admin (incluye legado Superadministrador / Admin). */
export function isAdminLevel(rol?: string | null): boolean {
  return privilegeTier(rol) === "admin";
}

export function isFieldOperador(rol?: string | null, staffKind?: StaffKind): boolean {
  if (staffKind === "operador") return true;
  const r = normalizeRoleKey(rol);
  return r === "operador" || r === "chofer";
}

export function isFieldAyudante(rol?: string | null, staffKind?: StaffKind): boolean {
  if (staffKind === "ayudante") return true;
  const r = normalizeRoleKey(rol);
  return r === "ayudante general" || r === "ayudante";
}

export function isFieldStaff(rol?: string | null, staffKind?: StaffKind): boolean {
  return isFieldOperador(rol, staffKind) || isFieldAyudante(rol, staffKind);
}

export function roleRank(rol?: string | null): number {
  if (privilegeTier(rol) === "admin") return 1;
  if (isFieldOperador(rol)) return 2;
  if (isFieldAyudante(rol)) return 3;
  return 4;
}

export function roleLabel(rol?: string | null): string {
  const r = normalizeRoleKey(rol);
  if (
    r === "superadministrador" ||
    r === "superadmin" ||
    r === "admin" ||
    r === "administrador"
  ) {
    return "Administrador";
  }
  if (r === "usuario") return "Usuario";
  if (r === "operador" || r === "chofer") return "Operador";
  if (r === "ayudante general" || r === "ayudante") return "Ayudante General";
  return String(rol || "—");
}

/**
 * Normaliza un rol entrante al valor que se guarda en BD.
 * Superadministrador se guarda como Administrador.
 */
export function normalizeStoredRole(rol: string): string | null {
  const r = normalizeRoleKey(rol);
  if (r === "superadministrador" || r === "superadmin") return ROLES.ADMIN;
  if (r === "admin" || r === "administrador") return ROLES.ADMIN;
  if (r === "usuario") return ROLES.USER;
  if (r === "operador" || r === "chofer") return LEGACY_ROLES.OPERADOR;
  if (r === "ayudante general" || r === "ayudante") return LEGACY_ROLES.AYUDANTE;
  return null;
}

/** ¿El actor puede asignar este rol destino? */
export function canAssignRole(actorRol: string | null | undefined, targetRol: string): boolean {
  if (!isAdminLevel(actorRol)) return false;
  const next = normalizeStoredRole(targetRol);
  // Ya no se puede asignar Superadministrador
  return Boolean(next);
}

export function canManageUserRoles(
  actorRol: string | null | undefined,
  _targetRol?: string | null
): boolean {
  return isAdminLevel(actorRol);
}

export function canDeleteUser(
  actorRol: string | null | undefined,
  _targetRol?: string | null
): boolean {
  return isAdminLevel(actorRol);
}
