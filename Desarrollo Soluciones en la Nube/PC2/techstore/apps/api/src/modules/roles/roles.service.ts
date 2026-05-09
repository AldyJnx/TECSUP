import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRoleDto) {
    const existing = await this.prisma.role.findUnique({ where: { name: dto.name } });
    if (existing) throw new ConflictException('Role already exists');
    return this.prisma.role.create({ data: dto });
  }

  findAll() {
    return this.prisma.role.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { userRoles: true } } },
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { userRoles: true } } },
    });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async update(id: string, dto: UpdateRoleDto) {
    await this.findOne(id);
    return this.prisma.role.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const role = await this.findOne(id);
    if (role._count.userRoles > 0) {
      throw new BadRequestException(
        'Cannot delete role: it is currently assigned to users',
      );
    }
    return this.prisma.role.delete({ where: { id } });
  }

  async assignToUser(userId: string, roleId: string, assignedById: string) {
    const [user, role] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.role.findUnique({ where: { id: roleId } }),
    ]);
    if (!user) throw new NotFoundException('User not found');
    if (!role) throw new NotFoundException('Role not found');

    const exists = await this.prisma.userRole.findUnique({
      where: { userId_roleId: { userId, roleId } },
    });
    if (exists) {
      throw new ConflictException('Role already assigned to user');
    }

    return this.prisma.userRole.create({
      data: { userId, roleId, assignedById },
      include: { role: true, user: { select: { id: true, email: true } } },
    });
  }

  async revokeFromUser(userId: string, roleId: string) {
    const exists = await this.prisma.userRole.findUnique({
      where: { userId_roleId: { userId, roleId } },
    });
    if (!exists) throw new NotFoundException('Assignment not found');
    return this.prisma.userRole.delete({
      where: { userId_roleId: { userId, roleId } },
    });
  }
}
