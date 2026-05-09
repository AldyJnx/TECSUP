import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditEntry {
  userId?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string | null;
  userAgent?: string | null;
  success?: boolean;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  async record(entry: AuditEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: entry.userId ?? null,
          action: entry.action,
          resource: entry.resource,
          resourceId: entry.resourceId ?? null,
          metadata: entry.metadata,
          ipAddress: entry.ipAddress ?? null,
          userAgent: entry.userAgent ?? null,
          success: entry.success ?? true,
        },
      });
    } catch (err) {
      this.logger.error(`Failed to write audit log: ${String(err)}`);
    }
  }

  async findAll(params: { page: number; limit: number; userId?: string; resource?: string }) {
    const where: Prisma.AuditLogWhereInput = {};
    if (params.userId) where.userId = params.userId;
    if (params.resource) where.resource = params.resource;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { timestamp: 'desc' },
        include: { user: { select: { id: true, email: true } } },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data,
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
    };
  }
}
