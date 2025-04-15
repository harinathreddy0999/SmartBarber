import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import {
  Upload,
  Camera,
  Check,
  X,
  Share2,
  Calendar,
  Save,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { analyzePhotoForHairstyles } from "@/services/aiService";
import { HairstyleRecommendation } from "@/types/hairstyle";

interface AIRecommendationProps {
  userPhoto?: string;
  onBookAppointment?: (style: HairstyleRecommendation) => void;
}

const AIRecommendation = ({
  userPhoto = "",
  onBookAppointment,
}: AIRecommendationProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upload");
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(
    userPhoto || null,
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<
    HairstyleRecommendation[]
  >([]);
  const [selectedStyle, setSelectedStyle] =
    useState<HairstyleRecommendation | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);

  // Mock function to simulate photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedPhoto(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to access device camera using MediaDevices API
  const handleTakePhoto = async () => {
    try {
      // Check if the browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          title: "Camera Not Supported",
          description:
            "Your browser doesn't support camera access. Please try uploading a photo instead.",
          variant: "destructive",
        });
        return;
      }

      // Create video and canvas elements
      const video = document.createElement("video");
      const canvas = document.createElement("canvas");
      const container = document.createElement("div");
      const captureBtn = document.createElement("button");
      const closeBtn = document.createElement("button");

      // Style the camera UI
      container.style.position = "fixed";
      container.style.top = "0";
      container.style.left = "0";
      container.style.width = "100%";
      container.style.height = "100%";
      container.style.backgroundColor = "rgba(0,0,0,0.9)";
      container.style.zIndex = "9999";
      container.style.display = "flex";
      container.style.flexDirection = "column";
      container.style.alignItems = "center";
      container.style.justifyContent = "center";

      video.style.width = "100%";
      video.style.maxWidth = "400px";
      video.style.borderRadius = "8px";

      captureBtn.innerText = "Take Photo";
      captureBtn.style.padding = "10px 20px";
      captureBtn.style.margin = "20px";
      captureBtn.style.backgroundColor = "#2563eb";
      captureBtn.style.color = "white";
      captureBtn.style.border = "none";
      captureBtn.style.borderRadius = "4px";
      captureBtn.style.cursor = "pointer";

      closeBtn.innerText = "Cancel";
      closeBtn.style.padding = "10px 20px";
      closeBtn.style.backgroundColor = "#6b7280";
      closeBtn.style.color = "white";
      closeBtn.style.border = "none";
      closeBtn.style.borderRadius = "4px";
      closeBtn.style.cursor = "pointer";

      const buttonContainer = document.createElement("div");
      buttonContainer.style.display = "flex";
      buttonContainer.style.gap = "10px";
      buttonContainer.appendChild(captureBtn);
      buttonContainer.appendChild(closeBtn);

      container.appendChild(video);
      container.appendChild(buttonContainer);
      document.body.appendChild(container);

      // Get camera stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }, // Use front camera
        audio: false,
      });

      // Connect stream to video element
      video.srcObject = stream;
      video.play();

      // Set up canvas with video dimensions once metadata is loaded
      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      };

      // Handle capture button click
      captureBtn.onclick = () => {
        // Draw current video frame to canvas
        canvas
          .getContext("2d")
          ?.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas to data URL
        const photoDataUrl = canvas.toDataURL("image/jpeg");

        // Set the photo in state
        setUploadedPhoto(photoDataUrl);

        // Clean up
        cleanUp();
      };

      // Handle close button click
      closeBtn.onclick = cleanUp;

      // Clean up function
      function cleanUp() {
        // Stop all video tracks
        stream.getTracks().forEach((track) => track.stop());

        // Remove container from DOM
        document.body.removeChild(container);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera Access Error",
        description:
          "Could not access camera. Please check your permissions or try uploading a photo instead.",
        variant: "destructive",
      });
    }
  };

  // State for error handling
  const [error, setError] = useState<string | null>(null);

  // Import toast for notifications
  const { toast } = useToast();

  // Function to analyze photo and get real-time recommendations
  const analyzePhoto = async () => {
    if (!uploadedPhoto) {
      toast({
        title: "No Photo Selected",
        description: "Please upload or take a photo first.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Call the AI service to analyze the photo
      const aiRecommendations = await analyzePhotoForHairstyles(uploadedPhoto);

      // Update the recommendations state with the AI results
      setRecommendations(aiRecommendations);

      // Show success toast
      toast({
        title: "Analysis Complete",
        description:
          "We've analyzed your photo and found some great styles for you!",
        variant: "default",
      });

      // Switch to the recommendations tab
      if (aiRecommendations.length > 0) {
        setActiveTab("recommendations");
      } else {
        throw new Error(
          "No recommendations found. Please try a different photo.",
        );
      }
    } catch (err) {
      console.error("Error getting hairstyle recommendations:", err);

      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to analyze photo. Please try again.";

      setError(errorMessage);

      // Show error toast
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });

      // Fallback to mock data if there's an error
      const mockRecommendations = [
        {
          id: "1",
          name: "Classic Fade",
          description:
            "A timeless style with gradually faded sides and more length on top.",
          imageUrl:
            "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&q=80",
          suitabilityScore: 95,
          tags: ["short", "professional", "low-maintenance"],
          gender: "male",
          faceShape: "oval",
        },
        {
          id: "2",
          name: "Textured Crop",
          description: "Modern and stylish with textured top and clean sides.",
          imageUrl:
            "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&q=80",
          suitabilityScore: 90,
          tags: ["trendy", "medium-length", "textured"],
          gender: "male",
          faceShape: "oval",
        },
      ];

      // Show fallback toast
      toast({
        title: "Using Demo Data",
        description:
          "We're showing you sample hairstyles while we fix the issue.",
        variant: "default",
      });

      setRecommendations(mockRecommendations);
      setActiveTab("recommendations");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStyleSelect = (style: HairstyleRecommendation) => {
    setSelectedStyle(style);

    // Show selection toast
    toast({
      title: "Style Selected",
      description: `You've selected "${style.name}". You can now save, share, or book an appointment with this style.`,
      variant: "default",
    });
  };

  const handleSaveStyle = () => {
    if (selectedStyle) {
      try {
        // Get existing saved styles from localStorage
        const savedStylesStr = localStorage.getItem("savedStyles");
        const savedStyles = savedStylesStr ? JSON.parse(savedStylesStr) : [];

        // Check if style is already saved
        if (!savedStyles.some((style: any) => style.id === selectedStyle.id)) {
          // Add new style and save back to localStorage
          savedStyles.push(selectedStyle);
          localStorage.setItem("savedStyles", JSON.stringify(savedStyles));

          // Show success toast instead of alert
          toast({
            title: "Style Saved",
            description: `"${selectedStyle.name}" has been saved to your profile!`,
            variant: "default",
          });
        } else {
          // Show info toast instead of alert
          toast({
            title: "Already Saved",
            description: "This style is already saved to your profile.",
            variant: "default",
          });
        }
      } catch (error) {
        console.error("Error saving style:", error);

        // Show error toast instead of alert
        toast({
          title: "Save Failed",
          description: "There was an error saving this style.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "No Style Selected",
        description: "Please select a hairstyle first.",
        variant: "destructive",
      });
    }
  };

  const handleShareStyle = () => {
    if (!selectedStyle) {
      toast({
        title: "No Style Selected",
        description: "Please select a hairstyle to share.",
        variant: "destructive",
      });
      return;
    }

    setShowShareDialog(true);

    // Show info toast
    toast({
      title: "Sharing Options",
      description: "Choose how you'd like to share this hairstyle.",
      variant: "default",
    });
  };

  const handleBookAppointment = () => {
    if (selectedStyle) {
      if (onBookAppointment) {
        onBookAppointment(selectedStyle);

        // Show success toast
        toast({
          title: "Style Selected",
          description: `"${selectedStyle.name}" has been selected for your appointment.`,
          variant: "default",
        });
      } else {
        // Navigate to booking page with selected style information
        navigate("/booking", {
          state: {
            selectedStyle: selectedStyle.name,
            fromRecommendation: true,
          },
        });

        // Show info toast
        toast({
          title: "Proceeding to Booking",
          description: `You'll now be able to book an appointment for your "${selectedStyle.name}" hairstyle.`,
          variant: "default",
        });
      }
    } else {
      // Show warning toast if no style is selected
      toast({
        title: "No Style Selected",
        description: "Please select a hairstyle before booking an appointment.",
        variant: "destructive",
      });
    }
  };

  // Handle back button functionality
  const handleGoBack = () => {
    if (activeTab === "recommendations") {
      setActiveTab("upload");
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-background">
      <div className="flex items-center mb-4">
        <Button
          variant="ghost"
          size="sm"
          className="mr-2"
          onClick={handleGoBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-semibold">AI Hairstyle Recommendations</h1>
      </div>
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            AI Hairstyle Recommendations
          </CardTitle>
          <CardDescription className="text-center">
            Upload your photo or take one with your camera, and our AI will
            analyze your face shape, identify your gender, and recommend the
            perfect hairstyle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="upload"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="upload">Upload Photo</TabsTrigger>
              <TabsTrigger
                value="recommendations"
                disabled={!uploadedPhoto || isAnalyzing}
              >
                View Recommendations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6">
              <div className="flex flex-col items-center justify-center space-y-6">
                {uploadedPhoto ? (
                  <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-primary">
                    <img
                      src={uploadedPhoto}
                      alt="Uploaded face"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1522609925277-66fea332c575?w=400&q=80";
                      }}
                    />
                    <button
                      onClick={() => setUploadedPhoto(null)}
                      className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="w-64 h-64 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground">
                    <Upload size={48} className="text-muted-foreground" />
                  </div>
                )}

                {!uploadedPhoto && (
                  <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                    <Button
                      variant="outline"
                      className="flex-1 flex items-center justify-center gap-2"
                      onClick={() =>
                        document.getElementById("photo-upload")?.click()
                      }
                    >
                      <Upload size={16} />
                      Upload Photo
                      <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                      />
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 flex items-center justify-center gap-2"
                      onClick={handleTakePhoto}
                    >
                      <Camera size={16} />
                      Use Camera
                    </Button>
                  </div>
                )}

                {uploadedPhoto && !isAnalyzing && (
                  <Button onClick={analyzePhoto} className="w-full max-w-md">
                    Analyze My Face Shape
                  </Button>
                )}

                {isAnalyzing && (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full border-4 border-t-primary border-primary/30 animate-spin"></div>
                    <div className="space-y-2 text-center">
                      <p className="text-muted-foreground">
                        Analyzing your face with AI...
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li className="flex items-center justify-center gap-1">
                          <span className="inline-block w-4 h-4 rounded-full bg-blue-200 animate-pulse"></span>
                          Detecting face shape
                        </li>
                        <li className="flex items-center justify-center gap-1">
                          <span className="inline-block w-4 h-4 rounded-full bg-blue-200 animate-pulse delay-100"></span>
                          Identifying gender
                        </li>
                        <li className="flex items-center justify-center gap-1">
                          <span className="inline-block w-4 h-4 rounded-full bg-blue-200 animate-pulse delay-200"></span>
                          Matching optimal hairstyles
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-6">
              {recommendations.length > 0 ? (
                <div className="space-y-8">
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-center">
                    <h3 className="font-medium text-blue-800 mb-1">
                      AI Analysis Results
                    </h3>
                    <p className="text-sm text-blue-700">
                      We detected a {recommendations[0].gender || "person"} with
                      a {recommendations[0].faceShape || "balanced"} face shape.
                      Here are your personalized hairstyle recommendations:
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {recommendations.map((style) => (
                      <motion.div
                        key={style.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        whileHover={{ scale: 1.02 }}
                        className={`cursor-pointer rounded-lg overflow-hidden border-2 ${selectedStyle?.id === style.id ? "border-primary" : "border-transparent"}`}
                        onClick={() => handleStyleSelect(style)}
                      >
                        <Card className="h-full">
                          <div className="aspect-video w-full overflow-hidden">
                            <img
                              src={style.imageUrl}
                              alt={style.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&q=80";
                              }}
                            />
                          </div>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-lg">
                                {style.name}
                              </CardTitle>
                              <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                                <Check size={12} />
                                {style.suitabilityScore}% Match
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <p className="text-sm text-muted-foreground">
                              {style.description}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {style.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  {selectedStyle && (
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={handleSaveStyle}
                      >
                        <Save size={16} />
                        Save Style
                      </Button>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={handleShareStyle}
                      >
                        <Share2 size={16} />
                        Share Style
                      </Button>
                      <Button
                        className="flex items-center gap-2"
                        onClick={handleBookAppointment}
                      >
                        <Calendar size={16} />
                        Book Appointment
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground">
                    No recommendations yet. Please upload and analyze a photo
                    first.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share This Hairstyle</DialogTitle>
            <DialogDescription>
              Share this hairstyle recommendation with friends or on social
              media.
            </DialogDescription>
          </DialogHeader>

          {selectedStyle && (
            <div className="flex flex-col items-center gap-4 py-4">
              <img
                src={selectedStyle.imageUrl}
                alt={selectedStyle.name}
                className="w-full max-w-xs rounded-md object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&q=80";
                }}
              />
              <h3 className="font-semibold text-lg">{selectedStyle.name}</h3>
              <p className="text-sm text-center text-muted-foreground">
                {selectedStyle.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center gap-2 p-4 h-auto"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-600"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
              <span className="text-xs">Facebook</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center gap-2 p-4 h-auto"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-sky-500"
              >
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
              </svg>
              <span className="text-xs">Twitter</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center gap-2 p-4 h-auto"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-pink-600"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
              <span className="text-xs">Instagram</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center gap-2 p-4 h-auto"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span className="text-xs">Copy Link</span>
            </Button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIRecommendation;
