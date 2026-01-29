import { useState, useMemo } from 'react';
import {
  DxcHeading,
  DxcFlex,
  DxcTypography,
  DxcTabs,
  DxcBadge,
  DxcSelect,
  DxcInset,
} from '@dxc-technology/halstack-react';
import { pcSubmissions, getStatusColor } from '../../data/mockSubmissions';
import './Dashboard.css';

const Dashboard = ({ onSubmissionSelect }) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isGridView, setIsGridView] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Use P&C Commercial Auto submissions only
  const submissions = pcSubmissions;

  // Calculate metrics based on mockup
  const metrics = useMemo(() => {
    const totalSubmissions = 12;
    const newSubmissions = 2;
    const quotesRequired = 6;
    const writtenPremiumYTD = 24.8; // in millions
    const pendingReview = 7;
    const approvedThisMonth = 42;
    const declinedThisMonth = 7;
    const approvalRate = 87; // 42/(42+7) * 100

    return {
      totalSubmissions,
      newSubmissions,
      quotesRequired,
      writtenPremiumYTD,
      pendingReview,
      approvedThisMonth,
      declinedThisMonth,
      approvalRate,
    };
  }, []);

  // Filter submissions based on active tab
  const filteredSubmissions = useMemo(() => {
    let filtered = [...submissions];

    // Tab filtering (if needed)
    if (activeTabIndex === 1) {
      // Quotes tab
      filtered = filtered.filter(s => s.status === 'Pending Review');
    } else if (activeTabIndex === 2) {
      // Renewals tab
      filtered = filtered.filter(s => s.status === 'Approved');
    }

    return filtered;
  }, [submissions, activeTabIndex]);

  // Paginate submissions
  const paginatedSubmissions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSubmissions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSubmissions, currentPage]);

  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
  const pageOptions = Array.from({ length: totalPages }, (_, i) => ({
    label: `${i + 1}`,
    value: `${i + 1}`
  }));

  return (
    <div style={{ padding: '24px', width: '100%', backgroundColor: '#f5f5f5' }}>
      <DxcFlex direction="column" gap="var(--spacing-gap-l)">
        <DxcHeading level={1} text="Dashboard" />

        {/* Metrics Cards - Single Row */}
        <DxcFlex gap="var(--spacing-gap-m)" wrap="wrap">
          {/* Total Submissions */}
          <div className="metric-card" style={{ flex: '1 1 calc(14.28% - var(--spacing-gap-m))' }}>
            <DxcFlex direction="column" gap="var(--spacing-gap-s)">
              <DxcTypography fontSize="32px" fontWeight="font-weight-semibold" color="#0095FF">
                {metrics.totalSubmissions}
              </DxcTypography>
              <DxcTypography fontSize="14px" color="var(--color-fg-neutral-stronger)">
                Total Submissions
              </DxcTypography>
            </DxcFlex>
          </div>

          {/* New Submissions */}
          <div className="metric-card" style={{ flex: '1 1 calc(14.28% - var(--spacing-gap-m))' }}>
            <DxcFlex direction="column" gap="var(--spacing-gap-s)">
              <DxcTypography fontSize="32px" fontWeight="font-weight-semibold" color="#D0021B">
                {metrics.newSubmissions}
              </DxcTypography>
              <DxcTypography fontSize="14px" color="var(--color-fg-neutral-stronger)">
                New Submissions
              </DxcTypography>
            </DxcFlex>
          </div>

          {/* Quotes Required */}
          <div className="metric-card" style={{ flex: '1 1 calc(14.28% - var(--spacing-gap-m))' }}>
            <DxcFlex direction="column" gap="var(--spacing-gap-s)">
              <DxcTypography fontSize="32px" fontWeight="font-weight-semibold" color="#FF6B00">
                {metrics.quotesRequired}
              </DxcTypography>
              <DxcTypography fontSize="14px" color="var(--color-fg-neutral-stronger)">
                Quotes Required
              </DxcTypography>
            </DxcFlex>
          </div>

          {/* Written Premium YTD */}
          <div className="metric-card-highlight">
            <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
              <DxcTypography fontSize="12px" color="#FFFFFF">
                WRITTEN PREMIUM YTD
              </DxcTypography>
              <DxcTypography fontSize="32px" fontWeight="font-weight-semibold" color="#FFFFFF">
                ${metrics.writtenPremiumYTD}M
              </DxcTypography>
              <DxcTypography fontSize="12px" color="#FFFFFF">
                +18% vs last year
              </DxcTypography>
            </DxcFlex>
          </div>

          {/* Pending Review */}
          <div className="metric-card-warning">
            <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
              <DxcTypography fontSize="12px" color="#FFFFFF">
                PENDING REVIEW
              </DxcTypography>
              <DxcTypography fontSize="32px" fontWeight="font-weight-semibold" color="#FFFFFF">
                {metrics.pendingReview}
              </DxcTypography>
              <DxcTypography fontSize="12px" color="#FFFFFF">
                3 closing today
              </DxcTypography>
            </DxcFlex>
          </div>

          {/* Approved This Month */}
          <div className="metric-card-success">
            <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
              <DxcTypography fontSize="12px" color="#FFFFFF">
                APPROVED THIS MONTH
              </DxcTypography>
              <DxcTypography fontSize="32px" fontWeight="font-weight-semibold" color="#FFFFFF">
                {metrics.approvedThisMonth}
              </DxcTypography>
              <DxcTypography fontSize="12px" color="#FFFFFF">
                {metrics.approvalRate}% approval rate
              </DxcTypography>
            </DxcFlex>
          </div>

          {/* Declined This Month */}
          <div className="metric-card-error">
            <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
              <DxcTypography fontSize="12px" color="#FFFFFF">
                DECLINED THIS MONTH
              </DxcTypography>
              <DxcTypography fontSize="32px" fontWeight="font-weight-semibold" color="#FFFFFF">
                {metrics.declinedThisMonth}
              </DxcTypography>
              <DxcTypography fontSize="12px" color="#FFFFFF">
                13% decline rate
              </DxcTypography>
            </DxcFlex>
          </div>
        </DxcFlex>

        {/* My Priorities Section */}
        <div style={{
          backgroundColor: "var(--color-bg-neutral-lightest)",
          borderRadius: "var(--border-radius-m)",
          boxShadow: "var(--shadow-mid-02)",
          padding: "var(--spacing-padding-l)"
        }}>
          <DxcFlex direction="column" gap="var(--spacing-gap-l)">
            <DxcHeading level={3} text="My Priorities" />

            {/* Tabs */}
            <DxcTabs iconPosition="left">
              <DxcTabs.Tab
                label="Submissions/New Business"
                icon="folder_open"
                active={activeTabIndex === 0}
                onClick={() => setActiveTabIndex(0)}
              >
                <div />
              </DxcTabs.Tab>
              <DxcTabs.Tab
                label="Quotes"
                icon="request_quote"
                active={activeTabIndex === 1}
                onClick={() => setActiveTabIndex(1)}
              >
                <div />
              </DxcTabs.Tab>
              <DxcTabs.Tab
                label="Renewals and Servicing"
                icon="autorenew"
                active={activeTabIndex === 2}
                onClick={() => setActiveTabIndex(2)}
              >
                <div />
              </DxcTabs.Tab>
            </DxcTabs>

            {/* View Toggle */}
            <DxcFlex justifyContent="flex-end" alignItems="center" gap="var(--spacing-gap-m)">
              <button
                onClick={() => setIsGridView(false)}
                className={`view-toggle-btn ${!isGridView ? 'active' : ''}`}
              >
                Card View
              </button>
              <button
                onClick={() => setIsGridView(true)}
                className={`view-toggle-btn ${isGridView ? 'active' : ''}`}
              >
                Grid View
              </button>
            </DxcFlex>

            {/* Submission Cards */}
            <DxcFlex
              direction="column"
              gap="var(--spacing-gap-m)">
              {paginatedSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="submission-card"
                  onClick={() => onSubmissionSelect(submission)}
                >
                  <DxcFlex justifyContent="space-between" alignItems="center">
                    <DxcFlex direction="column" gap="var(--spacing-gap-xs)" grow={1}>
                      {/* Company Name and Status */}
                      <DxcFlex alignItems="center" gap="var(--spacing-gap-m)">
                        <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                          {submission.applicantName}
                        </DxcTypography>
                        <DxcBadge
                          label={submission.status}
                          mode="contextual"
                          color={getStatusColor(submission.status)}
                          size="small"
                        />
                      </DxcFlex>

                      {/* Submission Details */}
                      <DxcFlex gap="var(--spacing-gap-l)" wrap="wrap">
                        <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                          {submission.id}
                        </DxcTypography>
                        <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                          LOB: {submission.lineOfBusiness}
                        </DxcTypography>
                        <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                          Uploaded: {submission.submittedDate}
                        </DxcTypography>
                        <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                          Saved: {submission.receivedDate}
                        </DxcTypography>
                        <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                          Effective Date: {submission.effectiveDate}
                        </DxcTypography>
                      </DxcFlex>
                    </DxcFlex>

                    {/* Action Icons */}
                    <DxcFlex gap="var(--spacing-gap-s)" alignItems="center">
                      <button className="icon-btn" title="Share" onClick={(e) => e.stopPropagation()}>
                        <span className="material-icons">share</span>
                      </button>
                      <button className="icon-btn" title="Preview" onClick={(e) => e.stopPropagation()}>
                        <span className="material-icons">visibility</span>
                      </button>
                      <button className="icon-btn" title="Approve" onClick={(e) => e.stopPropagation()}>
                        <span className="material-icons">check</span>
                      </button>
                    </DxcFlex>
                  </DxcFlex>
                </div>
              ))}
            </DxcFlex>

            {/* Pagination */}
            <DxcFlex justifyContent="space-between" alignItems="center">
              <DxcTypography fontSize="14px">
                {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredSubmissions.length)} of {filteredSubmissions.length}
              </DxcTypography>
              <DxcFlex alignItems="center" gap="var(--spacing-gap-m)">
                <DxcTypography fontSize="14px">Go to page:</DxcTypography>
                <DxcSelect
                  options={pageOptions}
                  value={`${currentPage}`}
                  onChange={(value) => setCurrentPage(parseInt(value))}
                  margin="none"
                  size="small"
                />
              </DxcFlex>
            </DxcFlex>
          </DxcFlex>
        </div>
      </DxcFlex>
    </div>
  );
};

export default Dashboard;
