import { prisma } from "@/lib/prisma";

export interface AuditActionParams {
  userId?: string | null;
  userEmail?: string | null;
  userName?: string | null;
  userRole?: string | null;
  action: string;
  details?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  status?: string;
}

export async function logAuditAction(params: AuditActionParams) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId: params.userId || null,
        userEmail: params.userEmail || null,
        userName: params.userName || null,
        userRole: params.userRole || null,
        action: params.action,
        details: params.details || null,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
        entityType: params.entityType || null,
        entityId: params.entityId || null,
        status: params.status || "success",
      },
    });
  } catch (err) {
    console.error("[AuditLog Error]", err);
    return null;
  }
}
