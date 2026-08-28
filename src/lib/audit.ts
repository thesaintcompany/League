import { prisma } from "@/lib/prisma";

export async function logAuditAction(params: {
  userId?: string | null;
  userEmail?: string | null;
  userName?: string | null;
  userRole?: string | null;
  action: string;
  details?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  status?: "success" | "warning" | "error" | "blocked";
}) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId: params.userId || null,
        userEmail: params.userEmail ? params.userEmail.toLowerCase().trim() : null,
        userName: params.userName || null,
        userRole: params.userRole || null,
        action: params.action,
        details: params.details || null,
        entityType: params.entityType || null,
        entityId: params.entityId || null,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
        status: params.status || "success",
      },
    });
  } catch (err) {
    console.error("Audit log error:", err);
    return null;
  }
}
