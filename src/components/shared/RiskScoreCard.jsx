import {
  DxcFlex,
  DxcTypography,
  DxcHeading,
  DxcProgressBar,
} from '@dxc-technology/halstack-react';
import { getRiskLevel, getRecommendation } from '../../data/mockRiskData';

const RiskScoreCard = ({ riskAssessment, compact = false }) => {
  if (!riskAssessment) {
    return null;
  }

  const { overallScore, categoryScores, lastUpdated } = riskAssessment;
  const riskLevel = getRiskLevel(overallScore);
  const recommendation = getRecommendation(overallScore);

  const categories = [
    { key: 'underwriting', label: 'Underwriting', icon: 'assignment' },
    { key: 'financial', label: 'Financial', icon: 'account_balance' },
    { key: 'medical', label: 'Medical', icon: 'local_hospital' },
    { key: 'moralHazard', label: 'Moral Hazard', icon: 'verified_user' },
    { key: 'exposure', label: 'Exposure', icon: 'location_on' }
  ];

  return (
    <div
      style={{
        padding: compact ? 'var(--spacing-padding-m)' : 'var(--spacing-padding-l)',
        backgroundColor: 'var(--color-bg-neutral-lightest)',
        borderRadius: 'var(--border-radius-m)',
        boxShadow: 'var(--shadow-mid-04)',
        borderTop: `6px solid ${riskLevel.color}`
      }}
    >
      <DxcFlex direction="column" gap="var(--spacing-gap-l)">
        {/* Overall Score Section */}
        <DxcFlex justifyContent="space-between" alignItems="flex-start">
          <DxcFlex direction="column" gap="var(--spacing-gap-s)">
            <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
              OVERALL RISK SCORE
            </DxcTypography>
            <DxcFlex gap="var(--spacing-gap-m)" alignItems="baseline">
              <DxcTypography
                fontSize="64px"
                fontWeight="font-weight-semibold"
                color={riskLevel.color}
                style={{ lineHeight: 1 }}
              >
                {overallScore}
              </DxcTypography>
              <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                <DxcTypography
                  fontSize="font-scale-04"
                  fontWeight="font-weight-semibold"
                  color={riskLevel.color}
                >
                  {riskLevel.label} Risk
                </DxcTypography>
                <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                  Updated: {lastUpdated}
                </DxcTypography>
              </DxcFlex>
            </DxcFlex>
          </DxcFlex>

          {/* Recommendation */}
          {!compact && (
            <div
              style={{
                padding: 'var(--spacing-padding-m)',
                backgroundColor: `${recommendation.color}15`,
                borderRadius: 'var(--border-radius-m)',
                border: `2px solid ${recommendation.color}`,
                minWidth: '280px'
              }}
            >
              <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                <DxcFlex gap="var(--spacing-gap-s)" alignItems="center">
                  <span className="material-icons" style={{ fontSize: '24px', color: recommendation.color }}>
                    {recommendation.icon}
                  </span>
                  <DxcTypography
                    fontSize="font-scale-04"
                    fontWeight="font-weight-semibold"
                    color={recommendation.color}
                  >
                    {recommendation.label}
                  </DxcTypography>
                </DxcFlex>
                <DxcTypography fontSize="font-scale-02" color="var(--color-fg-neutral-dark)">
                  {recommendation.description}
                </DxcTypography>
              </DxcFlex>
            </div>
          )}
        </DxcFlex>

        {/* Score Breakdown */}
        {!compact && (
          <div>
            <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" style={{ marginBottom: 'var(--spacing-gap-m)' }}>
              Risk Category Breakdown
            </DxcTypography>
            <DxcFlex direction="column" gap="var(--spacing-gap-m)">
              {categories.map((category) => {
                const score = categoryScores[category.key];
                const categoryLevel = getRiskLevel(score);

                return (
                  <div key={category.key}>
                    <DxcFlex justifyContent="space-between" alignItems="center" style={{ marginBottom: 'var(--spacing-gap-xs)' }}>
                      <DxcFlex gap="var(--spacing-gap-s)" alignItems="center">
                        <span className="material-icons" style={{ fontSize: '20px', color: categoryLevel.color }}>
                          {category.icon}
                        </span>
                        <DxcTypography fontSize="font-scale-03">
                          {category.label}
                        </DxcTypography>
                      </DxcFlex>
                      <DxcTypography
                        fontSize="font-scale-04"
                        fontWeight="font-weight-semibold"
                        color={categoryLevel.color}
                      >
                        {score}
                      </DxcTypography>
                    </DxcFlex>
                    <DxcProgressBar
                      value={score}
                      showValue={false}
                    />
                  </div>
                );
              })}
            </DxcFlex>
          </div>
        )}

        {/* Model Metadata */}
        {!compact && riskAssessment.modelMetadata && (
          <div
            style={{
              padding: 'var(--spacing-padding-m)',
              backgroundColor: 'var(--color-bg-neutral-lighter)',
              borderRadius: 'var(--border-radius-s)',
              borderLeft: '3px solid #0095FF'
            }}
          >
            <DxcFlex direction="column" gap="var(--spacing-gap-s)">
              <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                Assessment Details
              </DxcTypography>
              <DxcFlex gap="var(--spacing-gap-l)" wrap="wrap">
                <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                  <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
                    Model Version
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-02">
                    {riskAssessment.modelMetadata.modelVersion}
                  </DxcTypography>
                </DxcFlex>
                <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                  <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
                    Confidence
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-02" color="#24A148">
                    {riskAssessment.modelMetadata.confidence}%
                  </DxcTypography>
                </DxcFlex>
                <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                  <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
                    Data Completeness
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-02" color="#0095FF">
                    {riskAssessment.modelMetadata.dataCompleteness}%
                  </DxcTypography>
                </DxcFlex>
                <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                  <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
                    Assessed By
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-02">
                    {riskAssessment.assessedBy}
                  </DxcTypography>
                </DxcFlex>
              </DxcFlex>
            </DxcFlex>
          </div>
        )}
      </DxcFlex>
    </div>
  );
};

export default RiskScoreCard;
