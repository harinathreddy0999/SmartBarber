/**
 * Interface for hairstyle recommendations returned by the AI service
 */
export interface HairstyleRecommendation {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  suitabilityScore: number;
  tags: string[];
  gender?: "male" | "female";
  faceShape?: string;
}

/**
 * Interface for face analysis results
 */
export interface FaceAnalysisResult {
  gender: "male" | "female";
  faceShape: string;
  age?: number;
  skinTone?: string;
  hairColor?: string;
}
