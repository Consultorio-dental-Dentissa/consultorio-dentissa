import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { Role } from 'src/modules/users/enums/rol.enum';
import * as bcrypt from "bcrypt"

const prisma = new PrismaService();

async function main() {
    const rolesArray = Object.values(Role);
    const roles = rolesArray.map(role => {
        return {
            role: role
        }
    });

    const createdRoles = await prisma.role.createMany({
        data: roles,
        skipDuplicates: true
    });

    if (createdRoles.count > 0) {
        console.log("Success: roles created successfully");

    } else {
        console.log("Info: roles already exist");
    }


    const adminRole = await prisma.role.findUnique({
        where: { role: Role.ADMINISTRADOR },
        select: { id: true }
    });

    if (!adminRole) {
        console.log(`Error: ${Role.ADMINISTRADOR} role does not exist`);
        return;
    }

    const user = {
        name: 'Alfonso Martin',
        lastname: "Perez Peralta",
        email: "administrador@gmail.com",
        phone: "1111111111",
        password: await bcrypt.hash("12345678", 10),
        role_id: adminRole.id
    }

    await prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: user
    });

    console.log("Success: admin created successfully");
}

main()
    .catch(error => console.log(error))
    .finally(() => prisma.$disconnect());