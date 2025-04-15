import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Seed barbers
  const barbersCount = await prisma.barber.count();

  if (barbersCount === 0) {
    const barbers = [
      {
        name: "James Wilson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=james",
        specialties: ["Fades", "Beard Trim", "Classic Cuts"],
        bio: "Professional barber with over 10 years of experience specializing in classic cuts and fades.",
        rating: 4.8,
      },
      {
        name: "Maria Rodriguez",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria",
        specialties: ["Modern Styles", "Color", "Texture"],
        bio: "Creative stylist with a passion for modern trends and color techniques.",
        rating: 4.9,
      },
      {
        name: "David Chen",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=david",
        specialties: ["Skin Fades", "Designs", "Hot Towel Shave"],
        bio: "Specializing in precision cuts and artistic designs with attention to detail.",
        rating: 4.7,
      },
    ];

    for (const barber of barbers) {
      await prisma.barber.create({
        data: barber,
      });
    }

    console.log("Barbers seeded");
  }

  // Seed services
  const servicesCount = await prisma.service.count();

  if (servicesCount === 0) {
    const services = [
      {
        name: "Haircut",
        duration: "30 min",
        price: 25,
        description: "Standard haircut with clippers and scissors",
      },
      {
        name: "Haircut & Beard Trim",
        duration: "45 min",
        price: 35,
        description: "Haircut plus beard shaping and trimming",
      },
      {
        name: "Premium Cut & Style",
        duration: "60 min",
        price: 45,
        description: "Detailed haircut with styling and product finish",
      },
      {
        name: "Hot Towel Shave",
        duration: "30 min",
        price: 30,
        description: "Traditional straight razor shave with hot towel",
      },
      {
        name: "Kids Haircut",
        duration: "20 min",
        price: 20,
        description: "Haircut for children under 12",
      },
      {
        name: "Hair Color",
        duration: "90 min",
        price: 60,
        description: "Professional hair coloring service",
      },
    ];

    await prisma.service.createMany({
      data: services,
    });

    console.log("Services seeded");
  }

  // Seed a demo user
  const usersCount = await prisma.user.count();

  if (usersCount === 0) {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    await prisma.user.create({
      data: {
        name: "John Doe",
        email: "john.doe@example.com",
        password: hashedPassword,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
        phone: "(555) 123-4567",
      },
    });

    console.log("Demo user seeded");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
