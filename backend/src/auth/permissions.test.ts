import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canManagePermissionCatalog,
  defaultPermissionsForRole,
  PERMISSIONS,
  sanitizePermissions,
} from "./permissions";

describe("sanitizePermissions", () => {
  it("filtra códigos inválidos y duplicados", () => {
    assert.deepEqual(sanitizePermissions(["trips.manage", "nope", "trips.manage"]), [
      PERMISSIONS.TRIPS_MANAGE,
    ]);
  });
  it("vacío si no es array", () => {
    assert.deepEqual(sanitizePermissions("trips.manage"), []);
  });
});

describe("defaultPermissionsForRole", () => {
  it("admin incluye viajes y gastos, no system.config", () => {
    const perms = defaultPermissionsForRole("Administrador");
    assert.ok(perms.includes(PERMISSIONS.TRIPS_MANAGE));
    assert.ok(perms.includes(PERMISSIONS.GASTOS_MANAGE));
    assert.ok(perms.includes(PERMISSIONS.EMAIL_RECEIVE));
    assert.ok(!perms.includes(PERMISSIONS.SYSTEM_CONFIG));
  });
  it("operador opera viajes y puede recibir correo", () => {
    const perms = defaultPermissionsForRole("Operador");
    assert.ok(perms.includes(PERMISSIONS.TRIPS_OPERATE));
    assert.ok(perms.includes(PERMISSIONS.EMAIL_RECEIVE));
  });
  it("ayudante acompaña y puede recibir correo", () => {
    const perms = defaultPermissionsForRole("Ayudante General");
    assert.ok(perms.includes(PERMISSIONS.TRIPS_ASSIST));
    assert.ok(perms.includes(PERMISSIONS.EMAIL_RECEIVE));
  });
});

describe("canManagePermissionCatalog", () => {
  it("tics@grupohm.com sí puede", () => {
    assert.equal(
      canManagePermissionCatalog({ email: "tics@grupohm.com" }),
      true
    );
  });
  it("otro admin no", () => {
    assert.equal(
      canManagePermissionCatalog({
        email: "admin@otro.com",
        permissions: [PERMISSIONS.USERS_ASSIGN_PERMISSIONS],
      }),
      false
    );
  });
});
