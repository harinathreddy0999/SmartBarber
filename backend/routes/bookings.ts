import express from "express";
import { authenticateToken } from "../middleware/auth";
import prisma from "../services/prismaService";

const router = express.Router();

// Get available time slots for a specific date
router.get("/slots/:date", async (req, res) => {
  try {
    const { date } = req.params;
    const { barberId } = req.query;

    // Parse the date string to a Date object
    const bookingDate = new Date(date);

    // Set hours to 0 to get the start of the day
    bookingDate.setHours(0, 0, 0, 0);

    // Set hours to 23:59:59 to get the end of the day
    const endOfDay = new Date(bookingDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get existing bookings for this date
    const existingBookings = await prisma.booking.findMany({
      where: {
        date: {
          gte: bookingDate,
          lte: endOfDay,
        },
        ...(barberId ? { barberId: barberId as string } : {}),
        status: { not: "cancelled" },
      },
      select: {
        time: true,
        barberId: true,
      },
    });

    // Generate all possible time slots
    const timeSlots = [
      { id: "1", time: "9:00 AM", available: true },
      { id: "2", time: "9:30 AM", available: true },
      { id: "3", time: "10:00 AM", available: true },
      { id: "4", time: "10:30 AM", available: true },
      { id: "5", time: "11:00 AM", available: true },
      { id: "6", time: "11:30 AM", available: true },
      { id: "7", time: "12:00 PM", available: true },
      { id: "8", time: "12:30 PM", available: true },
      { id: "9", time: "1:00 PM", available: true },
      { id: "10", time: "1:30 PM", available: true },
      { id: "11", time: "2:00 PM", available: true },
      { id: "12", time: "2:30 PM", available: true },
      { id: "13", time: "3:00 PM", available: true },
      { id: "14", time: "3:30 PM", available: true },
      { id: "15", time: "4:00 PM", available: true },
      { id: "16", time: "4:30 PM", available: true },
    ];

    // Mark slots as unavailable if they're already booked
    for (const booking of existingBookings) {
      const slot = timeSlots.find((slot) => slot.time === booking.time);
      if (slot) {
        // If filtering by barber, only mark as unavailable if it's for that barber
        if (!barberId || booking.barberId === barberId) {
          slot.available = false;
        }
      }
    }

    res.json(timeSlots);
  } catch (error) {
    console.error("Error getting time slots:", error);
    res.status(500).json({ error: "Server error while fetching time slots" });
  }
});

// Create a new booking
router.post("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { date, time, barberId, serviceId } = req.body;

    // Validate input
    if (!date || !time || !barberId || !serviceId) {
      return res
        .status(400)
        .json({ error: "Please provide all required booking details" });
    }

    // Check if the barber and service exist
    const barber = await prisma.barber.findUnique({
      where: { id: barberId },
    });

    if (!barber) {
      return res.status(404).json({ error: "Barber not found" });
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    // Check if the time slot is available
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);

    const endOfDay = new Date(bookingDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBooking = await prisma.booking.findFirst({
      where: {
        date: {
          gte: bookingDate,
          lte: endOfDay,
        },
        time,
        barberId,
        status: { not: "cancelled" },
      },
    });

    if (existingBooking) {
      return res
        .status(400)
        .json({ error: "This time slot is already booked" });
    }

    // Create new booking
    const newBooking = await prisma.booking.create({
      data: {
        date: bookingDate,
        time,
        status: "upcoming",
        userId,
        barberId,
        serviceId,
      },
      include: {
        barber: true,
        service: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json(newBooking);
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ error: "Server error while creating booking" });
  }
});

// Get user's bookings
router.get("/user", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const userBookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        barber: true,
        service: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    res.json(userBookings);
  } catch (error) {
    console.error("Error getting user bookings:", error);
    res.status(500).json({ error: "Server error while fetching bookings" });
  }
});

// Update a booking
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { date, time, barberId, serviceId, status } = req.body;

    // Check if booking exists and belongs to user
    const booking = await prisma.booking.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        date: date ? new Date(date) : undefined,
        time: time || undefined,
        barberId: barberId || undefined,
        serviceId: serviceId || undefined,
        status: status || undefined,
      },
      include: {
        barber: true,
        service: true,
      },
    });

    res.json(updatedBooking);
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({ error: "Server error while updating booking" });
  }
});

// Cancel a booking
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if booking exists and belongs to user
    const booking = await prisma.booking.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Update booking status to cancelled
    await prisma.booking.update({
      where: { id },
      data: {
        status: "cancelled",
      },
    });

    res.json({ message: "Booking cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ error: "Server error while cancelling booking" });
  }
});

export default router;
