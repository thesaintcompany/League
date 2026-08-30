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

export function extractClientInfo(req?: Request | Headers | any | null): { ipAddress: string; userAgent: string } {
  if (!req) return { ipAddress: "127.0.0.1", userAgent: "Browser Standard / Server" };

  try {
    let headers: Headers | null = null;
    if (req.headers && typeof req.headers.get === "function") {
      headers = req.headers as Headers;
    } else if (typeof req.get === "function") {
      headers = req as any;
    } else if (req.headers && typeof req.headers === "object") {
      const forwarded = req.headers["x-forwarded-for"] || req.headers["X-Forwarded-For"];
      const realIp = req.headers["x-real-ip"] || req.headers["X-Real-IP"];
      const cfIp = req.headers["cf-connecting-ip"] || req.headers["CF-Connecting-IP"];
      const ip = Array.isArray(forwarded)
        ? forwarded[0]
        : (typeof forwarded === "string" ? forwarded.split(",")[0].trim() : (realIp || cfIp || "127.0.0.1"));
      const ua = (req.headers["user-agent"] || req.headers["User-Agent"] || "Browser Standard / Server") as string;
      return { ipAddress: String(ip), userAgent: String(ua) };
    }

    if (headers) {
      const forwarded = headers.get("x-forwarded-for");
      const realIp = headers.get("x-real-ip");
      const cfIp = headers.get("cf-connecting-ip");
      const ipAddress = forwarded ? forwarded.split(",")[0].trim() : (realIp || cfIp || "127.0.0.1");
      const userAgent = headers.get("user-agent") || "Browser Standard / Server";
      return { ipAddress, userAgent };
    }
  } catch (err) {
    console.error("[extractClientInfo Error]", err);
  }

  return { ipAddress: "127.0.0.1", userAgent: "Browser Standard / Server" };
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

