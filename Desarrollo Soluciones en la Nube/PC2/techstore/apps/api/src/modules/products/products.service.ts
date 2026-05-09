import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { ProductPolicy } from './policies/product.policy';
import { ProductAction } from './policies/product-action.enum';
import { AuthenticatedUser } from '../../common/types';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly policy: ProductPolicy,
  ) {}

  async create(dto: CreateProductDto, user: AuthenticatedUser) {
    this.policy.authorize(user, ProductAction.CREATE, {
      storeId: dto.storeId,
      isPremium: dto.isPremium ?? false,
    });

    const store = await this.prisma.store.findUnique({ where: { id: dto.storeId } });
    if (!store || !store.isActive) {
      throw new BadRequestException('Invalid storeId');
    }

    return this.prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: new Prisma.Decimal(dto.price),
        stock: dto.stock,
        category: dto.category,
        storeId: dto.storeId,
        isPremium: dto.isPremium ?? false,
        createdById: user.id,
      },
    });
  }

  async findAll(query: QueryProductDto, user: AuthenticatedUser) {
    this.policy.authorize(user, ProductAction.LIST);

    const filter = this.policy.buildReadFilter(user);
    const where: Prisma.ProductWhereInput = { ...filter };
    if (query.category) where.category = query.category;
    if (query.storeId) {
      // Si el rol ya está limitado a su tienda, no permitimos sobreescribir
      if (filter.storeId && filter.storeId !== query.storeId) {
        where.storeId = filter.storeId as string;
      } else {
        where.storeId = query.storeId;
      }
    }
    if (query.isPremium !== undefined) where.isPremium = query.isPremium;

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { store: { select: { id: true, name: true } } },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, user: AuthenticatedUser) {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: { store: { select: { id: true, name: true } } },
    });
    if (!product) throw new NotFoundException('Product not found');

    this.policy.authorize(user, ProductAction.READ, product);
    return product;
  }

  async update(id: string, dto: UpdateProductDto, user: AuthenticatedUser) {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
    });
    if (!product) throw new NotFoundException('Product not found');

    this.policy.authorize(user, ProductAction.UPDATE, product);

    const safePayload = this.policy.filterUpdatePayload(
      user,
      dto as unknown as Record<string, unknown>,
    );

    if (safePayload.storeId) {
      const store = await this.prisma.store.findUnique({
        where: { id: safePayload.storeId as string },
      });
      if (!store || !store.isActive) {
        throw new BadRequestException('Invalid storeId');
      }
    }

    const data: Prisma.ProductUpdateInput = { ...safePayload };
    if (safePayload.price !== undefined) {
      data.price = new Prisma.Decimal(safePayload.price as number);
    }

    return this.prisma.product.update({
      where: { id },
      data,
      include: { store: { select: { id: true, name: true } } },
    });
  }

  async remove(id: string, user: AuthenticatedUser) {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
    });
    if (!product) throw new NotFoundException('Product not found');

    this.policy.authorize(user, ProductAction.DELETE, product);

    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: { id: true, name: true, deletedAt: true },
    });
  }
}
