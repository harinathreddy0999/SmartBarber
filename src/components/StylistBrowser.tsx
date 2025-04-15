import React, { useState } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Calendar as CalendarIcon,
  Clock,
  Star,
  Scissors,
  MapPin,
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface Stylist {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  specialties: string[];
  bio: string;
  experience: string;
  location: string;
  gallery: string[];
  availability: {
    date: Date;
    slots: string[];
  }[];
}

const StylistBrowser = () => {
  const [selectedStylist, setSelectedStylist] = useState<Stylist | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [selectedTab, setSelectedTab] = useState("all");

  // Mock data for stylists
  const stylists: Stylist[] = [
    {
      id: "1",
      name: "James Wilson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=james",
      rating: 4.8,
      specialties: ["Fades", "Classic Cuts", "Beard Trimming"],
      bio: "Master barber with over 10 years of experience specializing in precision fades and classic cuts.",
      experience: "10+ years",
      location: "Downtown",
      gallery: [
        "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&q=80",
        "https://images.unsplash.com/photo-1521498542256-5aeb47ba2b36?w=500&q=80",
        "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=500&q=80",
      ],
      availability: [
        {
          date: new Date(),
          slots: ["10:00 AM", "11:30 AM", "2:00 PM", "3:30 PM"],
        },
      ],
    },
    {
      id: "2",
      name: "Maria Rodriguez",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria",
      rating: 4.9,
      specialties: ["Modern Styles", "Textured Cuts", "Hair Design"],
      bio: "Award-winning stylist known for creative modern cuts and attention to detail.",
      experience: "8 years",
      location: "Midtown",
      gallery: [
        "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=500&q=80",
        "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=500&q=80",
        "https://images.unsplash.com/photo-1562004760-aceed7bb0fe3?w=500&q=80",
      ],
      availability: [
        {
          date: new Date(),
          slots: ["9:00 AM", "12:30 PM", "4:00 PM"],
        },
      ],
    },
    {
      id: "3",
      name: "David Chen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=david",
      rating: 4.7,
      specialties: ["Asian Hair", "Pompadours", "Skin Fades"],
      bio: "Specializes in Asian hair textures and contemporary styles with a traditional touch.",
      experience: "6 years",
      location: "Eastside",
      gallery: [
        "https://images.unsplash.com/photo-1593702288056-f17f101a2d3a?w=500&q=80",
        "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=500&q=80",
        "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500&q=80",
      ],
      availability: [
        {
          date: new Date(),
          slots: ["11:00 AM", "1:30 PM", "5:00 PM"],
        },
      ],
    },
  ];

  // Filter stylists based on search query and selected tab
  const filteredStylists = stylists.filter((stylist) => {
    const matchesSearch =
      stylist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stylist.specialties.some((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    if (selectedTab === "all") return matchesSearch;
    return (
      matchesSearch &&
      stylist.specialties.some((s) =>
        s.toLowerCase().includes(selectedTab.toLowerCase()),
      )
    );
  });

  // Handle booking with selected stylist
  const handleBookAppointment = (slot: string) => {
    // Navigate to the booking flow with stylist information
    window.location.href = `/booking?stylist=${selectedStylist?.id}&date=${selectedDate?.toISOString()}&slot=${slot}`;
  };

  return (
    <div className="w-full h-full bg-background p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Our Stylists
        </h1>
        <p className="text-muted-foreground">
          Browse our talented team of barbers and stylists
        </p>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or specialty..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Tabs
          defaultValue="all"
          className="w-full md:w-auto"
          onValueChange={setSelectedTab}
        >
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="fade">Fades</TabsTrigger>
            <TabsTrigger value="beard">Beard</TabsTrigger>
            <TabsTrigger value="modern">Modern</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Stylist cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredStylists.map((stylist) => (
          <Card
            key={stylist.id}
            className="overflow-hidden hover:shadow-md transition-shadow"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-primary">
                  <AvatarImage src={stylist.avatar} alt={stylist.name} />
                  <AvatarFallback>
                    {stylist.name.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{stylist.name}</CardTitle>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
                    <span>{stylist.rating}</span>
                    <span className="mx-2">•</span>
                    <span>{stylist.experience}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex flex-wrap gap-2 mb-3">
                {stylist.specialties.map((specialty, index) => (
                  <Badge key={index} variant="secondary">
                    {specialty}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {stylist.bio}
              </p>
            </CardContent>
            <CardFooter className="pt-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    className="w-full"
                    onClick={() => setSelectedStylist(stylist)}
                  >
                    View Profile
                  </Button>
                </DialogTrigger>
              </Dialog>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {filteredStylists.length === 0 && (
        <div className="text-center py-12">
          <Scissors className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No stylists found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      )}

      {/* Stylist profile dialog */}
      {selectedStylist && (
        <Dialog
          open={!!selectedStylist}
          onOpenChange={(open) => !open && setSelectedStylist(null)}
        >
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-3">
                <Avatar>
                  <AvatarImage
                    src={selectedStylist.avatar}
                    alt={selectedStylist.name}
                  />
                  <AvatarFallback>
                    {selectedStylist.name.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                {selectedStylist.name}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-4 mt-2">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
                  <span>{selectedStylist.rating}</span>
                </div>
                <div className="flex items-center">
                  <Scissors className="h-4 w-4 mr-1" />
                  <span>{selectedStylist.experience}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{selectedStylist.location}</span>
                </div>
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="about" className="mt-6">
              <TabsList className="w-full">
                <TabsTrigger value="about" className="flex-1">
                  About
                </TabsTrigger>
                <TabsTrigger value="gallery" className="flex-1">
                  Gallery
                </TabsTrigger>
                <TabsTrigger value="book" className="flex-1">
                  Book
                </TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Bio</h4>
                    <p className="text-muted-foreground">
                      {selectedStylist.bio}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Specialties</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedStylist.specialties.map((specialty, index) => (
                        <Badge key={index}>{specialty}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Location</h4>
                    <p className="text-muted-foreground">
                      {selectedStylist.location} Branch
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="gallery" className="mt-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedStylist.gallery.map((image, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded-md overflow-hidden"
                    >
                      <img
                        src={image}
                        alt={`${selectedStylist.name}'s work ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="book" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-4">Select a Date</h4>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                    />
                  </div>

                  <div>
                    <h4 className="font-medium mb-4">Available Time Slots</h4>
                    {selectedDate ? (
                      <div className="grid grid-cols-2 gap-3">
                        {selectedStylist.availability
                          .find(
                            (a) =>
                              a.date.toDateString() ===
                              selectedDate.toDateString(),
                          )
                          ?.slots.map((slot, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              className="justify-start"
                              onClick={() => handleBookAppointment(slot)}
                            >
                              <Clock className="mr-2 h-4 w-4" />
                              {slot}
                            </Button>
                          )) || (
                          <p className="text-muted-foreground col-span-2">
                            No available slots for this date
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        Please select a date to see available slots
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                onClick={() => setSelectedStylist(null)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default StylistBrowser;
