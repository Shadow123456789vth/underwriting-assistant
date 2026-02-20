import { useState, useMemo, useEffect } from 'react';
import {
  DxcHeading,
  DxcFlex,
  DxcContainer,
  DxcTypography,
  DxcTextInput,
  DxcSwitch,
  DxcTabs,
  DxcBadge,
  DxcInset,
  DxcPaginator,
  DxcButton,
  DxcChip,
  DxcSpinner,
} from '@dxc-technology/halstack-react';
import { pcSubmissions, getStatusColor } from '../../data/mockSubmissions';
import {
  isConnected,
  fetchSubmissions,
  fetchReferrals,
  fetchAIRecommendations,
} from '../../services/servicenow';
import './Dashboard.css';

// ── Map ServiceNow record → dashboard shape ───────────────────────
function mapSNSubmission(rec, referralMap, aiMap) {
  const sysId = rec.sys_id?.value || rec.sys_id;
  const ref   = referralMap[sysId] || {};
  const ai    = aiMap[sysId]       || {};

  const isFastTrack = rec.fast_track_eligible === 'true' || rec.fast_track_eligible === true;
  const isReferral  = ref.required === 'true'            || ref.required === true;

  const fmtDate = (v) => {
    if (!v) return '';
    return String(v).split(' ')[0];
  };

  const statusLabel = rec.status?.display_value || rec.status || '';

  return {
    sys_id:          sysId,
    id:              rec.number?.display_value || rec.number || sysId,
    applicantName:   rec.applicant_name?.display_value || rec.applicant_name || '',
    status:          statusLabel,
    lineOfBusiness:  rec.line_of_business?.display_value || rec.line_of_business || '',
    coverageType:    rec.coverage_type?.display_value    || rec.coverage_type    || '',
    submittedDate:   fmtDate(rec.submitted_date?.display_value || rec.submitted_date),
    receivedDate:    fmtDate(rec.received_date?.display_value  || rec.received_date),
    effectiveDate:   fmtDate(rec.effective_date?.display_value || rec.effective_date),
    daysInQueue:     parseInt(rec.days_in_queue?.display_value || rec.days_in_queue || 0, 10),
    primaryState:    rec.primary_state?.display_value || rec.primary_state || '',
    riskScore:       parseInt(rec.risk_score?.display_value || rec.risk_score || 0, 10),
    priority:        rec.priority?.display_value || rec.priority || '',
    routing: {
      decision:        rec.routing_decision?.display_value || rec.routing_decision || '',
      reason:          rec.routing_reason?.display_value   || rec.routing_reason   || '',
      fastTrackEligible: isFastTrack,
    },
    referral: {
      required: isReferral,
      reason:   ref.reason || '',
    },
    aiSuggestedRate: ai.ai_suggested_rate?.display_value || ai.ai_suggested_rate || '',
    aiConfidence:    ai.ai_confidence?.display_value     || ai.ai_confidence     || '',
  };
}

const Dashboard = ({ onSubmissionSelect, snConnected }) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isGridView, setIsGridView] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [subsetFilter, setSubsetFilter] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    quotePolicy: true, dateSubmitted: true, dateReceived: true,
    effectiveDate: true, lob: true, symbol: true,
    primaryState: true, applicant: true, transactionStatus: true,
  });

  // ── Live data state ─────────────────────────────────────────────
  const [liveSubmissions, setLiveSubmissions] = useState(null); // null = not loaded
  const [loadingData, setLoadingData]         = useState(false);
  const [dataError, setDataError]             = useState('');

  const itemsPerPage = 9;

  // ── Fetch from ServiceNow when connected ────────────────────────
  useEffect(() => {
    if (!isConnected()) return;

    setLoadingData(true);
    setDataError('');

    Promise.all([
      fetchSubmissions(),
      fetchReferrals(''),   // fetch all referrals
      fetchAIRecommendations(''), // fetch all AI recs
    ])
      .then(([subRes, refRes, aiRes]) => {
        const snSubs = subRes.result || [];
        const snRefs = refRes.result || [];
        const snAIs  = aiRes.result  || [];

        // Build lookup maps keyed by submission sys_id
        const referralMap = {};
        snRefs.forEach(r => {
          const subId = r.submission?.value || r.submission;
          if (subId) referralMap[subId] = r;
        });

        const aiMap = {};
        snAIs.forEach(a => {
          const subId = a.submission?.value || a.submission;
          if (subId) aiMap[subId] = a;
        });

        setLiveSubmissions(snSubs.map(s => mapSNSubmission(s, referralMap, aiMap)));
      })
      .catch(err => setDataError(err.message))
      .finally(() => setLoadingData(false));
  }, [snConnected]);

  // ── Use live data if available, else mock ───────────────────────
  const submissions = liveSubmissions ?? pcSubmissions;
  const isLive      = liveSubmissions !== null;

  // ── Metrics derived from live data ──────────────────────────────
  const metrics = useMemo(() => {
    if (!isLive) return {
      totalSubmissions: 12, newSubmissions: 2, quotesRequired: 6,
      writtenPremiumYTD: 24.8, pendingReview: 7,
      approvedThisMonth: 42, declinedThisMonth: 7, approvalRate: 87,
    };

    const total    = submissions.length;
    const newSubs  = submissions.filter(s => /new/i.test(s.status)).length;
    const pending  = submissions.filter(s => /pending|review/i.test(s.status)).length;
    const approved = submissions.filter(s => /approved/i.test(s.status)).length;
    const declined = submissions.filter(s => /declined/i.test(s.status)).length;
    const rate     = total > 0 ? Math.round((approved / total) * 100) : 0;

    return {
      totalSubmissions: total,
      newSubmissions:   newSubs,
      quotesRequired:   submissions.filter(s => /quote/i.test(s.status)).length,
      writtenPremiumYTD: 24.8,
      pendingReview:    pending,
      approvedThisMonth: approved,
      declinedThisMonth: declined,
      approvalRate:      rate,
    };
  }, [submissions, isLive]);

  const fastTrackCount = useMemo(
    () => submissions.filter(s => s.routing?.fastTrackEligible).length,
    [submissions]
  );
  const referralCount = useMemo(
    () => submissions.filter(s => s.referral?.required).length,
    [submissions]
  );

  const workflowGroups = useMemo(() => [
    { key: 'new_business',   label: 'New Business',        count: metrics.newSubmissions },
    { key: 'quote_required', label: 'Quote Required',       count: metrics.quotesRequired },
    { key: 'referral',       label: 'Referral Required',    count: referralCount },
    { key: 'fast_track',     label: 'Fast-Track Eligible',  count: fastTrackCount },
    { key: 'pending_review', label: 'Pending Review',       count: metrics.pendingReview },
    { key: 'approved',       label: 'Approved This Month',  count: metrics.approvedThisMonth },
    { key: 'declined',       label: 'Declined This Month',  count: metrics.declinedThisMonth },
  ], [metrics, fastTrackCount, referralCount]);

  const filteredSubmissions = useMemo(() => {
    let filtered = [...submissions];
    if (activeTabIndex === 1) filtered = filtered.filter(s => s.status === 'Pending Review');
    else if (activeTabIndex === 2) filtered = filtered.filter(s => s.status === 'Approved');

    if (subsetFilter) {
      switch (subsetFilter) {
        case 'referral':      filtered = filtered.filter(s => s.referral?.required); break;
        case 'fast_track':    filtered = filtered.filter(s => s.routing?.fastTrackEligible); break;
        case 'pending_review':filtered = filtered.filter(s => s.status === 'Pending Review'); break;
        case 'approved':      filtered = filtered.filter(s => s.status === 'Approved'); break;
        default: break;
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
    <div className="dashboard-wrapper">
      <DxcFlex direction="column" gap="var(--spacing-gap-m)">

        {/* Page Title */}
        <DxcFlex alignItems="center" gap="var(--spacing-gap-m)">
          <DxcHeading level={1} text="Dashboard" />
          {isLive && !loadingData && (
            <DxcBadge label="● Live — ServiceNow" mode="contextual" color="success" />
          )}
          {loadingData && (
            <DxcFlex alignItems="center" gap="var(--spacing-gap-xs)">
              <DxcSpinner mode="small" />
              <DxcTypography fontSize="font-scale-02" color="var(--color-fg-neutral-dark)">
                Loading from ServiceNow...
              </DxcTypography>
            </DxcFlex>
          )}
          {dataError && (
            <DxcTypography fontSize="font-scale-02" color="var(--color-fg-error-medium)">
              ⚠ {dataError}
            </DxcTypography>
          )}
        </DxcFlex>

        {/* ── Row 1: My Priorities Today + Key Metrics ── */}
        <div className="dashboard-top-row">

          {/* My Priorities Today */}
          <div className="dashboard-top-card top-card-sm">
            <DxcFlex direction="column" gap="var(--spacing-gap-m)">
              <DxcHeading level={3} text="My Priorities Today" />
              <div className="kpi-triple">

                <DxcFlex direction="column" gap="var(--spacing-gap-s)" alignItems="center" justifyContent="center" grow={1} basis="0">
                  <DxcTypography fontSize="32px" fontWeight="font-weight-semibold" color="var(--color-fg-secondary-strong)" textAlign="center">
                    {metrics.totalSubmissions}
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="var(--color-fg-neutral-stronger)" textAlign="center">
                    Total Submissions
                  </DxcTypography>
                </DxcFlex>

                <div className="kpi-divider"><div className="kpi-divider-line" /></div>

                <DxcFlex direction="column" gap="var(--spacing-gap-s)" alignItems="center" justifyContent="center" grow={1} basis="0">
                  <DxcTypography fontSize="32px" fontWeight="font-weight-semibold" color="var(--color-fg-error-medium)" textAlign="center">
                    {metrics.newSubmissions}
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="var(--color-fg-neutral-stronger)" textAlign="center">
                    New Today
                  </DxcTypography>
                </DxcFlex>

                <div className="kpi-divider"><div className="kpi-divider-line" /></div>

                <DxcFlex direction="column" gap="var(--spacing-gap-s)" alignItems="center" justifyContent="center" grow={1} basis="0">
                  <DxcTypography fontSize="32px" fontWeight="font-weight-semibold" color="var(--color-fg-warning-medium)" textAlign="center">
                    {metrics.quotesRequired}
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="var(--color-fg-neutral-stronger)" textAlign="center">
                    Quotes Required
                  </DxcTypography>
                </DxcFlex>

              </div>
            </DxcFlex>
          </div>

          {/* Key Metrics */}
          <div className="dashboard-top-card top-card-lg">
            <DxcFlex direction="column" gap="var(--spacing-gap-m)">
              <DxcHeading level={3} text="Key Metrics" />
              <div className="metrics-sub-row">

                <div className="metrics-sub-card" style={{ borderTopColor: 'var(--border-color-info-medium)' }}>
                  <div className="metrics-sub-inner">
                    <DxcTypography fontSize="12px" fontWeight="font-weight-regular" color="var(--color-fg-neutral-stronger)" textAlign="center">WRITTEN PREMIUM YTD</DxcTypography>
                    <DxcTypography fontSize="28px" fontWeight="font-weight-semibold" color="var(--color-fg-secondary-medium)" textAlign="center">${metrics.writtenPremiumYTD}M</DxcTypography>
                    <DxcTypography fontSize="12px" color="var(--color-fg-secondary-medium)" textAlign="center">+18% vs last year</DxcTypography>
                  </div>
                </div>

                <div className="metrics-sub-card" style={{ borderTopColor: 'var(--color-semantic03-400)' }}>
                  <div className="metrics-sub-inner">
                    <DxcTypography fontSize="12px" fontWeight="font-weight-regular" color="var(--color-fg-neutral-stronger)" textAlign="center">PENDING REVIEW</DxcTypography>
                    <DxcTypography fontSize="28px" fontWeight="font-weight-semibold" color="var(--color-fg-warning-medium)" textAlign="center">{metrics.pendingReview}</DxcTypography>
                    <DxcTypography fontSize="12px" color="var(--color-fg-warning-medium)" textAlign="center">3 closing today</DxcTypography>
                  </div>
                </div>

                <div className="metrics-sub-card" style={{ borderTopColor: 'var(--color-semantic02-500)' }}>
                  <div className="metrics-sub-inner">
                    <DxcTypography fontSize="12px" fontWeight="font-weight-regular" color="var(--color-fg-neutral-stronger)" textAlign="center">APPROVED THIS MONTH</DxcTypography>
                    <DxcTypography fontSize="28px" fontWeight="font-weight-semibold" color="var(--color-fg-success-medium)" textAlign="center">{metrics.approvedThisMonth}</DxcTypography>
                    <DxcTypography fontSize="12px" color="var(--color-fg-success-medium)" textAlign="center">{metrics.approvalRate}% approval rate</DxcTypography>
                  </div>
                </div>

                <div className="metrics-sub-card" style={{ borderTopColor: 'var(--color-semantic04-500)' }}>
                  <div className="metrics-sub-inner">
                    <DxcTypography fontSize="12px" fontWeight="font-weight-regular" color="var(--color-fg-neutral-stronger)" textAlign="center">DECLINED THIS MONTH</DxcTypography>
                    <DxcTypography fontSize="28px" fontWeight="font-weight-semibold" color="var(--color-fg-error-medium)" textAlign="center">{metrics.declinedThisMonth}</DxcTypography>
                    <DxcTypography fontSize="12px" color="var(--color-fg-error-medium)" textAlign="center">{100 - metrics.approvalRate}% decline rate</DxcTypography>
                  </div>
                </div>

              </div>
            </DxcFlex>
          </div>
        </div>

        {/* ── Row 2: Processing Performance ── */}
        <div className="dashboard-card">
          <DxcFlex direction="column" gap="var(--spacing-gap-m)">
            <DxcFlex gap="var(--spacing-gap-s)" alignItems="center">
              <DxcHeading level={3} text="Processing Performance" />
              <DxcBadge label="Fast-Track" mode="contextual" color="success" />
            </DxcFlex>
            <div className="metrics-sub-row">

              <div className="metrics-sub-card" style={{ borderTopColor: '#0095FF' }}>
                <div className="metrics-sub-inner">
                  <DxcTypography fontSize="12px" fontWeight="font-weight-regular" color="var(--color-fg-neutral-stronger)" textAlign="center">FAST-TRACK ELIGIBLE</DxcTypography>
                  <DxcTypography fontSize="28px" fontWeight="font-weight-semibold" color="#0095FF" textAlign="center">{fastTrackCount}</DxcTypography>
                  <DxcTypography fontSize="12px" color="#0095FF" textAlign="center">
                    {submissions.length > 0 ? Math.round((fastTrackCount / submissions.length) * 100) : 0}% of total
                  </DxcTypography>
                </div>
              </div>

              <div className="metrics-sub-card" style={{ borderTopColor: 'var(--color-semantic02-500)' }}>
                <div className="metrics-sub-inner">
                  <DxcTypography fontSize="12px" fontWeight="font-weight-regular" color="var(--color-fg-neutral-stronger)" textAlign="center">AVG DAYS TO DECISION</DxcTypography>
                  <DxcTypography fontSize="28px" fontWeight="font-weight-semibold" color="var(--color-fg-success-medium)" textAlign="center">8</DxcTypography>
                  <DxcTypography fontSize="12px" color="var(--color-fg-success-medium)" textAlign="center">Target: ≤10 days</DxcTypography>
                </div>
              </div>

              <div className="metrics-sub-card" style={{ borderTopColor: 'var(--color-semantic03-400)' }}>
                <div className="metrics-sub-inner">
                  <DxcTypography fontSize="12px" fontWeight="font-weight-regular" color="var(--color-fg-neutral-stronger)" textAlign="center">APPROVAL RATE</DxcTypography>
                  <DxcTypography
                    fontSize="28px"
                    fontWeight="font-weight-semibold"
                    color={metrics.approvalRate >= 80 ? 'var(--color-fg-success-medium)' : 'var(--color-fg-warning-medium)'}
                    textAlign="center"
                  >
                    {metrics.approvalRate}%
                  </DxcTypography>
                  <DxcTypography
                    fontSize="12px"
                    color={metrics.approvalRate >= 80 ? 'var(--color-fg-success-medium)' : 'var(--color-fg-warning-medium)'}
                    textAlign="center"
                  >
                    {metrics.approvalRate >= 80 ? 'Meeting goal' : 'Below target'}
                  </DxcTypography>
                </div>
              </div>

            </div>
          </DxcFlex>
        </div>

        {/* ── Row 3: Department Inventory ── */}
        <div className="dashboard-card">
          <DxcFlex direction="column" gap="var(--spacing-gap-m)">
            <DxcHeading level={3} text="Department Inventory" />
            <DxcTypography fontSize="font-scale-03" color="var(--color-fg-neutral-dark)">
              Inventory organized by workflow group. Click a group to filter the submissions list below.
            </DxcTypography>
            <div className="inventory-tiles">
              {workflowGroups.map(group => (
                <div
                  key={group.key}
                  className={`inventory-tile${subsetFilter === group.key ? ' active' : ''}`}
                  onClick={() => {
                    setSubsetFilter(subsetFilter === group.key ? null : group.key);
                    setActiveTabIndex(0);
                    setCurrentPage(1);
                  }}
                >
                  <DxcTypography
                    fontSize="24px"
                    fontWeight="font-weight-semibold"
                    color={group.count > 0 ? 'var(--color-fg-secondary-medium)' : 'var(--color-fg-neutral-dark)'}
                    textAlign="center"
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
                </div>
              ))}
            </div>
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
        <div className="dashboard-card dashboard-card-padded">
          <DxcFlex direction="column" gap="var(--spacing-gap-s)">
            <DxcHeading level={3} text="My Priorities" />

            {/* Tabs */}
            <DxcTabs iconPosition="left">
              <DxcTabs.Tab label="Submissions / New Business" icon="assignment" active={activeTabIndex === 0}
                onClick={() => { setActiveTabIndex(0); setCurrentPage(1); }}>
                <div />
              </DxcTabs.Tab>
              <DxcTabs.Tab label="Quotes" icon="request_quote" active={activeTabIndex === 1}
                onClick={() => { setActiveTabIndex(1); setCurrentPage(1); }}>
                <div />
              </DxcTabs.Tab>
              <DxcTabs.Tab label="Renewals" icon="event_repeat" active={activeTabIndex === 2}
                onClick={() => { setActiveTabIndex(2); setCurrentPage(1); }}>
                <div />
              </DxcTabs.Tab>
            </DxcTabs>

            {/* Filter Bar */}
            <div className="filter-bar">
              <div className="filter-bar-search">
                <DxcTextInput
                  placeholder="Search by ID, applicant, or LOB..."
                  value={searchValue}
                  onChange={({ value }) => { setSearchValue(value); setCurrentPage(1); }}
                  size="fillParent"
                />
              </div>
              <div className="filter-bar-controls">
                {isGridView && (
                  <div style={{ position: 'relative' }}>
                    <button className="column-selector-btn" onClick={() => setShowColumnSelector(!showColumnSelector)}>
                      <DxcFlex alignItems="center" gap="var(--spacing-gap-xs)">
                        <span className="material-icons" style={{ fontSize: '18px' }}>view_column</span>
                        <span>Columns</span>
                      </DxcFlex>
                    </button>
                    {showColumnSelector && (
                      <div className="column-selector-popover">
                        <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                          {Object.entries({
                            quotePolicy: 'Quote / Policy #', dateSubmitted: 'Date Submitted',
                            dateReceived: 'Date Received', effectiveDate: 'Effective Date',
                            lob: 'LOB', symbol: 'Symbol', primaryState: 'Primary State',
                            applicant: 'Applicant', transactionStatus: 'Transaction Status',
                          }).map(([key, label]) => (
                            <label key={key} className="column-toggle-item">
                              <input type="checkbox" checked={visibleColumns[key]}
                                onChange={(e) => setVisibleColumns({ ...visibleColumns, [key]: e.target.checked })} />
                              <span>{label}</span>
                            </label>
                          ))}
                        </DxcFlex>
                      </div>
                    )}
                  </div>
                )}
                <DxcFlex gap="var(--spacing-gap-none)" alignItems="center">
                  <DxcTypography fontSize="font-scale-03" color="var(--color-fg-secondary-strong)">Card</DxcTypography>
                  <DxcSwitch checked={isGridView} onChange={(checked) => setIsGridView(checked)} />
                  <DxcTypography fontSize="font-scale-03" color="var(--color-fg-secondary-strong)">Grid</DxcTypography>
                </DxcFlex>
              </div>
            </div>

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

                        {/* Row 1: ID, name, badges + actions */}
                        <div className="submission-card-header">
                          <div className="submission-card-title">
                            <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="var(--color-fg-secondary-medium)">
                              {submission.id}
                            </DxcTypography>
                            <DxcTypography fontSize="font-scale-03">
                              {submission.applicantName}
                            </DxcTypography>
                            <DxcBadge label={submission.status} mode="contextual" color={getStatusColor(submission.status)} size="small" />
                            {submission.routing?.fastTrackEligible && (
                              <DxcBadge label="Fast-Track" mode="contextual" color="success" size="small" />
                            )}
                            {submission.referral?.required && (
                              <DxcBadge label="Referral" mode="contextual" color="warning" size="small" />
                            )}
                            {submission.daysInQueue > 0 && (
                              <DxcTypography fontSize="11px" color="var(--color-fg-neutral-dark)">
                                {submission.daysInQueue}d in queue
                              </DxcTypography>
                            )}
                          </div>
                          <div className="submission-card-actions">
                            <DxcButton icon="check" mode="tertiary" title="Approve" onClick={(e) => e.stopPropagation()} />
                            <DxcButton icon="cancel" mode="tertiary" title="Decline" onClick={(e) => e.stopPropagation()} />
                            <DxcButton icon="share" mode="tertiary" title="Share" onClick={(e) => e.stopPropagation()} />
                          </div>
                        </div>

                        {/* Row 2: AI routing */}
                        {submission.routing && (
                          <div style={{
                            padding: '6px 12px',
                            backgroundColor: submission.routing.fastTrackEligible ? 'var(--color-bg-success-lighter, #E8F5E9)' : 'var(--color-bg-warning-lighter, #FFF3E0)',
                            borderRadius: 'var(--border-radius-s)',
                            borderLeft: submission.routing.fastTrackEligible ? '3px solid var(--color-fg-success-medium)' : '3px solid var(--color-fg-warning-medium)'
                          }}>
                            <DxcTypography fontSize="11px" color="var(--color-fg-neutral-stronger)" fontWeight="font-weight-medium">
                              🤖 {submission.routing.decision} — {submission.routing.reason}
                            </DxcTypography>
                          </div>
                        )}

                        {/* Row 3: Meta details */}
                        <div className="submission-card-meta">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                            LOB: {submission.lineOfBusiness}
                          </DxcTypography>
                          <span className="meta-dot" />
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                            Submitted: {submission.submittedDate}
                          </DxcTypography>
                          <span className="meta-dot" />
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                            Received: {submission.receivedDate}
                          </DxcTypography>
                          <span className="meta-dot" />
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                            Effective: {submission.effectiveDate}
                          </DxcTypography>
                        </div>

                      </DxcFlex>
                    </DxcInset>
                  </DxcContainer>
                ))}
              </DxcFlex>
            )}

            {/* Grid View */}
            {isGridView && (
              <div className="table-scroll-wrapper">
                <table className="submissions-grid-table">
                  <thead>
                    <tr>
                      {visibleColumns.quotePolicy && <th>Quote / Policy #</th>}
                      {visibleColumns.dateSubmitted && <th>Date Submitted</th>}
                      {visibleColumns.dateReceived && <th>Date Received</th>}
                      {visibleColumns.effectiveDate && <th>Effective Date</th>}
                      {visibleColumns.lob && <th>LOB</th>}
                      {visibleColumns.symbol && <th>Symbol</th>}
                      {visibleColumns.primaryState && <th>State</th>}
                      {visibleColumns.applicant && <th>Applicant</th>}
                      {visibleColumns.transactionStatus && <th>Status</th>}
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
                            <DxcBadge label={submission.status} mode="contextual" color={getStatusColor(submission.status)} size="small" />
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
              </div>
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
