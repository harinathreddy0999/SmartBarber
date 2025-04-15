import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Send, User, Bot, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface ChatbotInterfaceProps {
  onBookService?: (service: string) => void;
}

const ChatbotInterface: React.FC<ChatbotInterfaceProps> = ({
  onBookService = (service: string) => {
    // Navigate to booking page when a service is selected
    if (service === "special") {
      window.location.href = "/services";
    } else {
      window.location.href = `/booking?service=${service}`;
    }
  },
}) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content:
        "Hi there! I'm your SmartBarber assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponses: Record<string, string> = {
        // Services
        haircut:
          "Our haircut services range from $25-45 depending on length and style. We offer classic cuts, fades, undercuts, and trendy styles. Would you like to book an appointment?",
        beard:
          "We offer beard services including: trimming ($15), full beard styling ($20), beard coloring ($30), and hot towel beard treatment ($25). Each service includes shaping and conditioning.",
        color:
          "We offer hair coloring services starting at $50. This includes consultation, application, and styling. We use premium, long-lasting colors that are gentle on your hair.",
        shampoo:
          "We offer premium shampoo and conditioning treatments starting at $15. Our deep conditioning treatment ($25) is perfect for dry or damaged hair.",
        kids: "Kids haircuts (ages 12 and under) are $18. We have special chairs and entertainment to make their experience enjoyable.",
        senior:
          "We offer senior discounts (65+) on all our services - 15% off the regular price.",

        // Booking
        appointment:
          "I can help you book an appointment. We offer online booking or you can call us at (555) 123-4567. What service are you interested in?",
        book: "Booking is easy! You can use our online system to select your stylist, service, and preferred time. Would you like me to guide you through the booking process?",
        cancel:
          "Need to cancel or reschedule? No problem! You can modify your appointment up to 24 hours in advance through your account or by calling us at (555) 123-4567.",

        // Shop information
        hours:
          "We're open Monday-Friday 9am-7pm, Saturday 10am-5pm, and closed on Sundays. We offer extended hours (until 9pm) on Thursdays for late appointments.",
        location:
          "We're located at 123 Main Street, Downtown, with convenient parking behind the building. We're also accessible by public transit - the Main Street bus stop is right in front.",
        contact:
          "You can reach us at (555) 123-4567 or email us at info@smartbarber.com. We typically respond to emails within 2 business hours.",
        parking:
          "We offer free customer parking behind our building. There's also metered street parking and a public garage one block away.",

        // Staff
        stylist:
          "We have 5 professional stylists, each with unique specialties including classic cuts, modern styles, coloring, and beard grooming. Would you like to see their profiles and book with a specific stylist?",
        experience:
          "Our stylists have between 3-15 years of professional experience. All are certified and regularly attend training to stay current with the latest techniques and trends.",

        // Policies
        payment:
          "We accept all major credit cards, cash, and mobile payments (Apple Pay, Google Pay). We also offer gift cards that can be purchased in-shop or online.",
        tip: "Tipping is appreciated but never required. If you enjoyed your service, a typical tip is 15-20%. Tips can be added when you pay by card or mobile payment.",
        covid:
          "We maintain strict hygiene protocols. All tools are sanitized between clients, stations are regularly disinfected, and our ventilation system exceeds requirements.",
        wait: "Walk-ins are welcome, but wait times vary depending on stylist availability. For guaranteed service, we recommend booking an appointment.",

        // Products
        product:
          "We sell professional hair care products from brands like Aveda, Redken, and our own SmartBarber line. All products used during your service are available for purchase.",
        price:
          "Our service prices range from $15 for a basic beard trim to $120+ for full color services. We offer package deals and loyalty discounts for regular clients.",
        // Special offers
        special:
          "We currently have two special offers: 20% off your first haircut and complimentary beard trim for new clients, and our VIP Experience package which includes a haircut, hot towel shave, facial treatment & complimentary drink for $65 (regularly $85).",
        discount:
          "We offer a 15% senior discount (65+) on all services. We also have special package deals and seasonal promotions throughout the year.",
        offer:
          "Check out our First Visit Special with 20% off your first haircut and our VIP Experience package that includes multiple premium services at a discounted rate.",
        deal: "Our current deals include 20% off for first-time clients and discounted package services. Ask about our loyalty program for regular clients!",
      };

      // Simple keyword matching with fallback response
      let responseText =
        "I'm not sure I understand. You can ask about our services (haircuts, beard styling, coloring), prices, hours, location, stylists, or booking an appointment. How can I help you today?";

      const lowercaseInput = userMessage.content.toLowerCase();
      for (const [keyword, response] of Object.entries(botResponses)) {
        if (lowercaseInput.includes(keyword)) {
          responseText = response;
          break;
        }
      }

      const botMessage: Message = {
        id: Date.now().toString(),
        content: responseText,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        content:
          "Hi there! I'm your SmartBarber assistant. How can I help you today?",
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
  };

  const suggestedQuestions = [
    "How much is a haircut?",
    "What are your hours?",
    "Where are you located?",
    "Do you offer beard trimming?",
    "How do I book an appointment?",
    "Tell me about your stylists",
    "Do you have any special offers?",
    "What payment methods do you accept?",
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-background">
      <div className="flex items-center mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Chat with SmartBarber</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Chat window */}
        <Card className="md:col-span-2 h-[70vh] flex flex-col">
          <CardHeader className="border-b bg-slate-50 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src="https://api.dicebear.com/7.x/bottts/svg?seed=barber" />
                  <AvatarFallback>
                    <Bot size={18} />
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-lg">SmartBarber Assistant</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={clearChat}>
                <RefreshCw size={16} className="mr-2" /> New Chat
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex max-w-[80%] ${message.sender === "user" ? "flex-row-reverse" : ""}`}
                    >
                      <Avatar className="h-8 w-8 mt-1">
                        {message.sender === "user" ? (
                          <>
                            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </>
                        ) : (
                          <>
                            <AvatarImage src="https://api.dicebear.com/7.x/bottts/svg?seed=barber" />
                            <AvatarFallback>
                              <Bot className="h-4 w-4" />
                            </AvatarFallback>
                          </>
                        )}
                      </Avatar>
                      <div
                        className={`mx-2 p-3 rounded-lg ${message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs opacity-70">
                            {message.sender === "bot" ? "Assistant" : "You"} •{" "}
                            {message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                        {message.sender === "bot" && (
                          <div className="mt-2 space-y-2">
                            {message.content.includes(
                              "book an appointment",
                            ) && (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => onBookService("haircut")}
                              >
                                Book Appointment
                              </Button>
                            )}
                            {message.content.includes("special offers") && (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => onBookService("special")}
                              >
                                View Special Offers
                              </Button>
                            )}
                            {message.content.includes("haircut services") && (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => onBookService("haircut")}
                              >
                                Book Haircut
                              </Button>
                            )}
                            {message.content.includes("beard services") && (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => onBookService("beard")}
                              >
                                Book Beard Service
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex max-w-[80%]">
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarImage src="https://api.dicebear.com/7.x/bottts/svg?seed=barber" />
                        <AvatarFallback>
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="mx-2 p-3 rounded-lg bg-muted">
                        <div className="flex space-x-1">
                          <div
                            className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          ></div>
                          <div
                            className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          ></div>
                          <div
                            className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>

          <CardFooter className="border-t p-4">
            <div className="flex w-full items-center space-x-2">
              <Input
                placeholder="Type your message here..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
              >
                <Send size={18} />
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Suggested questions */}
        <Card className="h-fit">
          <CardContent className="p-4">
            <h3 className="font-medium mb-3">Suggested Questions</h3>
            <div className="space-y-2">
              {suggestedQuestions.map((question, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-slate-100 block text-left p-2 w-full"
                  onClick={() => {
                    setInputValue(question);
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                >
                  {question}
                </Badge>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-border">
              <h3 className="font-medium mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="default" className="w-full" asChild>
                  <Link to="/booking">Book Appointment</Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/services">View Services</Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/ai-recommendation">Try AI Style Finder</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatbotInterface;
