export interface PredictionMeta {
  scoredAt: string;
  modelVersion: string;
}

export interface DonorRetentionPrediction {
  predictionId: number;
  supporterId: number;
  asOfDate: string;
  lapseRiskProbability: number;
  riskBand?: string | null;
  modelVersion: string;
  scoredAt: string;
}

export interface ResidentProgressPrediction {
  predictionId: number;
  residentId: number;
  asOfDate: string;
  lowProgressRiskProbability: number;
  priorityBand?: string | null;
  modelVersion: string;
  scoredAt: string;
}

export interface IncidentRiskPrediction {
  predictionId: number;
  residentId: number;
  asOfDate: string;
  incidentRiskProbability: number;
  riskBand?: string | null;
  modelVersion: string;
  scoredAt: string;
}

export interface SocialDonationPrediction {
  predictionId: number;
  postId: number;
  asOfDate: string;
  predictedDonationValuePhp: number;
  pHighConversion?: number | null;
  modelVersion: string;
  scoredAt: string;
}
