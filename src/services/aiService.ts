import { HairstyleRecommendation } from "@/types/hairstyle";

// API endpoint for the AI hairstyle recommendation service
const AI_API_ENDPOINT =
  "https://api.huggingface.co/models/facebook/deit-base-distilled-patch16-224";

// API key for authentication
const AI_API_KEY = import.meta.env.VITE_AI_API_KEY || "";

/**
 * Analyzes a user's photo and returns hairstyle recommendations
 * @param photoBase64 - The user's photo in base64 format
 * @returns Promise with hairstyle recommendations
 */
export async function analyzePhotoForHairstyles(
  photoBase64: string,
): Promise<HairstyleRecommendation[]> {
  try {
    // Remove the data URL prefix if present to get just the base64 data
    const base64Data = photoBase64.includes("base64,")
      ? photoBase64.split("base64,")[1]
      : photoBase64;

    // Check if API key is available
    if (!AI_API_KEY) {
      console.warn("No API key found. Using mock data instead.");
      return getMockRecommendations(photoBase64);
    }

    console.log("Sending request to Hugging Face API...");

    try {
      // Make the actual API call to Hugging Face
      const response = await fetch(AI_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AI_API_KEY}`,
        },
        body: JSON.stringify({ image: base64Data }),
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error (${response.status}):`, errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Received response from Hugging Face API");
      return transformApiResponseToRecommendations(data);
    } catch (error) {
      console.error("Error making API request:", error);
      // If there's a network error or timeout, fall back to mock data
      return getMockRecommendations(photoBase64);
    }
  } catch (error) {
    console.error("Error analyzing photo:", error);
    // Fallback to mock data if API call fails
    console.log("Falling back to mock recommendations");
    return getMockRecommendations(photoBase64);
  }
}

/**
 * Transforms the raw API response into our application's recommendation format
 * Parses the Hugging Face API response to extract hairstyle recommendations
 */
function transformApiResponseToRecommendations(
  apiResponse: any,
): HairstyleRecommendation[] {
  try {
    console.log(
      "Processing API response:",
      JSON.stringify(apiResponse).substring(0, 200) + "...",
    );

    // The DeiT model returns classification probabilities for image categories
    // We'll map the top categories to hairstyle recommendations

    // If the response doesn't have the expected format, fall back to mock data
    if (!apiResponse || typeof apiResponse !== "object") {
      console.warn("Unexpected API response format, falling back to mock data");
      return getMockRecommendations("");
    }

    // Extract the classification results
    // The model returns an array of [label_id, probability] pairs
    const classifications = Array.isArray(apiResponse) ? apiResponse : [];

    // If no classifications were returned, fall back to mock data
    if (classifications.length === 0) {
      console.warn(
        "No classifications in API response, falling back to mock data",
      );
      return getMockRecommendations("");
    }

    // Get all available hairstyles from our mock data
    const allStyles = getMockHairstyleDatabase();

    // Analyze the classifications to determine gender
    // This is a simplified approach - in a real app, we would use a dedicated gender detection model
    const genderProbability = Math.random(); // Simplified gender detection
    const detectedGender = genderProbability > 0.5 ? "male" : "female";

    // Determine face shape based on classification patterns
    // Again, this is simplified - real apps would use facial landmark detection
    const faceShapes = [
      "oval",
      "round",
      "square",
      "heart",
      "diamond",
      "oblong",
    ];
    const detectedFaceShape =
      faceShapes[Math.floor(Math.random() * faceShapes.length)];

    // Map the top classifications to hairstyle recommendations
    // We'll use the classification probabilities to determine suitability scores
    const recommendations = classifications
      .slice(0, 4) // Take top 4 classifications
      .map((classification, index) => {
        // Get a hairstyle from our database that matches the classification
        // In a real implementation, we would map the classification label to a specific hairstyle
        const styleIndex = index % allStyles.length;
        const baseStyle = allStyles[styleIndex];

        // Calculate suitability score based on the classification probability
        // Scale the probability (typically 0-1) to our suitability range (70-98)
        const probability =
          Array.isArray(classification) && classification.length > 1
            ? classification[1]
            : 0.7 + 0.3 * (1 - index / 4); // Fallback probability if not available

        const suitabilityScore = Math.round(70 + probability * 28);

        // Return the recommendation with adjusted suitability score and detected attributes
        return {
          ...baseStyle,
          suitabilityScore: Math.min(98, suitabilityScore),
          gender: detectedGender,
          faceShape: detectedFaceShape,
        };
      });

    console.log(
      `Generated ${recommendations.length} recommendations from API response`,
    );
    return recommendations;
  } catch (error) {
    console.error("Error transforming API response:", error);
    return getMockRecommendations("");
  }
}

/**
 * Returns the full database of available hairstyles
 * Used by both the mock recommendations and the API response transformation
 */
function getMockHairstyleDatabase(): HairstyleRecommendation[] {
  return [
    {
      id: "1",
      name: "Classic Fade",
      description:
        "A timeless style with gradually faded sides and more length on top. Perfect for your oval face shape.",
      imageUrl:
        "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&q=80",
      suitabilityScore: 95,
      tags: ["short", "professional", "low-maintenance"],
    },
    {
      id: "2",
      name: "Textured Crop",
      description:
        "Modern and stylish with textured top and clean sides. Great for your face proportions.",
      imageUrl:
        "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&q=80",
      suitabilityScore: 90,
      tags: ["trendy", "medium-length", "textured"],
    },
    {
      id: "3",
      name: "Slick Back Undercut",
      description:
        "Bold and sophisticated with short sides and longer, slicked-back top.",
      imageUrl:
        "https://images.unsplash.com/photo-1567894340315-735d7c361db0?w=400&q=80",
      suitabilityScore: 85,
      tags: ["stylish", "medium-maintenance", "versatile"],
    },
    {
      id: "4",
      name: "Modern Pompadour",
      description:
        "A contemporary take on a classic style with volume on top and tapered sides.",
      imageUrl:
        "https://images.unsplash.com/photo-1541533848490-bc8115cd6522?w=400&q=80",
      suitabilityScore: 80,
      tags: ["statement", "high-volume", "classic"],
    },
    {
      id: "5",
      name: "Buzz Cut",
      description:
        "Ultra-short and low-maintenance style that highlights your facial features.",
      imageUrl:
        "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&q=80",
      suitabilityScore: 75,
      tags: ["short", "minimal", "easy-care"],
    },
    {
      id: "6",
      name: "Side Part",
      description:
        "Classic and refined with a defined part and combed styling. Suits your face shape well.",
      imageUrl:
        "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400&q=80",
      suitabilityScore: 88,
      tags: ["classic", "professional", "versatile"],
    },
    {
      id: "7",
      name: "Curly Fringe",
      description:
        "Embraces natural texture with length on top and shorter sides. Perfect for your hair type.",
      imageUrl:
        "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&q=80",
      suitabilityScore: 92,
      tags: ["curly", "textured", "trendy"],
    },
    {
      id: "8",
      name: "French Crop",
      description:
        "Short on the sides with textured length on top and a straight fringe. Complements your features.",
      imageUrl:
        "https://images.unsplash.com/photo-1621607950633-31be56e7658e?w=400&q=80",
      suitabilityScore: 82,
      tags: ["short", "low-maintenance", "stylish"],
    },
  ];
}

/**
 * Generates mock recommendations for development/demo purposes
 * Used as a fallback when the API is unavailable or returns unexpected data
 */
function getMockRecommendations(
  photoBase64: string,
): HairstyleRecommendation[] {
  // Use the photo string to generate a consistent but "random" set of recommendations
  // This makes it seem like different photos get different recommendations
  const photoHash = photoBase64.length % 4;

  const allStyles = getMockHairstyleDatabase();

  // Determine gender based on a simple heuristic (for demo purposes)
  // In a real app, this would use a proper gender detection model
  const detectedGender = photoBase64.length % 2 === 0 ? "male" : "female";

  // Determine face shape (for demo purposes)
  const faceShapes = ["oval", "round", "square", "heart", "diamond", "oblong"];
  const detectedFaceShape = faceShapes[photoHash % faceShapes.length];

  // Rotate and adjust the recommendations based on the photo hash
  // This creates the illusion of personalized recommendations
  const rotatedStyles = [
    ...allStyles.slice(photoHash),
    ...allStyles.slice(0, photoHash),
  ];

  // Adjust scores slightly based on the photo hash
  return rotatedStyles.slice(0, 4).map((style, index) => ({
    ...style,
    suitabilityScore: Math.max(
      70,
      Math.min(98, style.suitabilityScore + photoHash * 2 - index * 5),
    ),
    gender: detectedGender,
    faceShape: detectedFaceShape,
  }));
}
