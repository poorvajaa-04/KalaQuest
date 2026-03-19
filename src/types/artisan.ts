export type ArtisanVerificationStatus = "verified" | "master" | "emerging";

export interface ArtisanProcessStep {
  step: string;
  icon: string;
}

export interface ArtisanReview {
  reviewerName: string;
  rating: number;
  text: string;
  date: string;
}

export interface Artisan {
  id: string;
  name: string;
  location: string;
  craftType: string;
  experienceYears: number;
  verificationStatus: ArtisanVerificationStatus;
  storyLong: string;
  craftProcess: ArtisanProcessStep[];
  galleryImages: string[];
  reviews: ArtisanReview[];
}

export interface ArtisanMessagingMetadata {
  email?: string;
  userId?: string;
}

export type ArtisanRecord = Artisan & ArtisanMessagingMetadata;
