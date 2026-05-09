import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Injectable()
export class StoresService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateStoreDto) {
    return this.prisma.store.create({ data: dto });
  }

  findAll() {
    return this.prisma.store.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const store = await this.prisma.store.findFirst({
      where: { id, deletedAt: null },
    });
    if (!store) throw new NotFoundException('Store not found');
    return store;
  }

  async update(id: string, dto: UpdateStoreDto) {
    await this.findOne(id);
    return this.prisma.store.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.store.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}
