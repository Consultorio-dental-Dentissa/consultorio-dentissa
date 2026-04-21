import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

const prisma = new PrismaService();

async function main() {

}

main()
    .catch(error => console.log(error))
    .finally(() => prisma.$disconnect());