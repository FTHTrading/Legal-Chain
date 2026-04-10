import { auth } from "@/lib/auth";
import { ROLE_PERMISSIONS, type Permission, type UserRole } from "@/lib/schemas/user";
import { NextResponse } from "next/server";

/**
 * Get the current authenticated session or null.
 */
export async function getSession() {
  return auth();
}

/**
 * Require an authenticated session. Returns the session or throws a 401 response.
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return session;
}

/**
 * Check if a role has a specific permission (via ROLE_PERMISSIONS map).
 */
export function roleHasPermission(role: UserRole, permission: Permission): boolean {
  const perms = ROLE_PERMISSIONS[role];
  return perms?.includes(permission) ?? false;
}

/**
 * Check if a user (by role + extra permissions) has a specific permission.
 */
export function hasPermission(
  userRole: UserRole,
  userPermissions: string[],
  permission: Permission
): boolean {
  if (userRole === "system_admin") return true;
  if (userPermissions.includes(permission)) return true;
  return roleHasPermission(userRole, permission);
}

/**
 * Require a specific permission. Returns session or throws 403.
 */
export async function requirePermission(permission: Permission) {
  const session = await requireAuth();
  const { role, permissions } = session.user;

  if (!hasPermission(role as UserRole, permissions, permission)) {
    throw new NextResponse(
      JSON.stringify({ error: "Forbidden", required: permission }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }
  return session;
}

/**
 * Require one of the listed roles. Returns session or throws 403.
 */
export async function requireRole(...roles: UserRole[]) {
  const session = await requireAuth();
  if (!roles.includes(session.user.role as UserRole)) {
    throw new NextResponse(
      JSON.stringify({ error: "Forbidden", requiredRoles: roles }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }
  return session;
}
