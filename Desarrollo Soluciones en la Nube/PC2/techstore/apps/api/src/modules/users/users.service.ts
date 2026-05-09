import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto, UpdateUserDto } from './dto/update-user.dto';

const SAFE_USER_SELECT = {
  id: true,
  email: true,
  fullName: true,
  storeId: true,
  isActive: true,
  mfaEnabled: true,
  createdAt: true,
  updatedAt: true,
  store: { select: { id: true, name: true } },
  userRoles: {
    select: {
      role: { select: { id: true, name: true, description: true } },
      assignedAt: true,
    },
  },
};

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    if (dto.storeId) {
      const store = await this.prisma.store.findUnique({ where: { id: dto.storeId } });
      if (!store) throw new BadRequestException('Invalid storeId');
    }

    const rounds = this.config.get<number>('bcrypt.rounds') ?? 12;
    const passwordHash = await bcrypt.hash(dto.password, rounds);

    return this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
        storeId: dto.storeId,
        isActive: dto.isActive ?? true,
      },
      select: SAFE_USER_SELECT,
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      where: { deletedAt: null },
      select: SAFE_USER_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: SAFE_USER_SELECT,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);
    if (dto.storeId) {
      const store = await this.prisma.store.findUnique({ where: { id: dto.storeId } });
      if (!store) throw new BadRequestException('Invalid storeId');
    }
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: SAFE_USER_SELECT,
    });
  }

  async updateOwnProfile(id: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: SAFE_USER_SELECT,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
      select: { id: true, email: true, isActive: true, deletedAt: true },
    });
  }
}
