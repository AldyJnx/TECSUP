import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleEnum } from '@prisma/client';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types';
import { Audit, AuditInterceptor } from '../audit-log/audit.interceptor';

@ApiTags('Roles')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
@Controller('roles')
export class RolesController {
  constructor(private readonly roles: RolesService) {}

  @Post()
  @Roles(RoleEnum.ADMIN)
  @Audit('role')
  @ApiOperation({ summary: 'Crear rol (ADMIN)' })
  create(@Body() dto: CreateRoleDto) {
    return this.roles.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar roles (cualquier autenticado)' })
  findAll() {
    return this.roles.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener rol por id' })
  findOne(@Param('id') id: string) {
    return this.roles.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.ADMIN)
  @Audit('role')
  @ApiOperation({ summary: 'Actualizar descripción del rol (ADMIN)' })
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.roles.update(id, dto);
  }

  @Delete(':id')
  @Roles(RoleEnum.ADMIN)
  @Audit('role')
  @ApiOperation({ summary: 'Eliminar rol (ADMIN, solo si no tiene usuarios)' })
  remove(@Param('id') id: string) {
    return this.roles.remove(id);
  }

  @Post('assign')
  @Roles(RoleEnum.ADMIN)
  @Audit('user-role')
  @ApiOperation({ summary: 'Asignar rol a usuario (ADMIN)' })
  assign(@Body() dto: AssignRoleDto, @CurrentUser() user: AuthenticatedUser) {
    return this.roles.assignToUser(dto.userId, dto.roleId, user.id);
  }

  @Delete('assign/:userId/:roleId')
  @Roles(RoleEnum.ADMIN)
  @Audit('user-role')
  @ApiOperation({ summary: 'Revocar rol de usuario (ADMIN)' })
  revoke(@Param('userId') userId: string, @Param('roleId') roleId: string) {
    return this.roles.revokeFromUser(userId, roleId);
  }
}
