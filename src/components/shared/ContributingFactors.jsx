import {
  DxcFlex,
  DxcTypography,
  DxcHeading,
  DxcBadge,
} from '@dxc-technology/halstack-react';

const ContributingFactors = ({ factors }) => {
  if (!factors || factors.length === 0) {
    return null;
  }

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'Very High':
        return '#D0021B';
      case 'High':
        return '#FF6B00';
      case 'Moderate':
        return '#FF6B00';
      case 'Low':
        return '#0095FF';
      case 'Very Low':
        return '#24A148';
      default:
        return 'var(--color-fg-neutral-dark)';
    }
  };

  const getImpactIcon = (impactValue) => {
    if (impactValue > 0) return 'trending_up';
    if (impactValue < 0) return 'trending_down';
    return 'trending_flat';
  };

  const getImpactBadgeColor = (impact) => {
    switch (impact) {
      case 'Very High':
      case 'High':
        return 'error';
      case 'Moderate':
        return 'warning';
      case 'Low':
        return 'info';
      case 'Very Low':
        return 'success';
      default:
        return 'neutral';
    }
  };

  // Sort factors by absolute impact value (highest impact first)
  const sortedFactors = [...factors].sort((a, b) =>
    Math.abs(b.impactValue) - Math.abs(a.impactValue)
  );

  return (
    <DxcFlex direction="column" gap="var(--spacing-gap-m)">
      <DxcHeading level={4} text="Contributing Factors" />

      <DxcFlex direction="column" gap="var(--spacing-gap-s)">
        {sortedFactors.map((factor, index) => (
          <div
            key={index}
            style={{
              padding: 'var(--spacing-padding-m)',
              backgroundColor: 'var(--color-bg-neutral-lightest)',
              borderRadius: 'var(--border-radius-s)',
              borderLeft: `4px solid ${getImpactColor(factor.impact)}`
            }}
          >
            <DxcFlex direction="column" gap="var(--spacing-gap-s)">
              {/* Header */}
              <DxcFlex justifyContent="space-between" alignItems="flex-start">
                <DxcFlex direction="column" gap="var(--spacing-gap-xs)" grow={1}>
                  <DxcFlex gap="var(--spacing-gap-s)" alignItems="center">
                    <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-semibold">
                      {factor.factor}
                    </DxcTypography>
                    <DxcBadge
                      label={factor.category}
                      mode="contextual"
                      color="info"
                      size="small"
                    />
                  </DxcFlex>
                  <DxcTypography fontSize="font-scale-02" color="var(--color-fg-neutral-dark)">
                    {factor.description}
                  </DxcTypography>
                </DxcFlex>

                <DxcFlex direction="column" gap="var(--spacing-gap-xs)" alignItems="flex-end">
                  <DxcBadge
                    label={factor.impact}
                    mode="contextual"
                    color={getImpactBadgeColor(factor.impact)}
                  />
                  <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
                    <span
                      className="material-icons"
                      style={{
                        fontSize: '20px',
                        color: getImpactColor(factor.impact)
                      }}
                    >
                      {getImpactIcon(factor.impactValue)}
                    </span>
                    <DxcTypography
                      fontSize="font-scale-04"
                      fontWeight="font-weight-semibold"
                      color={getImpactColor(factor.impact)}
                    >
                      {factor.impactValue > 0 ? '+' : ''}{factor.impactValue}
                    </DxcTypography>
                  </DxcFlex>
                </DxcFlex>
              </DxcFlex>

              {/* Details */}
              <div
                style={{
                  padding: 'var(--spacing-padding-s)',
                  backgroundColor: 'var(--color-bg-neutral-lighter)',
                  borderRadius: 'var(--border-radius-s)'
                }}
              >
                <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                  <DxcFlex gap="var(--spacing-gap-l)" wrap="wrap">
                    <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
                      <span className="material-icons" style={{ fontSize: '16px', color: 'var(--color-fg-neutral-dark)' }}>
                        scale
                      </span>
                      <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                        Weight: {(factor.weight * 100).toFixed(0)}%
                      </DxcTypography>
                    </DxcFlex>
                    <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
                      <span className="material-icons" style={{ fontSize: '16px', color: 'var(--color-fg-neutral-dark)' }}>
                        source
                      </span>
                      <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                        Source: {factor.source}
                      </DxcTypography>
                    </DxcFlex>
                  </DxcFlex>

                  {factor.recommendation && (
                    <DxcFlex gap="var(--spacing-gap-xs)" alignItems="flex-start">
                      <span className="material-icons" style={{ fontSize: '16px', color: '#0095FF' }}>
                        lightbulb
                      </span>
                      <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                        <strong>Recommendation:</strong> {factor.recommendation}
                      </DxcTypography>
                    </DxcFlex>
                  )}
                </DxcFlex>
              </div>
            </DxcFlex>
          </div>
        ))}
      </DxcFlex>

      {/* Summary Stats */}
      <div
        style={{
          padding: 'var(--spacing-padding-m)',
          backgroundColor: 'var(--color-bg-info-lightest)',
          borderRadius: 'var(--border-radius-s)',
          borderLeft: '3px solid #0095FF'
        }}
      >
        <DxcFlex gap="var(--spacing-gap-l)" wrap="wrap">
          <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
            <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
              Total Factors Analyzed
            </DxcTypography>
            <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-semibold" color="#0095FF">
              {factors.length}
            </DxcTypography>
          </DxcFlex>
          <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
            <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
              Positive Factors
            </DxcTypography>
            <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-semibold" color="#24A148">
              {factors.filter(f => f.impactValue > 0).length}
            </DxcTypography>
          </DxcFlex>
          <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
            <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
              Negative Factors
            </DxcTypography>
            <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-semibold" color="#D0021B">
              {factors.filter(f => f.impactValue < 0).length}
            </DxcTypography>
          </DxcFlex>
          <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
            <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
              Net Impact
            </DxcTypography>
            <DxcTypography
              fontSize="font-scale-04"
              fontWeight="font-weight-semibold"
              color={factors.reduce((sum, f) => sum + f.impactValue, 0) >= 0 ? '#24A148' : '#D0021B'}
            >
              {factors.reduce((sum, f) => sum + f.impactValue, 0) > 0 ? '+' : ''}
              {factors.reduce((sum, f) => sum + f.impactValue, 0)}
            </DxcTypography>
          </DxcFlex>
        </DxcFlex>
      </div>
    </DxcFlex>
  );
};

export default ContributingFactors;
