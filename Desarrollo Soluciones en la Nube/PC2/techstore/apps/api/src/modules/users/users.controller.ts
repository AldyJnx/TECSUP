import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleEnum } from '@prisma/client';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto, UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types';
import { Audit, AuditInterceptor } from '../audit-log/audit.interceptor';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Post()
  @Roles(RoleEnum.ADMIN)
  @Audit('user')
  @ApiOperation({ summary: 'Crear usuario (ADMIN)' })
  create(@Body() dto: CreateUserDto) {
    return this.users.create(dto);
  }

  @Get()
  @Roles(RoleEnum.ADMIN, RoleEnum.AUDITOR)
  @ApiOperation({ summary: 'Listar usuarios (ADMIN, AUDITOR)' })
  findAll() {
    return this.users.findAll();
  }

  @Get('me/profile')
  @ApiOperation({ summary: 'Mi perfil' })
  myProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.users.findOne(user.id);
  }

  @Patch('me/profile')
  @ApiOperation({ summary: 'Actualizar mi perfil (campos limitados)' })
  updateMyProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.users.updateOwnProfile(user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver usuario (propio o ADMIN/AUDITOR)' })
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    if (
      id !== user.id &&
      !user.roles.includes(RoleEnum.ADMIN) &&
      !user.roles.includes(RoleEnum.AUDITOR)
    ) {
      throw new ForbiddenException('Cannot view other user profiles');
    }
    return this.users.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.ADMIN)
  @Audit('user')
  @ApiOperation({ summary: 'Actualizar usuario (ADMIN)' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.users.update(id, dto);
  }

  @Delete(':id')
  @Roles(RoleEnum.ADMIN)
  @Audit('user')
  @ApiOperation({ summary: 'Soft delete de usuario (ADMIN)' })
  remove(@Param('id') id: string) {
    return this.users.remove(id);
  }
}
