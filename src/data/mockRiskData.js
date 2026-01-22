// Mock data for risk scoring and assessment

export const riskCategories = {
  UNDERWRITING: 'Underwriting Risk',
  FINANCIAL: 'Financial Risk',
  MORAL_HAZARD: 'Moral Hazard',
  EXPOSURE: 'Exposure Concentration',
  MEDICAL: 'Medical Risk'
};

export const riskLevels = {
  VERY_LOW: { label: 'Very Low', color: '#24A148', range: [90, 100] },
  LOW: { label: 'Low', color: '#0095FF', range: [75, 89] },
  MODERATE: { label: 'Moderate', color: '#FF6B00', range: [60, 74] },
  HIGH: { label: 'High', color: '#D0021B', range: [40, 59] },
  VERY_HIGH: { label: 'Very High', color: '#8B0000', range: [0, 39] }
};

export const getRiskLevel = (score) => {
  for (const [key, level] of Object.entries(riskLevels)) {
    if (score >= level.range[0] && score <= level.range[1]) {
      return { key, ...level };
    }
  }
  return riskLevels.MODERATE;
};

export const mockRiskAssessments = {
  'UW-2026-001': {
    overallScore: 72,
    lastUpdated: '2026-01-22 10:30 AM',
    assessmentDate: '2026-01-22',
    assessedBy: 'Risk Engine v2.4',
    categoryScores: {
      underwriting: 68,
      financial: 82,
      moralHazard: 75,
      medical: 65,
      exposure: 78
    },
    contributingFactors: [
      {
        factor: 'Type 2 Diabetes',
        category: 'Medical Risk',
        impact: 'High',
        impactValue: -15,
        weight: 0.25,
        description: 'Applicant has Type 2 Diabetes diagnosed in 2021. Current A1C of 6.8% shows good control.',
        recommendation: 'Standard rating with diabetes exclusion or modified premium',
        source: 'Medical Exam + Application'
      },
      {
        factor: 'Age (41 years)',
        category: 'Underwriting Risk',
        impact: 'Low',
        impactValue: +5,
        weight: 0.15,
        description: 'Applicant age is within preferred range for term life insurance',
        recommendation: 'Favorable factor',
        source: 'Application Form'
      },
      {
        factor: 'Annual Income $125K',
        category: 'Financial Risk',
        impact: 'Very Low',
        impactValue: +10,
        weight: 0.20,
        description: 'Income supports coverage amount. Coverage-to-income ratio: 4:1',
        recommendation: 'Well within acceptable limits',
        source: 'Tax Returns 2025'
      },
      {
        factor: 'BMI 26.5 (Overweight)',
        category: 'Medical Risk',
        impact: 'Moderate',
        impactValue: -8,
        weight: 0.18,
        description: 'BMI slightly elevated but not in obese range',
        recommendation: 'Minor rating consideration',
        source: 'Medical Exam'
      },
      {
        factor: 'Stable Employment',
        category: 'Financial Risk',
        impact: 'Low',
        impactValue: +8,
        weight: 0.12,
        description: 'Same employer for 5+ years in professional occupation',
        recommendation: 'Positive stability indicator',
        source: 'Application + Tax Returns'
      },
      {
        factor: 'No Tobacco Use',
        category: 'Medical Risk',
        impact: 'Very Low',
        impactValue: +12,
        weight: 0.22,
        description: 'Non-smoker with negative nicotine screening',
        recommendation: 'Preferred non-tobacco rates applicable',
        source: 'Medical Exam'
      },
      {
        factor: 'Clean Motor Vehicle Record',
        category: 'Moral Hazard',
        impact: 'Very Low',
        impactValue: +6,
        weight: 0.10,
        description: 'No moving violations or accidents in past 5 years',
        recommendation: 'No adverse indicators',
        source: 'MVR Report'
      }
    ],
    thirdPartyData: {
      creditScore: 742,
      creditRating: 'Good',
      mvrStatus: 'Clean',
      prescriptionHistory: 'Metformin (diabetes medication)',
      claimsHistory: 'No prior insurance claims',
      sanctionsCheck: 'Clear',
      bankruptcyCheck: 'None found'
    },
    exposureAnalysis: {
      totalExposure: 500000,
      portfolioConcentration: 'Low',
      geographicRisk: 'Moderate (Chicago metro)',
      catastropheExposure: 'None',
      reinsuranceImpact: 'Below retention threshold'
    },
    modelMetadata: {
      modelVersion: '2.4.1',
      trainingDate: '2025-12-15',
      confidence: 94.2,
      dataCompleteness: 98.5,
      overrideHistory: []
    }
  },
  'UW-2026-003': {
    overallScore: 58,
    lastUpdated: '2026-01-20 02:15 PM',
    assessmentDate: '2026-01-20',
    assessedBy: 'Risk Engine v2.4',
    categoryScores: {
      underwriting: 52,
      financial: 71,
      moralHazard: 68,
      medical: 48,
      exposure: 55
    },
    contributingFactors: [
      {
        factor: 'Hypertension + High Cholesterol',
        category: 'Medical Risk',
        impact: 'Very High',
        impactValue: -25,
        weight: 0.30,
        description: 'Multiple cardiovascular risk factors present',
        recommendation: 'Rated policy or decline consideration',
        source: 'Medical Records'
      },
      {
        factor: 'High Coverage Amount ($1M)',
        category: 'Exposure',
        impact: 'High',
        impactValue: -12,
        weight: 0.20,
        description: 'Large coverage amount increases exposure concentration',
        recommendation: 'Reinsurance evaluation required',
        source: 'Application'
      },
      {
        factor: 'Strong Financial Profile',
        category: 'Financial Risk',
        impact: 'Low',
        impactValue: +15,
        weight: 0.18,
        description: 'High net worth, stable income supports coverage',
        recommendation: 'Financial justification acceptable',
        source: 'Financial Statements'
      }
    ],
    thirdPartyData: {
      creditScore: 798,
      creditRating: 'Excellent',
      mvrStatus: 'Clean',
      prescriptionHistory: 'Lisinopril, Atorvastatin',
      claimsHistory: 'No prior claims',
      sanctionsCheck: 'Clear',
      bankruptcyCheck: 'None found'
    },
    exposureAnalysis: {
      totalExposure: 1000000,
      portfolioConcentration: 'Moderate',
      geographicRisk: 'Low',
      catastropheExposure: 'None',
      reinsuranceImpact: 'Above retention - reinsurance applies'
    },
    modelMetadata: {
      modelVersion: '2.4.1',
      trainingDate: '2025-12-15',
      confidence: 89.7,
      dataCompleteness: 95.2,
      overrideHistory: []
    }
  }
};

export const riskRecommendations = {
  ACCEPT_STANDARD: {
    label: 'Accept - Standard Rates',
    color: '#24A148',
    icon: 'check_circle',
    description: 'Risk profile meets standard underwriting criteria'
  },
  ACCEPT_RATED: {
    label: 'Accept - Rated',
    color: '#0095FF',
    icon: 'verified',
    description: 'Acceptable with premium adjustment'
  },
  REFER: {
    label: 'Refer to Senior UW',
    color: '#FF6B00',
    icon: 'flag',
    description: 'Complex case requiring senior review'
  },
  DECLINE: {
    label: 'Recommend Decline',
    color: '#D0021B',
    icon: 'cancel',
    description: 'Risk exceeds acceptable thresholds'
  },
  COUNTER_OFFER: {
    label: 'Counter Offer',
    color: '#0095FF',
    icon: 'swap_horiz',
    description: 'Offer alternative coverage or terms'
  }
};

export const getRecommendation = (score) => {
  if (score >= 85) return riskRecommendations.ACCEPT_STANDARD;
  if (score >= 70) return riskRecommendations.ACCEPT_RATED;
  if (score >= 55) return riskRecommendations.REFER;
  if (score >= 40) return riskRecommendations.COUNTER_OFFER;
  return riskRecommendations.DECLINE;
};

// Portfolio exposure aggregation
export const portfolioMetrics = {
  totalInForce: '$245M',
  avgCoverageAmount: '$425K',
  concentrationByState: {
    'Illinois': { count: 145, amount: '$62M', percentage: 25.3 },
    'California': { count: 132, amount: '$58M', percentage: 23.7 },
    'New York': { count: 98, amount: '$45M', percentage: 18.4 },
    'Texas': { count: 87, amount: '$38M', percentage: 15.5 },
    'Florida': { count: 76, amount: '$32M', percentage: 13.1 },
    'Other': { count: 124, amount: '$10M', percentage: 4.0 }
  },
  concentrationByLOB: {
    'Term Life': { count: 342, amount: '$142M', percentage: 58.0 },
    'Whole Life': { count: 198, amount: '$68M', percentage: 27.8 },
    'Universal Life': { count: 122, amount: '$35M', percentage: 14.2 }
  },
  riskDistribution: {
    'Very Low (90-100)': { count: 89, percentage: 13.4 },
    'Low (75-89)': { count: 234, percentage: 35.3 },
    'Moderate (60-74)': { count: 198, percentage: 29.9 },
    'High (40-59)': { count: 112, percentage: 16.9 },
    'Very High (0-39)': { count: 29, percentage: 4.4 }
  }
};
