import { PrismaClient } from "@prisma/client";

// Create a singleton instance of PrismaClient
const prisma = new PrismaClient();

// Export the prisma instance
export default prisma;
