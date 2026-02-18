import { useState, useMemo } from 'react';
import {
  DxcHeading,
  DxcFlex,
  DxcContainer,
  DxcTypography,
  DxcTextInput,
  DxcSwitch,
  DxcTabs,
  DxcBadge,
  DxcSelect,
  DxcInset,
  DxcPaginator,
  DxcButton,
  DxcChip,
} from '@dxc-technology/halstack-react';
import { pcSubmissions, getStatusColor } from '../../data/mockSubmissions';
import './Dashboard.css';

const Dashboard = ({ onSubmissionSelect }) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isGridView, setIsGridView] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [subsetFilter, setSubsetFilter] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    quotePolicy: true,
    dateSubmitted: true,
    dateReceived: true,
    effectiveDate: true,
    lob: true,
    symbol: true,
    primaryState: true,
    applicant: true,
    transactionStatus: true,
  });
  const itemsPerPage = 9;

  const submissions = pcSubmissions;

  const metrics = useMemo(() => ({
    totalSubmissions: 12,
    newSubmissions: 2,
    quotesRequired: 6,
    writtenPremiumYTD: 24.8,
    pendingReview: 7,
    approvedThisMonth: 42,
    declinedThisMonth: 7,
    approvalRate: 87,
  }), []);

  // Department inventory tiles
  const workflowGroups = useMemo(() => [
    { key: 'new_business', label: 'New Business', count: metrics.newSubmissions },
    { key: 'quote_required', label: 'Quote Required', count: metrics.quotesRequired },
    { key: 'referral', label: 'Referral Required', count: submissions.filter(s => s.referral?.required).length },
    { key: 'fast_track', label: 'Fast-Track Eligible', count: submissions.filter(s => s.routing?.fastTrackEligible).length },
    { key: 'pending_review', label: 'Pending Review', count: metrics.pendingReview },
    { key: 'approved', label: 'Approved This Month', count: metrics.approvedThisMonth },
    { key: 'declined', label: 'Declined This Month', count: metrics.declinedThisMonth },
  ], [submissions, metrics]);

  // Filter submissions by tab, subset, and search
  const filteredSubmissions = useMemo(() => {
    let filtered = [...submissions];

    if (activeTabIndex === 1) {
      filtered = filtered.filter(s => s.status === 'Pending Review');
    } else if (activeTabIndex === 2) {
      filtered = filtered.filter(s => s.status === 'Approved');
    }

    if (subsetFilter) {
      switch (subsetFilter) {
        case 'referral':
          filtered = filtered.filter(s => s.referral?.required);
          break;
        case 'fast_track':
          filtered = filtered.filter(s => s.routing?.fastTrackEligible);
          break;
        case 'pending_review':
          filtered = filtered.filter(s => s.status === 'Pending Review');
          break;
        case 'approved':
          filtered = filtered.filter(s => s.status === 'Approved');
          break;
        default:
          break;
      }
    }

    if (searchValue) {
      const q = searchValue.toLowerCase();
      filtered = filtered.filter(s =>
        s.id?.toLowerCase().includes(q) ||
        s.applicantName?.toLowerCase().includes(q) ||
        s.lineOfBusiness?.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [submissions, activeTabIndex, subsetFilter, searchValue]);

  const paginatedSubmissions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSubmissions.slice(start, start + itemsPerPage);
  }, [filteredSubmissions, currentPage]);

  return (
    <div style={{ padding: '24px', width: '100%', backgroundColor: '#f5f5f5', boxSizing: 'border-box' }}>
      <DxcFlex direction="column" gap="var(--spacing-gap-m)">

        {/* Page Title */}
        <DxcHeading level={1} text="Dashboard" />

        {/* ── Row 1: My Priorities Today + Key Metrics ── */}
        <DxcFlex gap="var(--spacing-gap-m)">

          {/* My Priorities Today */}
          <div style={{
            backgroundColor: 'var(--color-bg-neutral-lightest)',
            borderRadius: 'var(--border-radius-m)',
            boxShadow: 'var(--shadow-mid-04)',
            flex: 1,
            height: '240px',
            boxSizing: 'border-box',
            padding: 'var(--spacing-padding-m)'
          }}>
            <DxcFlex direction="column" gap="var(--spacing-gap-m)">
              <DxcHeading level={3} text="My Priorities Today" />
              <DxcFlex gap="var(--spacing-gap-none)" alignItems="center">

                {/* Total Submissions */}
                <DxcFlex direction="column" gap="var(--spacing-gap-s)" alignItems="center" justifyContent="center" grow={1} basis="0">
                  <DxcTypography fontSize="32px" fontWeight="font-weight-semibold" color="var(--color-fg-secondary-strong)" textAlign="center">
                    {metrics.totalSubmissions}
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="var(--color-fg-neutral-stronger)" textAlign="center">
                    Total Submissions
                  </DxcTypography>
                </DxcFlex>

                <div style={{ padding: 'var(--spacing-padding-xs)' }}>
                  <div style={{ height: '97px', width: '1px', backgroundColor: 'var(--color-bg-neutral-light)' }} />
                </div>

                {/* New Submissions */}
                <DxcFlex direction="column" gap="var(--spacing-gap-s)" alignItems="center" justifyContent="center" grow={1} basis="0">
                  <DxcTypography fontSize="32px" fontWeight="font-weight-semibold" color="var(--color-fg-error-medium)" textAlign="center">
                    {metrics.newSubmissions}
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="var(--color-fg-neutral-stronger)" textAlign="center">
                    New Today
                  </DxcTypography>
                </DxcFlex>

                <div style={{ padding: 'var(--spacing-padding-xs)' }}>
                  <div style={{ height: '97px', width: '1px', backgroundColor: 'var(--color-bg-neutral-light)' }} />
                </div>

                {/* Quotes Required */}
                <DxcFlex direction="column" gap="var(--spacing-gap-s)" alignItems="center" justifyContent="center" grow={1} basis="0">
                  <DxcTypography fontSize="32px" fontWeight="font-weight-semibold" color="var(--color-fg-warning-medium)" textAlign="center">
                    {metrics.quotesRequired}
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="var(--color-fg-neutral-stronger)" textAlign="center">
                    Quotes Required
                  </DxcTypography>
                </DxcFlex>

              </DxcFlex>
            </DxcFlex>
          </div>

          {/* Key Metrics */}
          <div style={{
            backgroundColor: 'var(--color-bg-neutral-lightest)',
            borderRadius: 'var(--border-radius-m)',
            boxShadow: 'var(--shadow-mid-04)',
            flex: 2,
            height: '240px',
            boxSizing: 'border-box',
            padding: 'var(--spacing-padding-m)'
          }}>
            <DxcFlex direction="column" gap="var(--spacing-gap-m)">
              <DxcHeading level={3} text="Key Metrics" />
              <DxcFlex gap="var(--spacing-gap-m)" alignItems="center" justifyContent="space-between">

                {/* Written Premium YTD */}
                <div style={{ borderTop: '4px solid var(--border-color-info-medium)', flex: '1' }}>
                  <div style={{ backgroundColor: 'var(--color-bg-neutral-lightest)', height: '120px' }}>
                    <DxcFlex direction="column" gap="var(--spacing-gap-xxs)" alignItems="center" justifyContent="center" fullHeight>
                      <DxcTypography fontSize="12px" fontWeight="font-weight-regular" color="var(--color-fg-neutral-stronger)" textAlign="center">
                        WRITTEN PREMIUM YTD
                      </DxcTypography>
                      <DxcTypography fontSize="32px" fontWeight="font-weight-semibold" color="var(--color-fg-secondary-medium)" textAlign="center">
                        ${metrics.writtenPremiumYTD}M
                      </DxcTypography>
                      <DxcTypography fontSize="12px" fontWeight="font-weight-regular" color="var(--color-fg-secondary-medium)" textAlign="center">
                        +18% vs last year
                      </DxcTypography>
                    </DxcFlex>
                  </div>
                </div>

                {/* Pending Review */}
                <div style={{ borderTop: '4px solid var(--color-semantic03-400)', flex: '1' }}>
                  <div style={{ backgroundColor: 'var(--color-bg-neutral-lightest)', height: '120px' }}>
                    <DxcFlex direction="column" gap="var(--spacing-gap-xxs)" alignItems="center" justifyContent="center" fullHeight>
                      <DxcTypography fontSize="12px" fontWeight="font-weight-regular" color="var(--color-fg-neutral-stronger)" textAlign="center">
                        PENDING REVIEW
                      </DxcTypography>
                      <DxcTypography fontSize="32px" fontWeight="font-weight-semibold" color="var(--color-fg-warning-medium)" textAlign="center">
                        {metrics.pendingReview}
                      </DxcTypography>
                      <DxcTypography fontSize="12px" fontWeight="font-weight-regular" color="var(--color-fg-warning-medium)" textAlign="center">
                        3 closing today
                      </DxcTypography>
                    </DxcFlex>
                  </div>
                </div>

                {/* Approved This Month */}
                <div style={{ borderTop: '4px solid var(--color-semantic02-500)', flex: '1' }}>
                  <div style={{ backgroundColor: 'var(--color-bg-neutral-lightest)', height: '120px' }}>
                    <DxcFlex direction="column" gap="var(--spacing-gap-xxs)" alignItems="center" justifyContent="center" fullHeight>
                      <DxcTypography fontSize="12px" fontWeight="font-weight-regular" color="var(--color-fg-neutral-stronger)" textAlign="center">
                        APPROVED THIS MONTH
                      </DxcTypography>
                      <DxcTypography fontSize="32px" fontWeight="font-weight-semibold" color="var(--color-fg-success-medium)" textAlign="center">
                        {metrics.approvedThisMonth}
                      </DxcTypography>
                      <DxcTypography fontSize="12px" fontWeight="font-weight-regular" color="var(--color-fg-success-medium)" textAlign="center">
                        {metrics.approvalRate}% approval rate
                      </DxcTypography>
                    </DxcFlex>
                  </div>
                </div>

                {/* Declined This Month */}
                <div style={{ borderTop: '4px solid var(--color-semantic04-500)', flex: '1' }}>
                  <div style={{ backgroundColor: 'var(--color-bg-neutral-lightest)', height: '120px' }}>
                    <DxcFlex direction="column" gap="var(--spacing-gap-xxs)" alignItems="center" justifyContent="center" fullHeight>
                      <DxcTypography fontSize="12px" fontWeight="font-weight-regular" color="var(--color-fg-neutral-stronger)" textAlign="center">
                        DECLINED THIS MONTH
                      </DxcTypography>
                      <DxcTypography fontSize="32px" fontWeight="font-weight-semibold" color="var(--color-fg-error-medium)" textAlign="center">
                        {metrics.declinedThisMonth}
                      </DxcTypography>
                      <DxcTypography fontSize="12px" fontWeight="font-weight-regular" color="var(--color-fg-error-medium)" textAlign="center">
                        {100 - metrics.approvalRate}% decline rate
                      </DxcTypography>
                    </DxcFlex>
                  </div>
                </div>

              </DxcFlex>
            </DxcFlex>
          </div>
        </DxcFlex>

        {/* ── Row 2: Processing Performance ── */}
        <div style={{
          backgroundColor: 'var(--color-bg-neutral-lightest)',
          borderRadius: 'var(--border-radius-m)',
          boxShadow: 'var(--shadow-mid-04)',
          padding: 'var(--spacing-padding-m)'
        }}>
          <DxcFlex direction="column" gap="var(--spacing-gap-m)">
            <DxcFlex gap="var(--spacing-gap-s)" alignItems="center">
              <DxcHeading level={3} text="Processing Performance" />
              <DxcBadge label="Fast-Track" mode="contextual" color="success" />
            </DxcFlex>
            <DxcFlex gap="var(--spacing-gap-m)" alignItems="center" justifyContent="space-between">

              {/* Fast-Track Eligible */}
              <div style={{ borderTop: '4px solid #0095FF', flex: '1' }}>
                <div style={{ backgroundColor: 'var(--color-bg-neutral-lightest)', height: '120px' }}>
                  <DxcFlex direction="column" gap="var(--spacing-gap-xxs)" alignItems="center" justifyContent="center" fullHeight>
                    <DxcTypography fontSize="12px" fontWeight="font-weight-regular" color="var(--color-fg-neutral-stronger)" textAlign="center">
                      FAST-TRACK ELIGIBLE
                    </DxcTypography>
                    <DxcTypography fontSize="32px" fontWeight="font-weight-semibold" color="#0095FF" textAlign="center">
                      {submissions.filter(s => s.routing?.fastTrackEligible).length}
                    </DxcTypography>
                    <DxcTypography fontSize="12px" fontWeight="font-weight-regular" color="#0095FF" textAlign="center">
                      {submissions.length > 0 ? Math.round((submissions.filter(s => s.routing?.fastTrackEligible).length / submissions.length) * 100) : 0}% of total
                    </DxcTypography>
                  </DxcFlex>
                </div>
              </div>

              {/* Avg Days to Decision */}
              <div style={{ borderTop: '4px solid var(--color-semantic02-500)', flex: '1' }}>
                <div style={{ backgroundColor: 'var(--color-bg-neutral-lightest)', height: '120px' }}>
                  <DxcFlex direction="column" gap="var(--spacing-gap-xxs)" alignItems="center" justifyContent="center" fullHeight>
                    <DxcTypography fontSize="12px" fontWeight="font-weight-regular" color="var(--color-fg-neutral-stronger)" textAlign="center">
                      AVG DAYS TO DECISION
                    </DxcTypography>
                    <DxcTypography fontSize="32px" fontWeight="font-weight-semibold" color="var(--color-fg-success-medium)" textAlign="center">
                      8
                    </DxcTypography>
                    <DxcTypography fontSize="12px" fontWeight="font-weight-regular" color="var(--color-fg-success-medium)" textAlign="center">
                      Target: ≤10 days
                    </DxcTypography>
                  </DxcFlex>
                </div>
              </div>

              {/* Approval Rate */}
              <div style={{ borderTop: '4px solid var(--color-semantic03-400)', flex: '1' }}>
                <div style={{ backgroundColor: 'var(--color-bg-neutral-lightest)', height: '120px' }}>
                  <DxcFlex direction="column" gap="var(--spacing-gap-xxs)" alignItems="center" justifyContent="center" fullHeight>
                    <DxcTypography fontSize="12px" fontWeight="font-weight-regular" color="var(--color-fg-neutral-stronger)" textAlign="center">
                      APPROVAL RATE
                    </DxcTypography>
                    <DxcTypography fontSize="32px" fontWeight="font-weight-semibold" color={metrics.approvalRate >= 80 ? 'var(--color-fg-success-medium)' : 'var(--color-fg-warning-medium)'} textAlign="center">
                      {metrics.approvalRate}%
                    </DxcTypography>
                    <DxcTypography fontSize="12px" fontWeight="font-weight-regular" color={metrics.approvalRate >= 80 ? 'var(--color-fg-success-medium)' : 'var(--color-fg-warning-medium)'} textAlign="center">
                      {metrics.approvalRate >= 80 ? 'Meeting goal' : 'Below target'}
                    </DxcTypography>
                  </DxcFlex>
                </div>
              </div>

            </DxcFlex>
          </DxcFlex>
        </div>

        {/* ── Row 3: Department Inventory ── */}
        <div style={{
          backgroundColor: 'var(--color-bg-neutral-lightest)',
          borderRadius: 'var(--border-radius-m)',
          boxShadow: 'var(--shadow-mid-04)',
          padding: 'var(--spacing-padding-m)'
        }}>
          <DxcFlex direction="column" gap="var(--spacing-gap-m)">
            <DxcHeading level={3} text="Department Inventory" />
            <DxcTypography fontSize="font-scale-03" color="var(--color-fg-neutral-dark)">
              Inventory organized by workflow group. Click a group to filter the submissions list below.
            </DxcTypography>
            <DxcFlex gap="var(--spacing-gap-s)" wrap="wrap">
              {workflowGroups.map(group => (
                <div
                  key={group.key}
                  onClick={() => {
                    setSubsetFilter(subsetFilter === group.key ? null : group.key);
                    setActiveTabIndex(0);
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--border-radius-m)',
                    border: subsetFilter === group.key
                      ? '2px solid var(--color-fg-secondary-medium)'
                      : '1px solid var(--border-color-neutral-lighter)',
                    backgroundColor: subsetFilter === group.key
                      ? 'var(--color-bg-neutral-lighter)'
                      : 'var(--color-bg-neutral-lightest)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    minWidth: '130px',
                    textAlign: 'center'
                  }}
                >
                  <DxcFlex direction="column" gap="var(--spacing-gap-xxs)" alignItems="center">
                    <DxcTypography
                      fontSize="24px"
                      fontWeight="font-weight-semibold"
                      color={group.count > 0 ? 'var(--color-fg-secondary-medium)' : 'var(--color-fg-neutral-dark)'}
                    >
                      {group.count}
                    </DxcTypography>
                    <DxcTypography
                      fontSize="12px"
                      fontWeight="font-weight-semibold"
                      color="var(--color-fg-neutral-stronger)"
                      textAlign="center"
                    >
                      {group.label}
                    </DxcTypography>
                  </DxcFlex>
                </div>
              ))}
            </DxcFlex>
            {subsetFilter && (
              <DxcFlex gap="var(--spacing-gap-s)" alignItems="center">
                <DxcTypography fontSize="font-scale-03" color="var(--color-fg-neutral-dark)">
                  Filtering by:
                </DxcTypography>
                <DxcChip
                  label={workflowGroups.find(g => g.key === subsetFilter)?.label || subsetFilter}
                  onClose={() => setSubsetFilter(null)}
                />
              </DxcFlex>
            )}
          </DxcFlex>
        </div>

        {/* ── Row 4: Submissions List ── */}
        <div style={{
          backgroundColor: 'var(--color-bg-neutral-lightest)',
          borderRadius: 'var(--border-radius-m)',
          boxShadow: 'var(--shadow-mid-02)',
          padding: 'var(--spacing-padding-l)'
        }}>
          <DxcFlex direction="column" gap="var(--spacing-gap-s)">
            <DxcHeading level={3} text="My Priorities" />

            {/* Tabs */}
            <DxcTabs iconPosition="left">
              <DxcTabs.Tab
                label="Submissions / New Business"
                icon="assignment"
                active={activeTabIndex === 0}
                onClick={() => { setActiveTabIndex(0); setCurrentPage(1); }}
              >
                <div />
              </DxcTabs.Tab>
              <DxcTabs.Tab
                label="Quotes"
                icon="request_quote"
                active={activeTabIndex === 1}
                onClick={() => { setActiveTabIndex(1); setCurrentPage(1); }}
              >
                <div />
              </DxcTabs.Tab>
              <DxcTabs.Tab
                label="Renewals"
                icon="event_repeat"
                active={activeTabIndex === 2}
                onClick={() => { setActiveTabIndex(2); setCurrentPage(1); }}
              >
                <div />
              </DxcTabs.Tab>
            </DxcTabs>

            {/* Filter Bar */}
            <DxcFlex gap="var(--spacing-gap-s)" wrap="wrap" alignItems="flex-end">
              <DxcTextInput
                placeholder="Search by ID, applicant, or LOB..."
                value={searchValue}
                onChange={({ value }) => { setSearchValue(value); setCurrentPage(1); }}
                size="medium"
              />
              <DxcFlex gap="var(--spacing-gap-ml)" alignItems="center">
                {/* Column selector (grid view only) */}
                {isGridView && (
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setShowColumnSelector(!showColumnSelector)}
                      className="column-selector-btn"
                    >
                      <DxcFlex alignItems="center" gap="var(--spacing-gap-xs)">
                        <span className="material-icons" style={{ fontSize: '18px' }}>view_column</span>
                        <span>Columns</span>
                      </DxcFlex>
                    </button>
                    {showColumnSelector && (
                      <div className="column-selector-popover">
                        <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                          {Object.entries({
                            quotePolicy: 'Quote / Policy #',
                            dateSubmitted: 'Date Submitted',
                            dateReceived: 'Date Received',
                            effectiveDate: 'Effective Date',
                            lob: 'LOB',
                            symbol: 'Symbol',
                            primaryState: 'Primary State',
                            applicant: 'Applicant',
                            transactionStatus: 'Transaction Status',
                          }).map(([key, label]) => (
                            <label key={key} className="column-toggle-item">
                              <input
                                type="checkbox"
                                checked={visibleColumns[key]}
                                onChange={(e) => setVisibleColumns({ ...visibleColumns, [key]: e.target.checked })}
                              />
                              <span>{label}</span>
                            </label>
                          ))}
                        </DxcFlex>
                      </div>
                    )}
                  </div>
                )}
                <DxcFlex gap="var(--spacing-gap-none)" alignItems="center">
                  <DxcTypography fontSize="font-scale-03" color="var(--color-fg-secondary-strong)">
                    Card View
                  </DxcTypography>
                  <DxcSwitch
                    checked={isGridView}
                    onChange={(checked) => setIsGridView(checked)}
                  />
                  <DxcTypography fontSize="font-scale-03" color="var(--color-fg-secondary-strong)">
                    Grid View
                  </DxcTypography>
                </DxcFlex>
              </DxcFlex>
            </DxcFlex>

            {/* Card View */}
            {!isGridView && (
              <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                {paginatedSubmissions.map((submission) => (
                  <DxcContainer
                    key={submission.id}
                    style={{
                      backgroundColor: 'var(--color-bg-neutral-lighter)',
                      cursor: 'pointer',
                      borderRadius: 'var(--border-radius-m)',
                      border: '1px solid var(--border-color-neutral-lighter)'
                    }}
                    onClick={() => onSubmissionSelect(submission)}
                  >
                    <DxcInset space="var(--spacing-padding-m)">
                      <DxcFlex direction="column" gap="var(--spacing-gap-xs)">

                        {/* Row 1: ID, Name, Badges + Actions */}
                        <DxcFlex justifyContent="space-between" alignItems="center">
                          <DxcFlex gap="var(--spacing-gap-m)" alignItems="center">
                            <DxcTypography
                              fontSize="font-scale-03"
                              fontWeight="font-weight-semibold"
                              color="var(--color-fg-secondary-medium)"
                            >
                              {submission.id}
                            </DxcTypography>
                            <DxcTypography fontSize="font-scale-03">
                              {submission.applicantName}
                            </DxcTypography>
                            <DxcBadge
                              label={submission.status}
                              mode="contextual"
                              color={getStatusColor(submission.status)}
                              size="small"
                            />
                            {submission.routing?.fastTrackEligible && (
                              <DxcBadge label="Fast-Track" mode="contextual" color="success" size="small" />
                            )}
                            {submission.referral?.required && (
                              <DxcBadge label="Referral Required" mode="contextual" color="warning" size="small" />
                            )}
                            {submission.daysInQueue > 0 && (
                              <DxcTypography fontSize="11px" color="var(--color-fg-neutral-dark)">
                                {submission.daysInQueue}d in queue
                              </DxcTypography>
                            )}
                          </DxcFlex>
                          <DxcFlex gap="var(--spacing-gap-s)" alignItems="center">
                            <DxcButton icon="check" mode="tertiary" title="Approve" onClick={(e) => e.stopPropagation()} />
                            <DxcButton icon="cancel" mode="tertiary" title="Decline" onClick={(e) => e.stopPropagation()} />
                            <DxcButton icon="share" mode="tertiary" title="Share" onClick={(e) => e.stopPropagation()} />
                          </DxcFlex>
                        </DxcFlex>

                        {/* Row 2: AI Routing decision */}
                        {submission.routing && (
                          <div style={{
                            padding: '6px 12px',
                            backgroundColor: submission.routing.fastTrackEligible
                              ? 'var(--color-bg-success-lighter, #E8F5E9)'
                              : 'var(--color-bg-warning-lighter, #FFF3E0)',
                            borderRadius: 'var(--border-radius-s)',
                            borderLeft: submission.routing.fastTrackEligible
                              ? '3px solid var(--color-fg-success-medium)'
                              : '3px solid var(--color-fg-warning-medium)'
                          }}>
                            <DxcTypography fontSize="11px" color="var(--color-fg-neutral-stronger)" fontWeight="font-weight-medium">
                              🤖 {submission.routing.decision} — {submission.routing.reason}
                            </DxcTypography>
                          </div>
                        )}

                        {/* Row 3: Meta details */}
                        <DxcFlex gap="var(--spacing-gap-m)" alignItems="center" wrap="wrap">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                            LOB: {submission.lineOfBusiness}
                          </DxcTypography>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-fg-neutral-strong)' }} />
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                            Submitted: {submission.submittedDate}
                          </DxcTypography>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-fg-neutral-strong)' }} />
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                            Received: {submission.receivedDate}
                          </DxcTypography>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-fg-neutral-strong)' }} />
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                            Effective: {submission.effectiveDate}
                          </DxcTypography>
                        </DxcFlex>

                      </DxcFlex>
                    </DxcInset>
                  </DxcContainer>
                ))}
              </DxcFlex>
            )}

            {/* Grid View */}
            {isGridView && (
              <table className="submissions-grid-table">
                <thead>
                  <tr>
                    {visibleColumns.quotePolicy && <th>Quote / Policy #</th>}
                    {visibleColumns.dateSubmitted && <th>Date Submitted</th>}
                    {visibleColumns.dateReceived && <th>Date Received</th>}
                    {visibleColumns.effectiveDate && <th>Effective Date</th>}
                    {visibleColumns.lob && <th>LOB</th>}
                    {visibleColumns.symbol && <th>Symbol</th>}
                    {visibleColumns.primaryState && <th>Primary State</th>}
                    {visibleColumns.applicant && <th>Applicant</th>}
                    {visibleColumns.transactionStatus && <th>Transaction Status</th>}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSubmissions.map((submission) => (
                    <tr key={submission.id} onClick={() => onSubmissionSelect(submission)}>
                      {visibleColumns.quotePolicy && (
                        <td>
                          <a href="#" className="table-link" onClick={(e) => { e.stopPropagation(); onSubmissionSelect(submission); }}>
                            {submission.id}
                          </a>
                        </td>
                      )}
                      {visibleColumns.dateSubmitted && <td>{submission.submittedDate}</td>}
                      {visibleColumns.dateReceived && <td>{submission.receivedDate}</td>}
                      {visibleColumns.effectiveDate && <td>{submission.effectiveDate}</td>}
                      {visibleColumns.lob && <td>{submission.lineOfBusiness}</td>}
                      {visibleColumns.symbol && <td>{submission.lineOfBusiness}</td>}
                      {visibleColumns.primaryState && <td>SC</td>}
                      {visibleColumns.applicant && <td>{submission.applicantName}</td>}
                      {visibleColumns.transactionStatus && (
                        <td>
                          <DxcBadge
                            label={submission.status}
                            mode="contextual"
                            color={getStatusColor(submission.status)}
                            size="small"
                          />
                        </td>
                      )}
                      <td>
                        <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
                          <button className="icon-btn-small" title="Approve" onClick={(e) => e.stopPropagation()}>
                            <span className="material-icons">check</span>
                          </button>
                          <button className="icon-btn-small" title="Decline" onClick={(e) => e.stopPropagation()}>
                            <span className="material-icons">cancel</span>
                          </button>
                          <button className="icon-btn-small" title="Share" onClick={(e) => e.stopPropagation()}>
                            <span className="material-icons">share</span>
                          </button>
                        </DxcFlex>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Paginator */}
            <DxcPaginator
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredSubmissions.length}
              showGoToPage
              onPageChange={(page) => setCurrentPage(page)}
            />

          </DxcFlex>
        </div>

      </DxcFlex>
    </div>
  );
};

export default Dashboard;
