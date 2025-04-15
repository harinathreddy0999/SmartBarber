import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  CreditCard,
  Calendar,
  User,
  Clock,
  Scissors,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { bookingApi } from "@/services/apiService";

interface BookingDetails {
  id: string;
  date: string;
  time: string;
  barber: string;
  service: string;
  price: number;
  status: string;
}

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [savePaymentInfo, setSavePaymentInfo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  // Get booking details from location state or use defaults
  const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
    id: Date.now().toString(),
    date: "May 15, 2023",
    time: "2:30 PM",
    barber: "Mike Johnson",
    service: "Haircut & Beard Trim",
    price: 35,
    status: "upcoming",
  });

  // Load booking details from localStorage or location state
  useEffect(() => {
    // Check if we have booking details in location state
    if (location.state?.bookingDetails) {
      setBookingDetails({
        ...location.state.bookingDetails,
        id: Date.now().toString(), // Ensure we have a unique ID
        status: "upcoming",
      });
    } else {
      // Try to get from localStorage
      const lastBookingStr = localStorage.getItem("lastBooking");
      if (lastBookingStr) {
        try {
          const lastBooking = JSON.parse(lastBookingStr);
          setBookingDetails({
            ...lastBooking,
            id: Date.now().toString(), // Ensure we have a unique ID
            status: "upcoming",
          });
        } catch (error) {
          console.error("Error parsing last booking:", error);
        }
      }
    }
  }, [location.state]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate form fields if using card payment
    if (paymentMethod === "card") {
      if (!cardNumber || !cardName || !expiryDate || !cvv) {
        setIsLoading(false);
        toast({
          title: "Validation Error",
          description: "Please fill in all required payment fields",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      // Create booking data object
      const bookingData = {
        date: bookingDetails.date,
        time: bookingDetails.time,
        barberId: location.state?.barberId || "default-barber-id",
        serviceId: location.state?.serviceId || "default-service-id",
      };

      // Try to create booking via API
      const response = await bookingApi.createBooking(bookingData);

      if (response.error) {
        throw new Error(response.error);
      }

      // If successful, complete the checkout process
      setIsComplete(true);

      // Save booking to localStorage as fallback
      const booking = {
        ...bookingDetails,
        id: response.data?.id || Date.now().toString(),
        status: "upcoming",
        paymentMethod,
        paymentDate: new Date().toISOString(),
        paymentConfirmationCode: generateConfirmationCode(),
      };

      // Save to lastBooking for immediate reference
      localStorage.setItem("lastBooking", JSON.stringify(booking));

      try {
        // Add to bookings array for history (as fallback)
        const existingBookings = JSON.parse(
          localStorage.getItem("bookings") || "[]",
        );

        // Check if this booking already exists in the array
        const existingBookingIndex = existingBookings.findIndex(
          (b) =>
            b.date === booking.date &&
            b.time === booking.time &&
            b.barber === booking.barber,
        );

        // If it exists, update it, otherwise add it
        if (existingBookingIndex >= 0) {
          existingBookings[existingBookingIndex] = booking;
        } else {
          existingBookings.push(booking);
        }

        localStorage.setItem("bookings", JSON.stringify(existingBookings));
      } catch (localError) {
        console.error("Error saving booking to local history:", localError);
        // Continue even if there's an error with the local history
      }

      toast({
        title: "Booking Successful",
        description: "Your appointment has been confirmed!",
      });
    } catch (error) {
      console.error("Error processing booking:", error);
      setIsLoading(false);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred during checkout",
      );
      toast({
        title: "Checkout Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to process your booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Generate a random confirmation code
  const generateConfirmationCode = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    return result;
  };

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  // Handle card number input
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCardNumber(e.target.value);
    setCardNumber(formattedValue);
  };

  // Handle expiry date input
  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 2) {
      value = value.substring(0, 2) + "/" + value.substring(2, 4);
    }
    setExpiryDate(value);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Top navigation */}
      <div className="bg-white border-b border-gray-200 py-4 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="mr-2"
              onClick={handleGoBack}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold">Checkout</h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
        {!isComplete ? (
          <>
            {/* Booking summary */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
                <CardDescription>
                  Review your appointment details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Date</span>
                  </div>
                  <span className="font-medium">{bookingDetails.date}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Time</span>
                  </div>
                  <span className="font-medium">{bookingDetails.time}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Barber</span>
                  </div>
                  <span className="font-medium">{bookingDetails.barber}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Scissors className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Service</span>
                  </div>
                  <span className="font-medium">{bookingDetails.service}</span>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 flex justify-between">
                <span className="font-medium">Total</span>
                <span className="font-bold text-lg">
                  ${bookingDetails.price}
                </span>
              </CardFooter>
            </Card>

            {/* Payment form */}
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
                  {error}
                </div>
              )}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                  <CardDescription>Choose how you want to pay</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup
                    defaultValue="card"
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Credit or Debit Card
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="paypal" id="paypal" />
                      <Label
                        htmlFor="paypal"
                        className="flex items-center gap-2"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-blue-600"
                        >
                          <path d="M7 11l5-5 5 5M7 6l5-5 5 5" />
                        </svg>
                        PayPal
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="apple" id="apple" />
                      <Label
                        htmlFor="apple"
                        className="flex items-center gap-2"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
                          <path d="M10 2c1 .5 2 2 2 5" />
                        </svg>
                        Apple Pay
                      </Label>
                    </div>
                  </RadioGroup>

                  {paymentMethod === "card" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="card-number">Card Number</Label>
                        <Input
                          id="card-number"
                          placeholder="1234 5678 9012 3456"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          maxLength={19}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="card-name">Name on Card</Label>
                        <Input
                          id="card-name"
                          placeholder="John Doe"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input
                            id="expiry"
                            placeholder="MM/YY"
                            value={expiryDate}
                            onChange={handleExpiryDateChange}
                            maxLength={5}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={cvv}
                            onChange={(e) =>
                              setCvv(e.target.value.replace(/\D/g, ""))
                            }
                            maxLength={3}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-4 pt-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="save-card"
                            checked={savePaymentInfo}
                            onCheckedChange={(checked) =>
                              setSavePaymentInfo(!!checked)
                            }
                          />
                          <label
                            htmlFor="save-card"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Save card for future payments
                          </label>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <p>• All transactions are secure and encrypted</p>
                          <p>
                            • Your card information is never stored on our
                            servers
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "paypal" && (
                    <div className="bg-blue-50 p-4 rounded-md text-center">
                      <p className="text-sm text-muted-foreground mb-4">
                        You will be redirected to PayPal to complete your
                        payment.
                      </p>
                      <img
                        src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/checkout-logo-large.png"
                        alt="PayPal Checkout"
                        className="h-10 mx-auto"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://www.paypalobjects.com/webstatic/en_US/i/buttons/PP_logo_h_100x26.png";
                        }}
                      />
                    </div>
                  )}

                  {paymentMethod === "apple" && (
                    <div className="bg-gray-50 p-4 rounded-md text-center">
                      <p className="text-sm text-muted-foreground mb-4">
                        You will be prompted to complete your payment with Apple
                        Pay.
                      </p>
                      <div className="bg-black text-white font-medium py-2 px-4 rounded-md inline-flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
                          <path d="M10 2c1 .5 2 2 2 5" />
                        </svg>
                        Pay
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={handleGoBack}
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>Pay ${bookingDetails.price}</>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </>
        ) : (
          <Card className="text-center">
            <CardContent className="pt-10 pb-10 flex flex-col items-center">
              <div className="rounded-full bg-green-100 p-3 mb-4">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
              <p className="text-muted-foreground mb-6">
                Your appointment has been confirmed for {bookingDetails.date} at{" "}
                {bookingDetails.time} with {bookingDetails.barber}
              </p>
              <div className="bg-gray-50 p-4 rounded-lg w-full max-w-xs mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Service:</span>
                  <span className="font-medium">{bookingDetails.service}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Payment method:</span>
                  <span className="font-medium capitalize">
                    {paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total paid:</span>
                  <span className="font-bold">${bookingDetails.price}</span>
                </div>
              </div>
              <div className="space-y-4 w-full max-w-xs">
                <Button className="w-full" onClick={() => navigate("/profile")}>
                  View My Appointments
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/")}
                >
                  Return to Home
                </Button>
                <p className="text-sm text-muted-foreground mt-4">
                  A confirmation email has been sent to your registered email
                  address.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
