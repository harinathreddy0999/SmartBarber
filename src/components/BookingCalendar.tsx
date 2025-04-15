import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  Calendar as CalendarIcon,
  Check,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { barbersApi, servicesApi, bookingApi } from "@/services/apiService";
import { useAuth } from "@/context/AuthContext";

interface Barber {
  id: string;
  name: string;
  avatar: string;
  specialties: string[];
  rating: number;
}

interface Service {
  id: string;
  name: string;
  duration: string;
  price: number;
  description: string;
}

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

interface LocationState {
  selectedStyle?: string;
  fromRecommendation?: boolean;
}

const BookingCalendar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState;
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();

  // Get URL parameters
  const searchParams = new URLSearchParams(location.search);
  const stylistIdFromUrl = searchParams.get("stylist");
  const dateFromUrl = searchParams.get("date");
  const slotFromUrl = searchParams.get("slot");
  const serviceFromUrl = searchParams.get("service");

  const [date, setDate] = useState<Date | undefined>(
    dateFromUrl ? new Date(dateFromUrl) : new Date(),
  );
  const [step, setStep] = useState<number>(stylistIdFromUrl ? 3 : 1); // Skip to service selection if stylist is provided
  const [selectedBarber, setSelectedBarber] = useState<string>(
    stylistIdFromUrl || "",
  );
  const [selectedService, setSelectedService] = useState<string>(
    serviceFromUrl || "",
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(
    slotFromUrl || "",
  );
  const [recommendedStyle, setRecommendedStyle] = useState<string | undefined>(
    locationState?.selectedStyle,
  );

  // Add loading states
  const [loadingBarbers, setLoadingBarbers] = useState<boolean>(false);
  const [loadingServices, setLoadingServices] = useState<boolean>(false);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState<boolean>(false);
  const [loadingBooking, setLoadingBooking] = useState<boolean>(false);

  // Add data states
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  // Fetch barbers from API
  useEffect(() => {
    const fetchBarbers = async () => {
      setLoadingBarbers(true);
      try {
        const response = await barbersApi.getAllBarbers();
        if (response.data) {
          setBarbers(response.data);
        } else if (response.error) {
          toast({
            title: "Error",
            description: `Failed to load barbers: ${response.error}`,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching barbers:", error);
        toast({
          title: "Error",
          description: "Failed to load barbers. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoadingBarbers(false);
      }
    };

    fetchBarbers();
  }, [toast]);

  // Fetch services from API
  useEffect(() => {
    const fetchServices = async () => {
      setLoadingServices(true);
      try {
        const response = await servicesApi.getAllServices();
        if (response.data) {
          setServices(response.data);

          // Check if we came from the recommendation page and set the service accordingly
          if (
            locationState?.fromRecommendation &&
            locationState?.selectedStyle
          ) {
            // Find a service that matches the recommended style
            const matchingService = response.data.find((service) =>
              service.name
                .toLowerCase()
                .includes(locationState.selectedStyle?.toLowerCase() || ""),
            );

            if (matchingService) {
              setSelectedService(matchingService.id);
              // If we have a matching service, we can skip to step 2 (barber selection)
              setStep(2);
              setRecommendedStyle(locationState.selectedStyle);
            }
          }

          // Check if we have a service from URL
          if (serviceFromUrl) {
            const service = response.data.find((s) => s.id === serviceFromUrl);
            if (service) {
              setSelectedService(service.id);
              setStep(2); // Move to barber selection
            }
          }
        } else if (response.error) {
          toast({
            title: "Error",
            description: `Failed to load services: ${response.error}`,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        toast({
          title: "Error",
          description: "Failed to load services. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoadingServices(false);
      }
    };

    fetchServices();
  }, [locationState, serviceFromUrl, toast]);

  // Fetch available time slots when date and barber are selected
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!date || !selectedBarber) return;

      setLoadingTimeSlots(true);
      try {
        const formattedDate = date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
        const response = await bookingApi.getAvailableSlots(
          formattedDate,
          selectedBarber,
        );

        if (response.data) {
          setTimeSlots(response.data);
        } else if (response.error) {
          toast({
            title: "Error",
            description: `Failed to load time slots: ${response.error}`,
            variant: "destructive",
          });
          // Fallback to empty slots
          setTimeSlots([]);
        }
      } catch (error) {
        console.error("Error fetching time slots:", error);
        toast({
          title: "Error",
          description: "Failed to load available time slots. Please try again.",
          variant: "destructive",
        });
        // Fallback to empty slots
        setTimeSlots([]);
      } finally {
        setLoadingTimeSlots(false);
      }
    };

    // Only fetch time slots when we reach step 4 (time selection)
    if (step === 4) {
      fetchTimeSlots();
    }
  }, [date, selectedBarber, step, toast]);

  const handleNextStep = () => {
    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
  };

  const handleBookAppointment = async () => {
    // Get selected data
    const barberName = getSelectedBarberName();
    const serviceName = getSelectedServiceName();
    const timeSlot = getSelectedTimeSlotTime();
    const servicePrice = getSelectedServicePrice();

    if (date && barberName && serviceName && timeSlot) {
      // Prepare booking details
      const bookingDetails = {
        date: date.toISOString(),
        time: timeSlot,
        barberId: selectedBarber,
        serviceId: selectedService,
        userId: isAuthenticated && user ? user.id : undefined,
        status: "upcoming",
      };

      setLoadingBooking(true);

      try {
        // If user is authenticated, create booking through API
        if (isAuthenticated && user) {
          const response = await bookingApi.createBooking(bookingDetails);

          if (response.error) {
            toast({
              title: "Booking Failed",
              description: response.error,
              variant: "destructive",
            });
            setLoadingBooking(false);
            return;
          }

          // Use the booking from the API response
          const apiBookingDetails = response.data;

          // Navigate to checkout with booking details
          navigate("/checkout", {
            state: { bookingDetails: apiBookingDetails },
          });
        } else {
          // For non-authenticated users, use local storage (legacy approach)
          const localBookingDetails = {
            id: Date.now().toString(),
            date: date.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            }),
            time: timeSlot,
            barber: barberName,
            service: serviceName,
            price: servicePrice,
            status: "upcoming",
          };

          // Save booking to localStorage for persistence
          localStorage.setItem(
            "lastBooking",
            JSON.stringify(localBookingDetails),
          );

          // Add to bookings array for history
          try {
            const existingBookings = JSON.parse(
              localStorage.getItem("bookings") || "[]",
            );
            localStorage.setItem(
              "bookings",
              JSON.stringify([...existingBookings, localBookingDetails]),
            );
          } catch (error) {
            console.error("Error saving booking to history:", error);
            // Continue even if there's an error with the history
          }

          // Navigate to checkout with booking details
          navigate("/checkout", {
            state: { bookingDetails: localBookingDetails },
          });
        }
      } catch (error) {
        console.error("Error creating booking:", error);
        toast({
          title: "Booking Failed",
          description:
            "There was an error creating your booking. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoadingBooking(false);
      }
    } else {
      toast({
        title: "Incomplete Information",
        description: "Please complete all booking information.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const getSelectedBarberName = () => {
    return barbers.find((barber) => barber.id === selectedBarber)?.name || "";
  };

  const getSelectedServiceName = () => {
    return (
      services.find((service) => service.id === selectedService)?.name || ""
    );
  };

  const getSelectedTimeSlotTime = () => {
    return timeSlots.find((slot) => slot.id === selectedTimeSlot)?.time || "";
  };

  const getSelectedServicePrice = () => {
    return (
      services.find((service) => service.id === selectedService)?.price || 0
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-background p-4 rounded-xl min-h-screen">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Book Your Appointment
          </CardTitle>
          <CardDescription className="text-center">
            Select your preferred date, barber, service, and time
          </CardDescription>

          {/* Progress indicator */}
          <div className="flex justify-between items-center mt-6 px-2">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                <CalendarIcon className="w-4 h-4" />
              </div>
              <span className="text-xs mt-1">Date</span>
            </div>
            <div className="flex-1 h-1 mx-2 bg-muted">
              <div
                className={`h-full bg-primary ${step >= 2 ? "w-full" : "w-0"} transition-all duration-300`}
              ></div>
            </div>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                <span className="text-xs font-medium">2</span>
              </div>
              <span className="text-xs mt-1">Barber</span>
            </div>
            <div className="flex-1 h-1 mx-2 bg-muted">
              <div
                className={`h-full bg-primary ${step >= 3 ? "w-full" : "w-0"} transition-all duration-300`}
              ></div>
            </div>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                <span className="text-xs font-medium">3</span>
              </div>
              <span className="text-xs mt-1">Service</span>
            </div>
            <div className="flex-1 h-1 mx-2 bg-muted">
              <div
                className={`h-full bg-primary ${step >= 4 ? "w-full" : "w-0"} transition-all duration-300`}
              ></div>
            </div>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 4 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                <span className="text-xs font-medium">4</span>
              </div>
              <span className="text-xs mt-1">Time</span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Select a Date</h3>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                  disabled={(date) => {
                    // Disable past dates and Sundays
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today || date.getDay() === 0;
                  }}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Select a Barber</h3>
              {loadingBarbers ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading barbers...</span>
                </div>
              ) : barbers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No barbers available. Please try again later.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {barbers.map((barber) => (
                    <Card
                      key={barber.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${selectedBarber === barber.id ? "ring-2 ring-primary" : ""}`}
                      onClick={() => setSelectedBarber(barber.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col items-center space-y-3">
                          <Avatar className="w-20 h-20">
                            <AvatarImage
                              src={barber.avatar}
                              alt={barber.name}
                            />
                            <AvatarFallback>
                              {barber.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-center">
                            <h4 className="font-medium">{barber.name}</h4>
                            <div className="text-sm text-muted-foreground">
                              {barber.rating} ★
                            </div>
                          </div>
                          <div className="flex flex-wrap justify-center gap-1">
                            {barber.specialties.map((specialty, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Select a Service</h3>
              {loadingServices ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading services...</span>
                </div>
              ) : services.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No services available. Please try again later.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {services.map((service) => (
                    <Card
                      key={service.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${selectedService === service.id ? "ring-2 ring-primary" : ""}`}
                      onClick={() => setSelectedService(service.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{service.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {service.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">${service.price}</div>
                            <div className="text-sm text-muted-foreground">
                              {service.duration}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Select a Time</h3>
              {loadingTimeSlots ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading available time slots...</span>
                </div>
              ) : timeSlots.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No time slots available for this date. Please select another
                    date.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot.id}
                      variant={
                        selectedTimeSlot === slot.id ? "default" : "outline"
                      }
                      className="justify-start"
                      disabled={!slot.available}
                      onClick={() => setSelectedTimeSlot(slot.id)}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      {slot.time}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Confirm Your Booking</h3>
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{formatDate(date)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium">
                      {getSelectedTimeSlotTime()}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Barber</span>
                    <span className="font-medium">
                      {getSelectedBarberName()}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Service</span>
                    <span className="font-medium">
                      {getSelectedServiceName()}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-medium">
                      ${getSelectedServicePrice()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          {step > 1 && (
            <Button variant="outline" onClick={handlePreviousStep}>
              Back
            </Button>
          )}
          {step === 1 && (
            <Button variant="outline" className="opacity-0 cursor-default">
              Back
            </Button>
          )}

          {step < 5 && (
            <Button
              onClick={handleNextStep}
              disabled={
                (step === 1 && !date) ||
                (step === 2 && !selectedBarber) ||
                (step === 3 && !selectedService) ||
                (step === 4 && !selectedTimeSlot)
              }
            >
              Continue
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          {step === 5 && (
            <Button onClick={handleBookAppointment} disabled={loadingBooking}>
              {loadingBooking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Confirm Booking
                  <Check className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default BookingCalendar;
