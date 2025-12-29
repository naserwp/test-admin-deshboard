import { prisma } from "@/app/lib/prisma";

type LeadAuditLogInput = {
  userId: string;
  jobId?: string | null;
  action: string;
  providerId: string;
  count?: number;
  meta?: Record<string, unknown>;
};

export async function logLeadAudit(entry: LeadAuditLogInput) {
  return prisma.leadAuditLog.create({
    data: {
      userId: entry.userId,
      jobId: entry.jobId ?? null,
      action: entry.action,
      providerId: entry.providerId,
      count: entry.count ?? 0,
      meta: entry.meta ?? null,
    },
  });
}
