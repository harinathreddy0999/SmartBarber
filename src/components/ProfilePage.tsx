import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { authApi, bookingApi, stylesApi } from "@/services/apiService";
import {
  User,
  Calendar,
  Clock,
  Scissors,
  LogOut,
  Settings,
  Heart,
  History,
  Edit,
  Check,
  X,
  Trash2,
  Camera,
  Loader2,
} from "lucide-react";

interface Appointment {
  id: string;
  date: string;
  time: string;
  barber: string;
  service: string;
  price: number;
  status: "upcoming" | "completed" | "cancelled";
}

interface SavedStyle {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  tags: string[];
  date: string;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  memberSince: string;
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("appointments");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // User profile state
  const [profile, setProfile] = useState<UserProfile>({
    name: user?.name || "Guest User",
    email: user?.email || "guest@example.com",
    phone: "(555) 123-4567",
    avatar:
      user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=guest",
    memberSince: "January 2023",
  });
  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);

  // Appointments and saved styles state
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [savedStyles, setSavedStyles] = useState<SavedStyle[]>([]);

  // Check authentication and redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Load data from API on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Load user profile
        const profileResponse = await authApi.getProfile();
        if (profileResponse.data) {
          const userData = profileResponse.data;
          const userProfile = {
            name: userData.name,
            email: userData.email,
            phone: userData.phone || "(555) 123-4567",
            avatar: userData.avatar,
            memberSince: new Date(
              userData.createdAt || Date.now(),
            ).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
          };
          setProfile(userProfile);
          setEditedProfile(userProfile);
        }

        // Load appointments
        const bookingsResponse = await bookingApi.getUserBookings();
        if (bookingsResponse.data) {
          // Transform API data to match our component's expected format
          const formattedBookings = bookingsResponse.data.map(
            (booking: any) => ({
              id: booking.id,
              date: new Date(booking.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              }),
              time: booking.time,
              barber: booking.barber.name,
              service: booking.service.name,
              price: booking.service.price,
              status: booking.status,
            }),
          );
          setAppointments(formattedBookings);
        }

        // Load saved styles
        const stylesResponse = await stylesApi.getUserStyles();
        if (stylesResponse.data) {
          // Transform API data to match our component's expected format
          const formattedStyles = stylesResponse.data.map((style: any) => ({
            id: style.id,
            name: style.name,
            description: style.description,
            imageUrl: style.imageUrl,
            tags: style.tags,
            date: new Date(style.createdAt || Date.now()).toLocaleDateString(
              "en-US",
              { month: "long", day: "numeric", year: "numeric" },
            ),
          }));
          setSavedStyles(formattedStyles);
        }
      } catch (error) {
        console.error("Error loading data from API:", error);
        toast({
          title: "Error",
          description:
            "Failed to load your profile data. Please try again later.",
          variant: "destructive",
        });

        // Fallback to localStorage if API fails
        try {
          // Load user profile
          const storedProfile = localStorage.getItem("userProfile");
          if (storedProfile) {
            const parsedProfile = JSON.parse(storedProfile);
            setProfile(parsedProfile);
            setEditedProfile(parsedProfile);
          }

          // Load appointments
          const storedAppointments = localStorage.getItem("bookings");
          if (storedAppointments) {
            setAppointments(JSON.parse(storedAppointments));
          }

          // Load saved styles
          const storedStyles = localStorage.getItem("savedStyles");
          if (storedStyles) {
            setSavedStyles(JSON.parse(storedStyles));
          }
        } catch (localError) {
          console.error("Error loading data from localStorage:", localError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, toast]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // Update profile via API
      const response = await authApi.updateProfile({
        name: editedProfile.name,
        email: editedProfile.email,
        phone: editedProfile.phone,
        avatar: editedProfile.avatar,
      });

      if (response.data) {
        setProfile(editedProfile);
        setIsEditing(false);
        toast({
          title: "Success",
          description: "Your profile has been updated successfully.",
        });
      } else if (response.error) {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update your profile. Please try again later.",
        variant: "destructive",
      });

      // Fallback to localStorage if API fails
      setProfile(editedProfile);
      localStorage.setItem("userProfile", JSON.stringify(editedProfile));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleDeleteAppointment = async (id: string) => {
    setIsDeleting(id);
    try {
      // Cancel booking via API
      const response = await bookingApi.cancelBooking(id);

      if (response.error) {
        throw new Error(response.error);
      }

      const updatedAppointments = appointments.filter((app) => app.id !== id);
      setAppointments(updatedAppointments);
      toast({
        title: "Success",
        description: "Your appointment has been cancelled successfully.",
      });
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast({
        title: "Error",
        description:
          "Failed to cancel your appointment. Please try again later.",
        variant: "destructive",
      });

      // Fallback to localStorage if API fails
      const updatedAppointments = appointments.filter((app) => app.id !== id);
      setAppointments(updatedAppointments);
      localStorage.setItem("bookings", JSON.stringify(updatedAppointments));
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDeleteSavedStyle = async (id: string) => {
    setIsDeleting(id);
    try {
      // Delete style via API
      const response = await stylesApi.deleteStyle(id);

      if (response.error) {
        throw new Error(response.error);
      }

      const updatedStyles = savedStyles.filter((style) => style.id !== id);
      setSavedStyles(updatedStyles);
      toast({
        title: "Success",
        description: "Your saved style has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting style:", error);
      toast({
        title: "Error",
        description:
          "Failed to delete your saved style. Please try again later.",
        variant: "destructive",
      });

      // Fallback to localStorage if API fails
      const updatedStyles = savedStyles.filter((style) => style.id !== id);
      setSavedStyles(updatedStyles);
      localStorage.setItem("savedStyles", JSON.stringify(updatedStyles));
    } finally {
      setIsDeleting(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditedProfile({
          ...editedProfile,
          avatar: event.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium">Loading your profile...</p>
          </div>
        </div>
      )}
      {/* Top navigation */}
      <div className="bg-white border-b border-gray-200 py-4 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={() => navigate("/")}>
              <span className="text-xl font-bold text-blue-600">
                SmartBarber
              </span>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        {/* User profile header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24 border-2 border-blue-100">
                  <AvatarImage
                    src={isEditing ? editedProfile.avatar : profile.avatar}
                    alt={profile.name}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback";
                    }}
                  />
                  <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {isEditing && (
                  <div className="absolute bottom-0 right-0">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 rounded-full bg-background"
                      onClick={() =>
                        document.getElementById("avatar-upload")?.click()
                      }
                    >
                      <Camera className="h-4 w-4" />
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex-1 text-center sm:text-left">
                {!isEditing ? (
                  <>
                    <h1 className="text-2xl font-bold">{profile.name}</h1>
                    <p className="text-muted-foreground">{profile.email}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Member since {profile.memberSince}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit className="h-4 w-4" />
                        Edit Profile
                      </Button>
                      <Button
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => navigate("/booking")}
                      >
                        <Calendar className="h-4 w-4" />
                        Book Appointment
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4 w-full max-w-md">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={editedProfile.name}
                        onChange={(e) =>
                          setEditedProfile({
                            ...editedProfile,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editedProfile.email}
                        onChange={(e) =>
                          setEditedProfile({
                            ...editedProfile,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={editedProfile.phone}
                        onChange={(e) =>
                          setEditedProfile({
                            ...editedProfile,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="default"
                        className="flex-1"
                        disabled={isSaving}
                        onClick={handleSaveProfile}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Check className="mr-2 h-4 w-4" /> Save
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={handleCancelEdit}
                      >
                        <X className="mr-2 h-4 w-4" /> Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different sections */}
        <Tabs
          defaultValue="appointments"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger
              value="appointments"
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Appointments</span>
              <span className="sm:hidden">Appts</span>
            </TabsTrigger>
            <TabsTrigger
              value="saved-styles"
              className="flex items-center gap-2"
            >
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Saved Styles</span>
              <span className="sm:hidden">Styles</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
              <span className="sm:hidden">History</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="mt-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Your Appointments</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/booking")}
              >
                Book New
              </Button>
            </div>

            {appointments.filter((a) => a.status === "upcoming").length > 0 ? (
              <div className="space-y-4">
                {appointments
                  .filter((a) => a.status === "upcoming")
                  .map((appointment) => (
                    <Card key={appointment.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="bg-blue-50">
                                Upcoming
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {appointment.date}
                              </span>
                            </div>
                            <h3 className="font-medium">
                              {appointment.service}
                            </h3>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              {appointment.time}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <User className="h-4 w-4" />
                              {appointment.barber}
                            </div>
                            <div className="mt-2 font-medium">
                              ${appointment.price}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                navigate(`/booking?edit=${appointment.id}`)
                              }
                            >
                              Reschedule
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={isDeleting === appointment.id}
                              onClick={() =>
                                handleDeleteAppointment(appointment.id)
                              }
                            >
                              {isDeleting === appointment.id ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Cancelling...
                                </>
                              ) : (
                                "Cancel"
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <Card className="bg-gray-50">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No upcoming appointments
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    You don't have any appointments scheduled. Book one now!
                  </p>
                  <Button onClick={() => navigate("/booking")}>
                    Book Appointment
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="saved-styles" className="mt-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Saved Hairstyles</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/ai-recommendation")}
              >
                Find New Styles
              </Button>
            </div>

            {savedStyles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedStyles.map((style) => (
                  <Card key={style.id} className="overflow-hidden">
                    <div className="aspect-video w-full relative">
                      <img
                        src={style.imageUrl}
                        alt={style.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&q=80";
                        }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                        <h3 className="font-medium text-white">{style.name}</h3>
                        <p className="text-xs text-white/80">
                          Saved on {style.date}
                        </p>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        {style.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {style.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => navigate(`/booking?style=${style.id}`)}
                        >
                          <Scissors className="h-4 w-4" />
                          Book This Style
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          disabled={isDeleting === style.id}
                          onClick={() => handleDeleteSavedStyle(style.id)}
                        >
                          {isDeleting === style.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-gray-50">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                  <Heart className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No saved styles</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't saved any hairstyles yet. Try our AI style
                    finder!
                  </p>
                  <Button onClick={() => navigate("/ai-recommendation")}>
                    Find Your Style
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-6 space-y-4">
            <h2 className="text-xl font-semibold">Appointment History</h2>

            {appointments.filter((a) => a.status === "completed").length > 0 ? (
              <div className="space-y-4">
                {appointments
                  .filter((a) => a.status === "completed")
                  .map((appointment) => (
                    <Card key={appointment.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="bg-gray-100">
                                Completed
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {appointment.date}
                              </span>
                            </div>
                            <h3 className="font-medium">
                              {appointment.service}
                            </h3>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <User className="h-4 w-4" />
                              {appointment.barber}
                            </div>
                            <div className="mt-2 font-medium">
                              ${appointment.price}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                navigate(`/booking?rebook=${appointment.id}`)
                              }
                            >
                              Book Again
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <Card className="bg-gray-50">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                  <History className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No appointment history
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    You don't have any past appointments with us yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 md:hidden z-50">
        <div className="flex justify-around">
          <Button
            variant="ghost"
            className="flex flex-col items-center"
            onClick={() => navigate("/")}
          >
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center"
            onClick={() => navigate("/booking")}
          >
            <Calendar className="h-5 w-5" />
            <span className="text-xs mt-1">Book</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center"
            onClick={() => navigate("/ai-recommendation")}
          >
            <Scissors className="h-5 w-5" />
            <span className="text-xs mt-1">Styles</span>
          </Button>
        </div>
      </nav>
    </div>
  );
};

export default ProfilePage;
