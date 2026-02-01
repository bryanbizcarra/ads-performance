
export interface Campaign {
  id: string;
  name: string;
  spend: number;
  results: number;
  costPerResult: number;
  reach: number;
  impressions: number;
  status: string;
}

export interface DashboardStats {
  totalSpend: number;
  totalResults: number;
  avgCostPerResult: number;
  starCampaign: Campaign | null;
  underperformingCampaigns: Campaign[];
  platform: 'meta' | 'google';
}

export interface AnalysisSummary {
  overview: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}
