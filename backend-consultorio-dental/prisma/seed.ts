import { PrismaService } from "src/infrastructure/prisma/prisma.service";
import { Role } from "src/modules/users/enums/rol.enum";

const prisma = new PrismaService();

async function main() {

    const rolesArray = Object.values(Role);
    const roles = rolesArray.map(role => {
        return {
            role: role
        }
    });

    const savedRoles = await prisma.role.createMany({
        data: roles,
        skipDuplicates: true
    });

    if (savedRoles.count > 0) {
        console.log("Success: roles created successfully");

    } else {
        console.log("Info: roles already exitst");
    }
}

main()
    .catch(error => {
        console.log("Error: ", error);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());