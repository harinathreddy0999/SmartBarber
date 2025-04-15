import express from "express";
import prisma from "../services/prismaService";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// Seed initial services if none exist
async function seedServices() {
  const count = await prisma.service.count();

  if (count === 0) {
    const initialServices = [
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
      data: initialServices,
    });

    console.log("Initial services seeded");
  }
}

// Call the seed function when the module is loaded
seedServices().catch((e) => console.error("Error seeding services:", e));

// Get all services
router.get("/", async (req, res) => {
  try {
    const services = await prisma.service.findMany();
    res.json(services);
  } catch (error) {
    console.error("Error getting services:", error);
    res.status(500).json({ error: "Server error while fetching services" });
  }
});

// Get service by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    res.json(service);
  } catch (error) {
    console.error("Error getting service:", error);
    res.status(500).json({ error: "Server error while fetching service" });
  }
});

// Create a new service (admin only, to be implemented)
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { name, duration, price, description } = req.body;

    // Validate input
    if (!name || !duration || !price) {
      return res
        .status(400)
        .json({ error: "Please provide all required fields" });
    }

    const newService = await prisma.service.create({
      data: {
        name,
        duration,
        price: parseFloat(price),
        description: description || "",
      },
    });

    res.status(201).json(newService);
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({ error: "Server error while creating service" });
  }
});

export default router;
