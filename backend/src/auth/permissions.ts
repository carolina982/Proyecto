/**
 * Catálogo de permisos independientes del rol.
 * Agregar nuevos permisos aquí; no hace falta cambiar la estructura de BD.
 */

export const PERMISSIONS = {
  USERS_MANAGE: "users.manage",
  USERS_ASSIGN_ROLES: "users.assign_roles",
  USERS_ASSIGN_PERMISSIONS: "users.assign_permissions",
  UNITS_MANAGE: "units.manage",
  TRIPS_MANAGE: "trips.manage",
  TRIPS_OPERATE: "trips.operate",
  TRIPS_ASSIST: "trips.assist",
  GASTOS_MANAGE: "gastos.manage",
  FACTURAS_VIEW: "facturas.view",
  FACTURAS_UPLOAD: "facturas.upload",
  FACTURAS_DELETE: "facturas.delete",
  SYSTEM_CONFIG: "system.config",
  EMAIL_RECEIVE: "email.receive",
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export type PermissionDefinition = {
  code: PermissionCode;
  label: string;
  description: string;
  /** Solo Superadmin puede otorgar este permiso. */
  superAdminOnly?: boolean;
};

export const PERMISSION_CATALOG: PermissionDefinition[] = [
  {
    code: PERMISSIONS.USERS_MANAGE,
    label: "Administrar usuarios",
    description: "Ver, crear, editar y desactivar usuarios",
  },
  {
    code: PERMISSIONS.USERS_ASSIGN_ROLES,
    label: "Asignar roles",
    description: "Cambiar el rol de los usuarios",
    superAdminOnly: true,
  },
  {
    code: PERMISSIONS.USERS_ASSIGN_PERMISSIONS,
    label: "Asignar permisos",
    description: "Otorgar o quitar permisos específicos",
    superAdminOnly: true,
  },
  {
    code: PERMISSIONS.UNITS_MANAGE,
    label: "Administrar unidades",
    description: "Alta y edición de tractos y remolques",
  },
  {
    code: PERMISSIONS.TRIPS_MANAGE,
    label: "Administrar viajes",
    description: "Crear y editar viajes (oficina)",
  },
  {
    code: PERMISSIONS.TRIPS_OPERATE,
    label: "Operar viajes",
    description: "Iniciar/finalizar viajes como operador",
  },
  {
    code: PERMISSIONS.TRIPS_ASSIST,
    label: "Acompañar viajes",
    description: "Participar como acompañante / ayudante",
  },
  {
    code: PERMISSIONS.GASTOS_MANAGE,
    label: "Administrar gastos",
    description: "Ver y registrar gastos / viáticos",
  },
  {
    code: PERMISSIONS.FACTURAS_VIEW,
    label: "Ver facturas de viaje",
    description: "Consultar facturas asociadas a un viaje",
  },
  {
    code: PERMISSIONS.FACTURAS_UPLOAD,
    label: "Cargar facturas de viaje",
    description: "Adjuntar PDF/XML a un viaje",
  },
  {
    code: PERMISSIONS.FACTURAS_DELETE,
    label: "Eliminar facturas de viaje",
    description: "Marcar como eliminada una factura de viaje",
  },
  {
    code: PERMISSIONS.SYSTEM_CONFIG,
    label: "Configuración del sistema",
    description: "Ajustes globales (correos, etc.)",
    superAdminOnly: true,
  },
  {
    code: PERMISSIONS.EMAIL_RECEIVE,
    label: "Recibir correos",
    description: "Puede recibir notificaciones por correo si están activadas",
  },
];

export function isValidPermission(code: string): code is PermissionCode {
  return PERMISSION_CATALOG.some((p) => p.code === code);
}

export function sanitizePermissions(input: unknown): PermissionCode[] {
  if (!Array.isArray(input)) return [];
  const out: PermissionCode[] = [];
  for (const raw of input) {
    const code = String(raw || "").trim();
    if (isValidPermission(code) && !out.includes(code)) out.push(code);
  }
  return out;
}

/** Permisos implícitos por rol (el usuario puede tener extras en `permissions`). */
export function defaultPermissionsForRole(rol?: string | null): PermissionCode[] {
  const r = String(rol || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  if (r === "superadministrador" || r === "superadmin" || r === "admin" || r === "administrador") {
    return [
      PERMISSIONS.USERS_MANAGE,
      PERMISSIONS.USERS_ASSIGN_ROLES,
      PERMISSIONS.USERS_ASSIGN_PERMISSIONS,
      PERMISSIONS.UNITS_MANAGE,
      PERMISSIONS.TRIPS_MANAGE,
      PERMISSIONS.GASTOS_MANAGE,
      PERMISSIONS.EMAIL_RECEIVE,
    ];
  }
  if (r === "operador" || r === "chofer") {
    return [PERMISSIONS.TRIPS_OPERATE, PERMISSIONS.EMAIL_RECEIVE];
  }
  if (r === "ayudante general" || r === "ayudante") {
    return [PERMISSIONS.TRIPS_ASSIST, PERMISSIONS.EMAIL_RECEIVE];
  }
  // Usuario genérico: sin permisos hasta que se asignen
  return [];
}

export function effectivePermissions(
  rol?: string | null,
  explicit?: string[] | null
): Set<PermissionCode> {
  const set = new Set<PermissionCode>(defaultPermissionsForRole(rol));
  for (const code of sanitizePermissions(explicit)) {
    set.add(code);
  }
  return set;
}

export function hasPermission(
  user: { rol?: string | null; permissions?: string[] | null } | null | undefined,
  code: PermissionCode
): boolean {
  if (!user) return false;
  return effectivePermissions(user.rol, user.permissions).has(code);
}

/**
 * Correos del desarrollador / owners que pueden asignar permisos granulares.
 * Otros administradores no pueden. Override: PERMISSIONS_OWNER_EMAILS=a@x.com,b@y.com
 */
const DEFAULT_PERMISSIONS_OWNER_EMAILS = [
  "al222010146@gmail.com",
  "tics@grupohm.com",
];

function permissionsOwnerEmails(): string[] {
  const fromEnv = String(process.env.PERMISSIONS_OWNER_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return fromEnv.length > 0 ? fromEnv : DEFAULT_PERMISSIONS_OWNER_EMAILS;
}

/** Solo owners (desarrollador) pueden asignar el catálogo de permisos. */
export function canManagePermissionCatalog(
  user: { email?: string | null; permissions?: string[] | null } | null | undefined
): boolean {
  if (!user) return false;
  const email = String(user.email || "")
    .trim()
    .toLowerCase();
  return Boolean(email && permissionsOwnerEmails().includes(email));
}
