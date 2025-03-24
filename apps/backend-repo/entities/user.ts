export interface User {
  id: string;
  name: string;
  email: string;
  totalAverageWeightRatings?: number;
  numberOfRents?: number;
  recentlyActive?: number; // epoch time
  createdAt: number; // epoch time
  updatedAt: number; // epoch time
  potentialScore?: number; // pre-computed score for user potential
  preferences?: {
    theme?: string;
    notifications?: boolean;
  };
} 