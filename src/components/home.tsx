import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Scissors,
  MessageSquare,
  Camera,
  User,
  Home as HomeIcon,
  CalendarDays,
  ChevronRight,
  Star,
} from "lucide-react";

interface User {
  name: string;
  avatar: string;
  isAuthenticated: boolean;
  upcomingAppointment?: {
    date: string;
    time: string;
    barber: string;
    service: string;
  };
}

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User>({
    name: "John Doe",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
    isAuthenticated: false,
    upcomingAppointment: undefined,
  });

  // Check if user is authenticated from localStorage
  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthenticated") === "true";
    if (!isAuth) {
      navigate("/login");
      return;
    }

    setUser((prev) => ({ ...prev, isAuthenticated: true }));

    // Load user profile if available
    try {
      const storedProfile = localStorage.getItem("userProfile");
      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile);
        setUser((prev) => ({
          ...prev,
          name: parsedProfile.name,
          avatar: parsedProfile.avatar,
        }));
      }

      // Check for upcoming appointments
      const bookings = localStorage.getItem("bookings");
      if (bookings) {
        const parsedBookings = JSON.parse(bookings);
        const upcomingBooking = parsedBookings.find(
          (booking: any) => booking.status === "upcoming",
        );

        if (upcomingBooking) {
          setUser((prev) => ({
            ...prev,
            upcomingAppointment: {
              date: upcomingBooking.date,
              time: upcomingBooking.time,
              barber: upcomingBooking.barber,
              service: upcomingBooking.service,
            },
          }));
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  }, [navigate]);

  if (!user.isAuthenticated) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero section */}
      <div className="relative">
        <img
          src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=1200&q=80"
          alt="Barber Shop"
          className="w-full h-[60vh] object-cover"
          onError={(e) => {
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&q=80";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome to SmartBarber
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mb-6">
            Experience the perfect blend of traditional barbering and modern
            style with our expert stylists
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" asChild>
              <Link to="/booking">Book Appointment</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10" asChild>
              <Link to="/ai-recommendation">Try AI Style Finder</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - User info and upcoming appointment */}
          <div className="space-y-6">
            {/* User card */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={user.avatar}
                      alt={user.name}
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback";
                      }}
                    />
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{user.name}</CardTitle>
                    <CardDescription>Welcome back!</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between">
                  <Button variant="outline" asChild>
                    <Link to="/profile">My Profile</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/booking">Book Appointment</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming appointment */}
            {user.upcomingAppointment ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Upcoming Appointment
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">
                          {user.upcomingAppointment.date}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {user.upcomingAppointment.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">
                          {user.upcomingAppointment.barber}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Your stylist
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Scissors className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">
                          {user.upcomingAppointment.service}
                        </p>
                        <p className="text-sm text-muted-foreground">Service</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline" asChild>
                    <Link to="/profile">Manage Appointments</Link>
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    No Upcoming Appointments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    You don't have any upcoming appointments scheduled.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" asChild>
                    <Link to="/booking">Book Now</Link>
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* Quick actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col"
                  asChild
                >
                  <Link to="/ai-recommendation">
                    <Camera className="h-5 w-5 mb-1" />
                    <span>AI Style Finder</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col"
                  asChild
                >
                  <Link to="/chatbot">
                    <MessageSquare className="h-5 w-5 mb-1" />
                    <span>Chat with Us</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col"
                  asChild
                >
                  <Link to="/stylists">
                    <User className="h-5 w-5 mb-1" />
                    <span>Our Stylists</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col"
                  asChild
                >
                  <Link to="/services">
                    <Scissors className="h-5 w-5 mb-1" />
                    <span>Services</span>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right column - Featured services and promotions */}
          <div className="md:col-span-2 space-y-8">
            {/* Featured services */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Featured Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="overflow-hidden hover:shadow-md transition-all">
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&q=80"
                      alt="Classic Haircut"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle>Classic Haircut</CardTitle>
                    <CardDescription>
                      Traditional haircut with clippers and scissors
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>30 min</span>
                      </div>
                      <span className="font-medium">$25</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" asChild>
                      <Link to="/booking?service=m1">Book Now</Link>
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="overflow-hidden hover:shadow-md transition-all">
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&q=80"
                      alt="Haircut & Beard Combo"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle>Haircut & Beard Combo</CardTitle>
                    <CardDescription>
                      Complete haircut and beard grooming service
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>45 min</span>
                      </div>
                      <span className="font-medium">$35</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" asChild>
                      <Link to="/booking?service=m3">Book Now</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </section>

            {/* Promotions */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Special Offers</h2>
              <Card className="bg-blue-50 border-blue-100">
                <CardHeader>
                  <CardTitle>First Visit Special</CardTitle>
                  <CardDescription>
                    Get 20% off your first haircut and a complimentary beard
                    trim
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    New clients only. Mention this offer when booking your
                    appointment.
                  </p>
                  <Button asChild>
                    <Link to="/booking">Book Now</Link>
                  </Button>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
