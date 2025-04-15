import express from "express";
import { authenticateToken } from "../middleware/auth";
import prisma from "../services/prismaService";

const router = express.Router();

// Seed initial barbers if none exist
async function seedBarbers() {
  const count = await prisma.barber.count();

  if (count === 0) {
    const initialBarbers = [
      {
        name: "James Wilson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=james",
        specialties: ["Fades", "Beard Trim", "Classic Cuts"],
        rating: 4.8,
        bio: "Professional barber with over 10 years of experience specializing in classic cuts and fades.",
      },
      {
        name: "Maria Rodriguez",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria",
        specialties: ["Modern Styles", "Color", "Texture"],
        rating: 4.9,
        bio: "Creative stylist with a passion for modern trends and color techniques.",
      },
      {
        name: "David Chen",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=david",
        specialties: ["Skin Fades", "Designs", "Hot Towel Shave"],
        rating: 4.7,
        bio: "Specializing in precision cuts and artistic designs with attention to detail.",
      },
    ];

    for (const barber of initialBarbers) {
      await prisma.barber.create({
        data: barber,
      });
    }

    console.log("Initial barbers seeded");
  }
}

// Call the seed function when the module is loaded
seedBarbers().catch((e) => console.error("Error seeding barbers:", e));

// Get all barbers
router.get("/", async (req, res) => {
  try {
    // Get all barbers without reviews to keep response size smaller
    const barbers = await prisma.barber.findMany();
    res.json(barbers);
  } catch (error) {
    console.error("Error getting barbers:", error);
    res.status(500).json({ error: "Server error while fetching barbers" });
  }
});

// Get barber by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const barber = await prisma.barber.findUnique({
      where: { id },
    });

    if (!barber) {
      return res.status(404).json({ error: "Barber not found" });
    }

    res.json(barber);
  } catch (error) {
    console.error("Error getting barber:", error);
    res.status(500).json({ error: "Server error while fetching barber" });
  }
});

// Get barber reviews
router.get("/:id/reviews", async (req, res) => {
  try {
    const { id } = req.params;
    const barber = await prisma.barber.findUnique({
      where: { id },
      include: {
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!barber) {
      return res.status(404).json({ error: "Barber not found" });
    }

    res.json(barber.reviews);
  } catch (error) {
    console.error("Error getting barber reviews:", error);
    res
      .status(500)
      .json({ error: "Server error while fetching barber reviews" });
  }
});

// Add a review for a barber (requires authentication)
router.post("/:id/reviews", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { rating, comment } = req.body;

    // Validate input
    if (!rating || !comment) {
      return res
        .status(400)
        .json({ error: "Please provide rating and comment" });
    }

    // Check if barber exists
    const barber = await prisma.barber.findUnique({
      where: { id },
    });

    if (!barber) {
      return res.status(404).json({ error: "Barber not found" });
    }

    // Create new review
    const newReview = await prisma.review.create({
      data: {
        rating: Number(rating),
        comment,
        userId,
        barberId: id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Recalculate barber rating
    const reviews = await prisma.review.findMany({
      where: { barberId: id },
    });

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const newRating = Number((totalRating / reviews.length).toFixed(1));

    // Update barber rating
    await prisma.barber.update({
      where: { id },
      data: { rating: newRating },
    });

    res.status(201).json(newReview);
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ error: "Server error while adding review" });
  }
});

export default router;
