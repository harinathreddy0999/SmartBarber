import express from "express";
import { authenticateToken } from "../middleware/auth";
import prisma from "../services/prismaService";

const router = express.Router();

// Get user's saved styles
router.get("/user", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get styles from database
    const userStyles = await prisma.style.findMany({
      where: { userId },
      orderBy: {
        date: "desc",
      },
    });

    res.json(userStyles);
  } catch (error) {
    console.error("Error getting saved styles:", error);
    res.status(500).json({ error: "Server error while fetching saved styles" });
  }
});

// Save a new style
router.post("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      description,
      imageUrl,
      tags,
      suitabilityScore,
      gender,
      faceShape,
    } = req.body;

    // Validate input
    if (!name || !imageUrl) {
      return res
        .status(400)
        .json({ error: "Please provide name and image URL" });
    }

    // Create new style in database
    const newStyle = await prisma.style.create({
      data: {
        name,
        description: description || "",
        imageUrl,
        tags: tags || [],
        suitabilityScore: suitabilityScore || 0,
        gender: gender || "",
        faceShape: faceShape || "",
        userId,
      },
    });

    res.status(201).json(newStyle);
  } catch (error) {
    console.error("Error saving style:", error);
    res.status(500).json({ error: "Server error while saving style" });
  }
});

// Get a specific style
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Find style in database
    const style = await prisma.style.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!style) {
      return res.status(404).json({ error: "Style not found" });
    }

    res.json(style);
  } catch (error) {
    console.error("Error getting style:", error);
    res.status(500).json({ error: "Server error while fetching style" });
  }
});

// Update a style
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const {
      name,
      description,
      imageUrl,
      tags,
      suitabilityScore,
      gender,
      faceShape,
    } = req.body;

    // Find style in database
    const style = await prisma.style.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!style) {
      return res.status(404).json({ error: "Style not found" });
    }

    // Update style
    const updatedStyle = await prisma.style.update({
      where: { id },
      data: {
        name: name || undefined,
        description: description || undefined,
        imageUrl: imageUrl || undefined,
        tags: tags || undefined,
        suitabilityScore: suitabilityScore || undefined,
        gender: gender || undefined,
        faceShape: faceShape || undefined,
      },
    });

    res.json(updatedStyle);
  } catch (error) {
    console.error("Error updating style:", error);
    res.status(500).json({ error: "Server error while updating style" });
  }
});

// Delete a saved style
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Find style in database
    const style = await prisma.style.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!style) {
      return res.status(404).json({ error: "Style not found" });
    }

    // Delete style
    await prisma.style.delete({
      where: { id },
    });

    res.json({ message: "Style deleted successfully" });
  } catch (error) {
    console.error("Error deleting style:", error);
    res.status(500).json({ error: "Server error while deleting style" });
  }
});

export default router;
