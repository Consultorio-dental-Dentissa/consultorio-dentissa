import { PrismaService } from "src/infrastructure/prisma/prisma.service";

const prisma = new PrismaService();

async function main() {
    
}

main().finally(() => prisma.$disconnect());