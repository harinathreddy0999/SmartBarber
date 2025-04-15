import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import bookingRoutes from "./routes/bookings";
import barberRoutes from "./routes/barbers";
import serviceRoutes from "./routes/services";
import styleRoutes from "./routes/styles";
import prisma from "./services/prismaService";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/bookings", bookingRoutes);
app.use("/barbers", barberRoutes);
app.use("/services", serviceRoutes);
app.use("/styles", styleRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ message: "SmartBarber API is running" });
});

// Connect to Prisma and start server
async function startServer() {
  try {
    // Connect to the database
    await prisma.$connect();
    console.log("Connected to database");

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  console.log("Disconnected from database");
  process.exit(0);
});

startServer();
