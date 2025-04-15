import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authenticateToken } from "../middleware/auth";
import prisma from "../services/prismaService";

const router = express.Router();

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Please provide all required fields" });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user in database
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(" ", "")}`,
      },
    });

    // Generate JWT token
    const secret = process.env.JWT_SECRET || "your_jwt_secret";
    const token = jwt.sign({ id: newUser.id }, secret, { expiresIn: "1d" });

    // Return user data and token (excluding password)
    const { password: _, ...userData } = newUser;
    res.status(201).json({
      user: userData,
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Server error during registration" });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Please provide email and password" });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Validate password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Generate JWT token
    const secret = process.env.JWT_SECRET || "your_jwt_secret";
    const token = jwt.sign({ id: user.id }, secret, { expiresIn: "1d" });

    // Return user data and token (excluding password)
    const { password: _, ...userData } = user;
    res.json({
      user: userData,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
});

// Get user profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return user data (excluding password)
    const { password, ...userData } = user;
    res.json(userData);
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ error: "Server error while fetching profile" });
  }
});

// Update user profile
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, avatar } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user data
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || undefined,
        email: email || undefined,
        phone: phone || undefined,
        avatar: avatar || undefined,
      },
    });

    // Return updated user data (excluding password)
    const { password, ...userData } = updatedUser;
    res.json(userData);
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ error: "Server error while updating profile" });
  }
});

// Data migration endpoint - migrate localStorage data to database
router.post("/migrate-data", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookings, savedStyles } = req.body;

    // Migrate bookings if provided
    if (bookings && bookings.length > 0) {
      // Process each booking
      for (const booking of bookings) {
        // Find or create barber
        let barber = await prisma.barber.findFirst({
          where: { name: booking.barber },
        });

        if (!barber) {
          barber = await prisma.barber.create({
            data: {
              name: booking.barber,
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${booking.barber.replace(" ", "")}`,
              specialties: [],
              rating: 5.0,
            },
          });
        }

        // Find or create service
        let service = await prisma.service.findFirst({
          where: { name: booking.service },
        });

        if (!service) {
          service = await prisma.service.create({
            data: {
              name: booking.service,
              duration: "30 min",
              price: booking.price || 25,
              description: "",
            },
          });
        }

        // Create booking
        await prisma.booking.create({
          data: {
            date: new Date(booking.date),
            time: booking.time,
            status: booking.status || "upcoming",
            userId,
            barberId: barber.id,
            serviceId: service.id,
          },
        });
      }
    }

    // Migrate saved styles if provided
    if (savedStyles && savedStyles.length > 0) {
      for (const style of savedStyles) {
        await prisma.style.create({
          data: {
            name: style.name,
            description: style.description || "",
            imageUrl: style.imageUrl,
            tags: style.tags || [],
            suitabilityScore: style.suitabilityScore || 0,
            gender: style.gender || "",
            faceShape: style.faceShape || "",
            userId,
          },
        });
      }
    }

    res.json({ message: "Data migration successful" });
  } catch (error) {
    console.error("Data migration error:", error);
    res.status(500).json({ error: "Server error during data migration" });
  }
});

export default router;
