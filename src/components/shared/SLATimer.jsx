import {
  DxcFlex,
  DxcTypography,
  DxcHeading,
  DxcProgressBar,
} from '@dxc-technology/halstack-react';
import { getSLAStatusColor } from '../../data/mockTasks';

const SLATimer = ({ submissionSLA, compact = false }) => {
  if (!submissionSLA) {
    return null;
  }

  const slaMetrics = [
    {
      key: 'timeToFirstDecision',
      label: 'Time to First Decision',
      icon: 'assignment_turned_in'
    },
    {
      key: 'timeToQuote',
      label: 'Time to Quote',
      icon: 'request_quote'
    },
    {
      key: 'requirementsCompletion',
      label: 'Requirements Completion',
      icon: 'checklist'
    }
  ];

  return (
    <div
      style={{
        padding: compact ? 'var(--spacing-padding-m)' : 'var(--spacing-padding-l)',
        backgroundColor: 'var(--color-bg-neutral-lightest)',
        borderRadius: 'var(--border-radius-m)',
        boxShadow: 'var(--shadow-mid-02)'
      }}
    >
      <DxcFlex direction="column" gap="var(--spacing-gap-l)">
        <DxcFlex justifyContent="space-between" alignItems="center">
          <DxcHeading level={4} text="SLA Tracking" />
          <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
            <span className="material-icons" style={{ fontSize: '20px', color: '#0095FF' }}>
              schedule
            </span>
            <DxcTypography fontSize="font-scale-03" color="#0095FF">
              Age: {submissionSLA.submissionAge}
            </DxcTypography>
          </DxcFlex>
        </DxcFlex>

        <DxcFlex direction="column" gap="var(--spacing-gap-m)">
          {slaMetrics.map((metric) => {
            const sla = submissionSLA[metric.key];
            if (!sla) return null;

            const isBreached = sla.status === 'Breached';
            const isAtRisk = sla.status === 'At Risk';

            return (
              <div
                key={metric.key}
                style={{
                  padding: 'var(--spacing-padding-m)',
                  backgroundColor: isBreached
                    ? 'var(--color-bg-error-lightest)'
                    : isAtRisk
                    ? 'var(--color-bg-warning-lightest)'
                    : 'var(--color-bg-neutral-lighter)',
                  borderRadius: 'var(--border-radius-s)',
                  borderLeft: `4px solid ${getSLAStatusColor(sla.status)}`
                }}
              >
                <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                  {/* Header */}
                  <DxcFlex justifyContent="space-between" alignItems="center">
                    <DxcFlex gap="var(--spacing-gap-s)" alignItems="center">
                      <span className="material-icons" style={{ fontSize: '20px', color: getSLAStatusColor(sla.status) }}>
                        {metric.icon}
                      </span>
                      <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                        {metric.label}
                      </DxcTypography>
                    </DxcFlex>
                    <DxcFlex gap="var(--spacing-gap-s)" alignItems="center">
                      {isBreached && (
                        <span className="material-icons" style={{ fontSize: '20px', color: '#D0021B' }}>
                          warning
                        </span>
                      )}
                      <DxcTypography
                        fontSize="font-scale-03"
                        fontWeight="font-weight-semibold"
                        color={getSLAStatusColor(sla.status)}
                      >
                        {sla.status}
                      </DxcTypography>
                    </DxcFlex>
                  </DxcFlex>

                  {/* Progress */}
                  <div>
                    <DxcFlex justifyContent="space-between" alignItems="center" style={{ marginBottom: 'var(--spacing-gap-xs)' }}>
                      <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                        Target: {sla.target}
                      </DxcTypography>
                      <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                        {sla.percentComplete}% Complete
                      </DxcTypography>
                    </DxcFlex>
                    <DxcProgressBar
                      value={Math.min(sla.percentComplete, 100)}
                      showValue={false}
                    />
                  </div>

                  {/* Time Details */}
                  <DxcFlex gap="var(--spacing-gap-l)" wrap="wrap">
                    <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                      <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
                        Elapsed
                      </DxcTypography>
                      <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
                        {sla.elapsed}
                      </DxcTypography>
                    </DxcFlex>
                    <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                      <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
                        Remaining
                      </DxcTypography>
                      <DxcTypography
                        fontSize="font-scale-02"
                        fontWeight="font-weight-semibold"
                        color={getSLAStatusColor(sla.status)}
                      >
                        {sla.remaining}
                      </DxcTypography>
                    </DxcFlex>
                  </DxcFlex>
                </DxcFlex>
              </div>
            );
          })}
        </DxcFlex>

        {/* SLA Status Summary */}
        <div
          style={{
            padding: 'var(--spacing-padding-m)',
            backgroundColor: 'var(--color-bg-info-lightest)',
            borderRadius: 'var(--border-radius-s)',
            borderLeft: '3px solid #0095FF'
          }}
        >
          <DxcFlex gap="var(--spacing-gap-s)">
            <span className="material-icons" style={{ fontSize: '20px', color: '#0095FF' }}>
              info
            </span>
            <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
              <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                SLA Targets
              </DxcTypography>
              <DxcTypography fontSize="font-scale-02" color="var(--color-fg-neutral-dark)">
                SLA timers automatically track submission progress against defined targets.
                Alerts are triggered when timelines are at risk or breached.
              </DxcTypography>
            </DxcFlex>
          </DxcFlex>
        </div>
      </DxcFlex>
    </div>
  );
};

export default SLATimer;
