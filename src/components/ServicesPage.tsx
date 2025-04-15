import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Scissors,
  Clock,
  DollarSign,
  ChevronRight,
  Calendar,
  User,
  UserPlus,
  Menu,
} from "lucide-react";

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  image: string;
  popular?: boolean;
  gender: "male" | "female" | "unisex";
}

const ServicesPage = () => {
  const [activeTab, setActiveTab] = useState("all");

  // Get service ID from URL if present
  const urlParams = new URLSearchParams(window.location.search);
  const serviceId = urlParams.get("service");

  const services: Service[] = [
    // Male Services
    {
      id: "m1",
      name: "Classic Haircut",
      description: "Traditional haircut with clippers and scissors",
      price: 25,
      duration: "30 min",
      image:
        "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80",
      popular: true,
      gender: "male",
    },
    {
      id: "m2",
      name: "Beard Trim",
      description: "Precise beard shaping and trimming",
      price: 15,
      duration: "15 min",
      image:
        "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?w=600&q=80",
      gender: "male",
    },
    {
      id: "m3",
      name: "Haircut & Beard Combo",
      description: "Complete haircut and beard grooming service",
      price: 35,
      duration: "45 min",
      image:
        "https://images.unsplash.com/photo-1493256338651-d82f7acb2b38?w=600&q=80",
      popular: true,
      gender: "male",
    },
    {
      id: "m4",
      name: "Hot Towel Shave",
      description: "Traditional straight razor shave with hot towel treatment",
      price: 30,
      duration: "30 min",
      image:
        "https://images.unsplash.com/photo-1553521306-9387d3778c6d?w=600&q=80",
      gender: "male",
    },
    {
      id: "m5",
      name: "Head Shave",
      description: "Complete head shave with razor finish",
      price: 25,
      duration: "25 min",
      image:
        "https://images.unsplash.com/photo-1519019121902-558825f38300?w=600&q=80",
      gender: "male",
    },
    {
      id: "m6",
      name: "Kids Haircut (Boys)",
      description: "Haircut for boys under 12",
      price: 20,
      duration: "20 min",
      image:
        "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80",
      gender: "male",
    },

    // Female Services
    {
      id: "f1",
      name: "Women's Haircut",
      description: "Haircut and style for all hair lengths",
      price: 35,
      duration: "45 min",
      image:
        "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600&q=80",
      popular: true,
      gender: "female",
    },
    {
      id: "f2",
      name: "Blow Dry & Style",
      description: "Professional blow dry with styling",
      price: 30,
      duration: "30 min",
      image:
        "https://images.unsplash.com/photo-1522336572468-97b06e8ef143?w=600&q=80",
      gender: "female",
    },
    {
      id: "f3",
      name: "Hair Coloring",
      description: "Full hair coloring service",
      price: 65,
      duration: "90 min",
      image:
        "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&q=80",
      gender: "female",
    },
    {
      id: "f4",
      name: "Highlights",
      description: "Partial or full highlights",
      price: 75,
      duration: "120 min",
      image:
        "https://images.unsplash.com/photo-1470259078422-826894b933aa?w=600&q=80",
      gender: "female",
    },
    {
      id: "f5",
      name: "Kids Haircut (Girls)",
      description: "Haircut for girls under 12",
      price: 25,
      duration: "30 min",
      image:
        "https://images.unsplash.com/photo-1499557354967-2b2d8910bcca?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80",
      gender: "female",
    },
    {
      id: "f6",
      name: "Updo/Special Occasion",
      description: "Formal styling for special events",
      price: 55,
      duration: "60 min",
      image:
        "https://images.unsplash.com/photo-1522336270004-e8f6fa383ead?w=600&q=80",
      popular: true,
      gender: "female",
    },

    // Unisex Services
    {
      id: "u1",
      name: "Deep Conditioning Treatment",
      description: "Intensive hair treatment for damaged hair",
      price: 25,
      duration: "20 min",
      image:
        "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=600&q=80",
      gender: "unisex",
    },
    {
      id: "u2",
      name: "Scalp Treatment",
      description: "Therapeutic treatment for scalp health",
      price: 30,
      duration: "30 min",
      image:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&q=80",
      gender: "unisex",
    },
    {
      id: "u3",
      name: "Hair & Scalp Analysis",
      description: "Professional analysis with personalized recommendations",
      price: 20,
      duration: "15 min",
      image:
        "https://images.unsplash.com/photo-1614609819116-eee9c271a928?w=600&q=80",
      gender: "unisex",
    },
  ];

  const filteredServices = services.filter((service) => {
    if (activeTab === "all") return true;
    if (activeTab === "male") return service.gender === "male";
    if (activeTab === "female") return service.gender === "female";
    if (activeTab === "unisex") return service.gender === "unisex";
    return true;
  });

  const popularServices = services.filter((service) => service.popular);

  // Scroll to service if ID is provided
  useEffect(() => {
    if (serviceId) {
      // Find the service
      const service = services.find((s) => s.id === serviceId);
      if (service) {
        // Set the appropriate tab
        setActiveTab(
          service.gender === "male"
            ? "male"
            : service.gender === "female"
              ? "female"
              : service.gender === "unisex"
                ? "unisex"
                : "all",
        );

        // Scroll to the service after a short delay to allow rendering
        setTimeout(() => {
          const element = document.getElementById(`service-${serviceId}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            // Add a highlight effect
            element.classList.add("ring-2", "ring-blue-500", "ring-opacity-50");
            setTimeout(() => {
              element.classList.remove(
                "ring-2",
                "ring-blue-500",
                "ring-opacity-50",
              );
            }, 2000);
          }
        }, 500);
      }
    }
  }, [serviceId, services]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Top navigation */}
      <div className="bg-white border-b border-gray-200 py-4 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-xl font-bold text-blue-600">
              SmartBarber
            </Link>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex space-x-4">
                <Link
                  to="/"
                  className="text-sm text-gray-600 hover:text-blue-600"
                >
                  Home
                </Link>
                <Link
                  to="/booking"
                  className="text-sm text-gray-600 hover:text-blue-600"
                >
                  Book Appointment
                </Link>
                <Link
                  to="/ai-recommendation"
                  className="text-sm text-gray-600 hover:text-blue-600"
                >
                  Style Finder
                </Link>
                <Link
                  to="/chatbot"
                  className="text-sm text-gray-600 hover:text-blue-600"
                >
                  Chat
                </Link>
              </div>
              <Button size="sm" asChild>
                <Link to="/booking">Book Now</Link>
              </Button>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8">
        {/* Hero section */}
        <div className="text-center space-y-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold">Our Services</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We offer a wide range of professional hair and grooming services for
            men and women. Our skilled stylists are trained to give you the
            perfect look.
          </p>
        </div>

        {/* Popular services section */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Popular Services</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/booking" className="flex items-center gap-1">
                Book Now <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {popularServices.map((service) => (
              <Card
                key={service.id}
                className="overflow-hidden group hover:shadow-md transition-all"
              >
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80";
                    }}
                  />
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <Badge
                      variant={
                        service.gender === "male"
                          ? "default"
                          : service.gender === "female"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {service.gender === "unisex"
                        ? "All"
                        : service.gender === "male"
                          ? "Men"
                          : "Women"}
                    </Badge>
                  </div>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{service.duration}</span>
                    </div>
                    <div className="font-medium text-lg flex items-center">
                      <DollarSign className="h-4 w-4" />
                      {service.price}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" asChild>
                    <Link to={`/booking?service=${service.id}`}>
                      Book This Service
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        {/* All services section */}
        <section className="pt-8">
          <h2 className="text-2xl font-semibold mb-6">All Services</h2>

          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="male" className="flex items-center gap-1">
                <User className="h-4 w-4" />
                Men
              </TabsTrigger>
              <TabsTrigger value="female" className="flex items-center gap-1">
                <UserPlus className="h-4 w-4" />
                Women
              </TabsTrigger>
              <TabsTrigger value="unisex">Unisex</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {filteredServices.map((service) => (
                <Card
                  key={service.id}
                  id={`service-${service.id}`}
                  className="overflow-hidden transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/4 aspect-video md:aspect-square overflow-hidden">
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80";
                        }}
                      />
                    </div>
                    <div className="flex-1 p-4 md:p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-semibold">
                            {service.name}
                          </h3>
                          <Badge
                            variant={
                              service.gender === "male"
                                ? "default"
                                : service.gender === "female"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {service.gender === "unisex"
                              ? "All"
                              : service.gender === "male"
                                ? "Men"
                                : "Women"}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-4">
                          {service.description}
                        </p>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{service.duration}</span>
                          </div>
                          <div className="flex items-center gap-1 font-medium">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span>{service.price}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button asChild>
                          <Link to={`/booking?service=${service.id}`}>
                            Book Appointment
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </section>

        {/* Call to action */}
        <section className="bg-blue-50 rounded-lg p-8 text-center mt-12">
          <h2 className="text-2xl font-bold mb-4">Ready to look your best?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Our team of professional stylists is ready to help you achieve the
            perfect look. Book your appointment today and experience the
            SmartBarber difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/booking" className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Book Appointment
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/ai-recommendation" className="flex items-center gap-2">
                <Scissors className="h-5 w-5" />
                Try AI Style Finder
              </Link>
            </Button>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">SmartBarber</h3>
              <p className="text-gray-400">
                Professional hair styling and grooming services for everyone.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-400 hover:text-white">
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/services"
                    className="text-gray-400 hover:text-white"
                  >
                    Services
                  </Link>
                </li>
                <li>
                  <Link
                    to="/booking"
                    className="text-gray-400 hover:text-white"
                  >
                    Book Appointment
                  </Link>
                </li>
                <li>
                  <Link
                    to="/ai-recommendation"
                    className="text-gray-400 hover:text-white"
                  >
                    AI Style Finder
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact Us</h4>
              <address className="text-gray-400 not-italic">
                123 Styling Street
                <br />
                Hairtown, ST 12345
                <br />
                (555) 123-4567
                <br />
                info@smartbarber.com
              </address>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>
              © {new Date().getFullYear()} SmartBarber. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ServicesPage;
