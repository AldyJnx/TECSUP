import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { RoleEnum } from '@prisma/client';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

class QueryAuditDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  resource?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;
}

@ApiTags('Audit')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit-logs')
export class AuditLogController {
  constructor(private readonly auditLog: AuditLogService) {}

  @Get()
  @Roles(RoleEnum.ADMIN, RoleEnum.AUDITOR)
  @ApiOperation({ summary: 'Listar logs de auditoría (ADMIN, AUDITOR)' })
  findAll(@Query() query: QueryAuditDto) {
    return this.auditLog.findAll({
      page: query.page ?? 1,
      limit: query.limit ?? 50,
      userId: query.userId,
      resource: query.resource,
    });
  }
}
