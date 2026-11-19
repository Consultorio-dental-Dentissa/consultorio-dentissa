import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { Role } from 'src/modules/users/enums/rol.enum';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaService();

async function main() {
  // Create roles

  const rolesArray = Object.values(Role);
  const roles = rolesArray.map((role) => {
    return {
      role: role,
    };
  });

  const savedRoles = await prisma.role.createMany({
    data: roles,
    skipDuplicates: true,
  });

  if (savedRoles.count > 0) {
    console.log('Success: roles created successfully');
  } else {
    console.log('Info: roles already exitst');
  }

  // Create admin user

  const adminRole = await prisma.role.findUnique({
    where: { role: Role.ADMINISTRADOR },
    select: { id: true },
  });

  if (!adminRole) {
    console.log(`Error: ${Role.ADMINISTRADOR} role does not exist`);
    return;
  }

  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminPassword || adminPassword.length < 10) {
    console.log(
      'Error: SEED_ADMIN_PASSWORD must be set and have at least 10 characters',
    );
    process.exit(1);
  }

  const admin = {
    name: 'Alfonso Gutierrez',
    lastname: 'Perez Peralta',
    email: 'administrador@gmail.com',
    phone: '1111111111',
    password: await bcrypt.hash(adminPassword, 10),
    role_id: adminRole?.id,
  };

  const user = await prisma.user.upsert({
    where: { email: admin.email },
    update: {},
    create: admin,
  });

  if (!user) {
    console.log('Error: admin user has not been created');
    return;
  }

  console.log('Success: admin user created successfully');

  console.log(`ADMIN EMAIL: ${admin.email}`);
}

main()
  .catch((error) => {
    console.log('Error: ', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
