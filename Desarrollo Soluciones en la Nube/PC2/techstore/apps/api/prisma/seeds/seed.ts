import 'dotenv/config';
import { PrismaClient, RoleEnum } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

async function main() {
  console.log('🌱 Seeding TechStore...');

  // -- Roles ---------------------------------------------------------
  const roles = await Promise.all(
    [
      { name: RoleEnum.ADMIN, description: 'Administrador con control total del sistema' },
      { name: RoleEnum.MANAGER, description: 'Gerente de tienda; gestiona productos de su sede' },
      { name: RoleEnum.EMPLOYEE, description: 'Empleado; gestiona stock en su tienda' },
      { name: RoleEnum.AUDITOR, description: 'Auditor; lectura global y logs de auditoría' },
    ].map((data) =>
      prisma.role.upsert({
        where: { name: data.name },
        update: { description: data.description },
        create: data,
      }),
    ),
  );

  const rolesByName = Object.fromEntries(roles.map((r) => [r.name, r])) as Record<RoleEnum, (typeof roles)[number]>;

  // -- Stores --------------------------------------------------------
  const lima = await prisma.store.upsert({
    where: { id: 'store-lima' },
    update: {},
    create: {
      id: 'store-lima',
      name: 'TechStore Lima',
      address: 'Av. Javier Prado Este 1234, San Isidro, Lima',
    },
  });

  const arequipa = await prisma.store.upsert({
    where: { id: 'store-arequipa' },
    update: {},
    create: {
      id: 'store-arequipa',
      name: 'TechStore Arequipa',
      address: 'Calle Mercaderes 456, Cercado, Arequipa',
    },
  });

  // -- Users ---------------------------------------------------------
  const passwordHash = await bcrypt.hash('Password!123', 12);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@techstore.com' },
      update: {},
      create: {
        email: 'admin@techstore.com',
        passwordHash,
        fullName: 'Ana Admin',
        storeId: null,
      },
    }),
    prisma.user.upsert({
      where: { email: 'manager.lima@techstore.com' },
      update: {},
      create: {
        email: 'manager.lima@techstore.com',
        passwordHash,
        fullName: 'Mario Manager (Lima)',
        storeId: lima.id,
      },
    }),
    prisma.user.upsert({
      where: { email: 'employee.lima@techstore.com' },
      update: {},
      create: {
        email: 'employee.lima@techstore.com',
        passwordHash,
        fullName: 'Elena Empleada (Lima)',
        storeId: lima.id,
      },
    }),
    prisma.user.upsert({
      where: { email: 'auditor@techstore.com' },
      update: {},
      create: {
        email: 'auditor@techstore.com',
        passwordHash,
        fullName: 'Aurora Auditor',
        storeId: null,
      },
    }),
  ]);

  const [admin, manager, employee, auditor] = users;

  // -- UserRoles -----------------------------------------------------
  const assignments: { userId: string; roleId: string }[] = [
    { userId: admin.id, roleId: rolesByName.ADMIN.id },
    { userId: manager.id, roleId: rolesByName.MANAGER.id },
    { userId: employee.id, roleId: rolesByName.EMPLOYEE.id },
    { userId: auditor.id, roleId: rolesByName.AUDITOR.id },
  ];
  for (const a of assignments) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: a.userId, roleId: a.roleId } },
      update: {},
      create: { ...a, assignedById: admin.id },
    });
  }

  // -- Products ------------------------------------------------------
  const products = [
    { name: 'Laptop Lenovo ThinkPad X1', price: 7800.0, stock: 5, category: 'Laptops', isPremium: true, storeId: lima.id },
    { name: 'Laptop HP Pavilion', price: 3200.0, stock: 12, category: 'Laptops', isPremium: false, storeId: lima.id },
    { name: 'Mouse Logitech MX Master 3', price: 420.0, stock: 30, category: 'Periféricos', isPremium: true, storeId: lima.id },
    { name: 'Teclado mecánico Redragon', price: 250.0, stock: 25, category: 'Periféricos', isPremium: false, storeId: lima.id },
    { name: 'Monitor Dell UltraSharp 27"', price: 1850.0, stock: 8, category: 'Monitores', isPremium: true, storeId: lima.id },
    { name: 'Laptop ASUS ROG', price: 8900.0, stock: 3, category: 'Laptops', isPremium: true, storeId: arequipa.id },
    { name: 'Laptop Acer Aspire', price: 2400.0, stock: 18, category: 'Laptops', isPremium: false, storeId: arequipa.id },
    { name: 'Audífonos Sony WH-1000XM5', price: 1450.0, stock: 14, category: 'Audio', isPremium: true, storeId: arequipa.id },
    { name: 'Cable HDMI 2m', price: 25.0, stock: 100, category: 'Accesorios', isPremium: false, storeId: arequipa.id },
    { name: 'SSD NVMe 1TB Kingston', price: 380.0, stock: 22, category: 'Almacenamiento', isPremium: false, storeId: arequipa.id },
  ];

  for (const p of products) {
    const existing = await prisma.product.findFirst({
      where: { name: p.name, storeId: p.storeId },
    });
    if (existing) continue;
    await prisma.product.create({
      data: {
        ...p,
        createdById: admin.id,
      },
    });
  }

  console.log('✅ Seed completed.');
  console.log('👥 Users (password: Password!123):');
  console.log('   admin@techstore.com           [ADMIN]');
  console.log('   manager.lima@techstore.com    [MANAGER, store=Lima]');
  console.log('   employee.lima@techstore.com   [EMPLOYEE, store=Lima]');
  console.log('   auditor@techstore.com         [AUDITOR]');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
