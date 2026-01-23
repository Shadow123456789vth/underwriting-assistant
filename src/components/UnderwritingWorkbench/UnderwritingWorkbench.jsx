import { useState } from 'react';
import {
  DxcHeading,
  DxcFlex,
  DxcTypography,
  DxcButton,
  DxcTabs,
  DxcBadge,
  DxcInset,
  DxcProgressBar,
  DxcTextarea,
  DxcCheckbox,
} from '@dxc-technology/halstack-react';
import { getStatusColor, getPriorityColor } from '../../data/mockSubmissions';
import { getDocumentsBySubmission } from '../../data/mockDocuments';
import { mockRiskAssessments } from '../../data/mockRiskData';
import { mockTasks, submissionSLAs } from '../../data/mockTasks';
import DocumentCard from '../shared/DocumentCard';
import DocumentUpload from '../shared/DocumentUpload';
import IDPResults from '../shared/IDPResults';
import RiskScoreCard from '../shared/RiskScoreCard';
import ContributingFactors from '../shared/ContributingFactors';
import TaskList from '../shared/TaskList';
import SLATimer from '../shared/SLATimer';
import './UnderwritingWorkbench.css';

const UnderwritingWorkbench = ({ submission }) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [notes, setNotes] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documents, setDocuments] = useState(
    submission ? getDocumentsBySubmission(submission.id) : []
  );
  const riskAssessment = submission ? mockRiskAssessments[submission.id] : null;
  const tasks = submission ? mockTasks[submission.id] : null;
  const slaData = submission ? submissionSLAs[submission.id] : null;

  if (!submission) {
    return (
      <div style={{ padding: '24px', width: '100%' }}>
        <DxcTypography>No submission selected</DxcTypography>
      </div>
    );
  }

  const requirements = [
    { id: 1, name: 'Application Form', completed: true, required: true },
    { id: 2, name: 'Medical Exam Results', completed: true, required: true },
    { id: 3, name: 'Attending Physician Statement', completed: false, required: true },
    { id: 4, name: 'Motor Vehicle Report', completed: true, required: true },
    { id: 5, name: 'Credit Report', completed: false, required: false },
    { id: 6, name: 'Financial Documents', completed: true, required: true },
  ];

  const timeline = [
    { date: '2026-01-22 09:15 AM', event: 'Submission received', user: 'System' },
    { date: '2026-01-22 09:30 AM', event: 'Assigned to Sarah Chen', user: 'System' },
    { date: '2026-01-22 10:00 AM', event: 'Initial review completed', user: 'Sarah Chen' },
    { date: '2026-01-22 11:30 AM', event: 'Medical records requested', user: 'Sarah Chen' },
  ];

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTabIndex) {
      case 0: // Overview
        return (
          <DxcInset space="var(--spacing-padding-m)">
            <DxcFlex direction="column" gap="var(--spacing-gap-l)">
              <div>
                <DxcHeading level={4} text="Business Information" />
                <DxcFlex direction="column" gap="var(--spacing-gap-s)" style={{ marginTop: 'var(--spacing-gap-m)' }}>
                  <DxcFlex gap="var(--spacing-gap-m)">
                    <DxcFlex direction="column" gap="var(--spacing-gap-xs)" grow={1}>
                      <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
                        Business Name
                      </DxcTypography>
                      <DxcTypography fontSize="font-scale-03">
                        {submission.applicantName}
                      </DxcTypography>
                    </DxcFlex>
                    <DxcFlex direction="column" gap="var(--spacing-gap-xs)" grow={1}>
                      <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
                        Effective Date
                      </DxcTypography>
                      <DxcTypography fontSize="font-scale-03">
                        {submission.effectiveDate}
                      </DxcTypography>
                    </DxcFlex>
                  </DxcFlex>
                  <DxcFlex gap="var(--spacing-gap-m)">
                    <DxcFlex direction="column" gap="var(--spacing-gap-xs)" grow={1}>
                      <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
                        Fleet Size
                      </DxcTypography>
                      <DxcTypography fontSize="font-scale-03">
                        {submission.fleetSize ? `${submission.fleetSize} vehicles` : 'N/A'}
                      </DxcTypography>
                    </DxcFlex>
                    <DxcFlex direction="column" gap="var(--spacing-gap-xs)" grow={1}>
                      <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
                        Radius of Operation
                      </DxcTypography>
                      <DxcTypography fontSize="font-scale-03">
                        {submission.radiusOfOperation || 'N/A'}
                      </DxcTypography>
                    </DxcFlex>
                  </DxcFlex>
                </DxcFlex>
              </div>

              <div>
                <DxcHeading level={4} text="Coverage Details" />
                <DxcFlex direction="column" gap="var(--spacing-gap-s)" style={{ marginTop: 'var(--spacing-gap-m)' }}>
                  <DxcFlex gap="var(--spacing-gap-m)">
                    <DxcFlex direction="column" gap="var(--spacing-gap-xs)" grow={1}>
                      <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
                        Line of Business
                      </DxcTypography>
                      <DxcTypography fontSize="font-scale-03">
                        {submission.lineOfBusiness}
                      </DxcTypography>
                    </DxcFlex>
                    <DxcFlex direction="column" gap="var(--spacing-gap-xs)" grow={1}>
                      <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
                        Coverage Amount
                      </DxcTypography>
                      <DxcTypography fontSize="font-scale-03" color="#0095FF" fontWeight="font-weight-semibold">
                        ${submission.coverageAmount.toLocaleString()}
                      </DxcTypography>
                    </DxcFlex>
                  </DxcFlex>
                  <DxcFlex gap="var(--spacing-gap-m)">
                    <DxcFlex direction="column" gap="var(--spacing-gap-xs)" grow={1}>
                      <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
                        Vehicles
                      </DxcTypography>
                      <DxcTypography fontSize="font-scale-03">
                        {submission.vehicles || 'N/A'}
                      </DxcTypography>
                    </DxcFlex>
                    <DxcFlex direction="column" gap="var(--spacing-gap-xs)" grow={1}>
                      <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
                        Cargo Type
                      </DxcTypography>
                      <DxcTypography fontSize="font-scale-03">
                        {submission.cargo || 'N/A'}
                      </DxcTypography>
                    </DxcFlex>
                  </DxcFlex>
                </DxcFlex>
              </div>
            </DxcFlex>
          </DxcInset>
        );

      case 1: // Requirements
        return (
          <DxcInset space="var(--spacing-padding-m)">
            <DxcFlex direction="column" gap="var(--spacing-gap-m)">
              <DxcFlex justifyContent="space-between" alignItems="center">
                <DxcHeading level={4} text="Document Requirements" />
                <DxcTypography fontSize="font-scale-03" color="#0095FF">
                  {submission.requirementsComplete}% Complete
                </DxcTypography>
              </DxcFlex>
              <DxcProgressBar
                value={submission.requirementsComplete}
                showValue={false}
              />
              <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                {requirements.map((req) => (
                  <div
                    key={req.id}
                    style={{
                      padding: 'var(--spacing-padding-s)',
                      backgroundColor: req.completed ? 'var(--color-bg-success-lightest)' : 'var(--color-bg-warning-lightest)',
                      borderRadius: 'var(--border-radius-s)',
                      borderLeft: req.completed ? '4px solid #24A148' : '4px solid #FF6B00'
                    }}
                  >
                    <DxcFlex justifyContent="space-between" alignItems="center">
                      <DxcFlex gap="var(--spacing-gap-s)" alignItems="center">
                        <DxcCheckbox
                          checked={req.completed}
                          onChange={() => {}}
                        />
                        <DxcTypography fontSize="font-scale-03">
                          {req.name}
                        </DxcTypography>
                        {req.required && (
                          <DxcBadge label="Required" color="error" size="small" />
                        )}
                      </DxcFlex>
                      {!req.completed && (
                        <DxcButton
                          label="Request"
                          mode="tertiary"
                          icon="add"
                          onClick={() => {}}
                        />
                      )}
                    </DxcFlex>
                  </div>
                ))}
              </DxcFlex>
            </DxcFlex>
          </DxcInset>
        );

      case 2: // Timeline
        return (
          <DxcInset space="var(--spacing-padding-m)">
            <DxcFlex direction="column" gap="var(--spacing-gap-m)">
              <DxcHeading level={4} text="Activity Timeline" />
              <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                {timeline.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: 'var(--spacing-padding-s)',
                      backgroundColor: 'var(--color-bg-neutral-lighter)',
                      borderRadius: 'var(--border-radius-s)',
                      borderLeft: '4px solid #0095FF'
                    }}
                  >
                    <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                      <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                        {item.event}
                      </DxcTypography>
                      <DxcFlex gap="var(--spacing-gap-m)">
                        <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                          {item.date}
                        </DxcTypography>
                        <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                          by {item.user}
                        </DxcTypography>
                      </DxcFlex>
                    </DxcFlex>
                  </div>
                ))}
              </DxcFlex>
            </DxcFlex>
          </DxcInset>
        );

      case 3: // Notes
        return (
          <DxcInset space="var(--spacing-padding-m)">
            <DxcFlex direction="column" gap="var(--spacing-gap-m)">
              <DxcHeading level={4} text="Underwriting Notes" />
              <DxcTextarea
                label="Add a note"
                value={notes}
                onChange={({ value }) => setNotes(value)}
                rows={6}
                placeholder="Enter your notes here..."
              />
              <DxcFlex justifyContent="flex-end">
                <DxcButton
                  label="Save Note"
                  icon="save"
                  onClick={() => {}}
                />
              </DxcFlex>

              <div style={{ marginTop: 'var(--spacing-gap-m)' }}>
                <DxcHeading level={5} text="Previous Notes" />
                <DxcFlex direction="column" gap="var(--spacing-gap-s)" style={{ marginTop: 'var(--spacing-gap-s)' }}>
                  <div style={{
                    padding: 'var(--spacing-padding-s)',
                    backgroundColor: 'var(--color-bg-neutral-lighter)',
                    borderRadius: 'var(--border-radius-s)'
                  }}>
                    <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                      <DxcTypography fontSize="font-scale-03">
                        Applicant has controlled diabetes. Medical records show consistent management over 3 years.
                      </DxcTypography>
                      <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                        Sarah Chen - 2026-01-22 10:00 AM
                      </DxcTypography>
                    </DxcFlex>
                  </div>
                </DxcFlex>
              </div>
            </DxcFlex>
          </DxcInset>
        );

      case 4: // Documents
        return (
          <DxcInset space="var(--spacing-padding-m)">
            <DxcFlex direction="column" gap="var(--spacing-gap-l)">
              <DxcFlex justifyContent="space-between" alignItems="center">
                <DxcHeading level={4} text="Documents & IDP Extraction" />
                <DxcButton
                  label="Upload Documents"
                  icon="cloud_upload"
                  onClick={() => setShowUpload(!showUpload)}
                />
              </DxcFlex>

              {showUpload && (
                <DocumentUpload
                  submissionId={submission.id}
                  onUploadComplete={(data) => {
                    console.log('Upload complete:', data);
                    setShowUpload(false);
                  }}
                  onCancel={() => setShowUpload(false)}
                />
              )}

              {!showUpload && (
                <>
                  <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                    <DxcFlex justifyContent="space-between" alignItems="center">
                      <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                        Uploaded Documents ({documents.length})
                      </DxcTypography>
                      {selectedDocument && (
                        <DxcButton
                          label="Back to List"
                          icon="arrow_back"
                          mode="tertiary"
                          onClick={() => setSelectedDocument(null)}
                        />
                      )}
                    </DxcFlex>

                    {!selectedDocument ? (
                      <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                        {documents.map((doc) => (
                          <DocumentCard
                            key={doc.id}
                            document={doc}
                            onView={(doc) => setSelectedDocument(doc)}
                            onDownload={(doc) => console.log('Download:', doc)}
                          />
                        ))}
                        {documents.length === 0 && (
                          <div
                            style={{
                              padding: 'var(--spacing-padding-xl)',
                              textAlign: 'center',
                              backgroundColor: 'var(--color-bg-neutral-lighter)',
                              borderRadius: 'var(--border-radius-m)',
                              border: '2px dashed var(--color-border-neutral-medium)'
                            }}
                          >
                            <DxcFlex direction="column" gap="var(--spacing-gap-m)" alignItems="center">
                              <span className="material-icons" style={{ fontSize: '48px', color: 'var(--color-fg-neutral-dark)' }}>
                                folder_open
                              </span>
                              <DxcTypography fontSize="font-scale-03" color="var(--color-fg-neutral-dark)">
                                No documents uploaded yet
                              </DxcTypography>
                              <DxcButton
                                label="Upload First Document"
                                icon="cloud_upload"
                                onClick={() => setShowUpload(true)}
                              />
                            </DxcFlex>
                          </div>
                        )}
                      </DxcFlex>
                    ) : (
                      <IDPResults
                        document={selectedDocument}
                        onEdit={(field) => console.log('Edit field:', field)}
                        onValidate={() => console.log('Validate all')}
                      />
                    )}
                  </DxcFlex>
                </>
              )}
            </DxcFlex>
          </DxcInset>
        );

      case 5: // Risk Assessment
        return (
          <DxcInset space="var(--spacing-padding-m)">
            <DxcFlex direction="column" gap="var(--spacing-gap-l)">
              {riskAssessment ? (
                <>
                  <RiskScoreCard riskAssessment={riskAssessment} />
                  <ContributingFactors factors={riskAssessment.contributingFactors} />

                  {riskAssessment.thirdPartyData && (
                    <div>
                      <DxcHeading level={4} text="Third-Party Data" />
                      <div
                        style={{
                          marginTop: 'var(--spacing-gap-m)',
                          padding: 'var(--spacing-padding-m)',
                          backgroundColor: 'var(--color-bg-neutral-lightest)',
                          borderRadius: 'var(--border-radius-m)',
                          border: '1px solid var(--border-color-neutral-light)'
                        }}
                      >
                        <DxcFlex gap="var(--spacing-gap-l)" wrap="wrap">
                          {Object.entries(riskAssessment.thirdPartyData).map(([key, value]) => (
                            <DxcFlex key={key} direction="column" gap="var(--spacing-gap-xs)">
                              <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </DxcTypography>
                              <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                                {value}
                              </DxcTypography>
                            </DxcFlex>
                          ))}
                        </DxcFlex>
                      </div>
                    </div>
                  )}

                  {riskAssessment.exposureAnalysis && (
                    <div>
                      <DxcHeading level={4} text="Exposure Analysis" />
                      <div
                        style={{
                          marginTop: 'var(--spacing-gap-m)',
                          padding: 'var(--spacing-padding-m)',
                          backgroundColor: 'var(--color-bg-neutral-lightest)',
                          borderRadius: 'var(--border-radius-m)',
                          border: '1px solid var(--border-color-neutral-light)'
                        }}
                      >
                        <DxcFlex gap="var(--spacing-gap-l)" wrap="wrap">
                          {Object.entries(riskAssessment.exposureAnalysis).map(([key, value]) => (
                            <DxcFlex key={key} direction="column" gap="var(--spacing-gap-xs)">
                              <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </DxcTypography>
                              <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                                {value}
                              </DxcTypography>
                            </DxcFlex>
                          ))}
                        </DxcFlex>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ padding: 'var(--spacing-padding-xl)', textAlign: 'center' }}>
                  <DxcFlex direction="column" gap="var(--spacing-gap-m)" alignItems="center">
                    <span className="material-icons" style={{ fontSize: '48px', color: 'var(--color-fg-neutral-dark)' }}>
                      assessment
                    </span>
                    <DxcTypography fontSize="font-scale-03" color="var(--color-fg-neutral-dark)">
                      Risk assessment not yet available
                    </DxcTypography>
                  </DxcFlex>
                </div>
              )}
            </DxcFlex>
          </DxcInset>
        );

      case 6: // Tasks & SLA
        return (
          <DxcInset space="var(--spacing-padding-m)">
            <DxcFlex direction="column" gap="var(--spacing-gap-l)">
              {slaData && <SLATimer submissionSLA={slaData} />}
              {tasks && <TaskList tasks={tasks} />}

              {!tasks && !slaData && (
                <div style={{ padding: 'var(--spacing-padding-xl)', textAlign: 'center' }}>
                  <DxcFlex direction="column" gap="var(--spacing-gap-m)" alignItems="center">
                    <span className="material-icons" style={{ fontSize: '48px', color: 'var(--color-fg-neutral-dark)' }}>
                      task
                    </span>
                    <DxcTypography fontSize="font-scale-03" color="var(--color-fg-neutral-dark)">
                      No tasks or SLA data available
                    </DxcTypography>
                  </DxcFlex>
                </div>
              )}
            </DxcFlex>
          </DxcInset>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '24px', width: '100%', backgroundColor: '#f5f5f5' }}>
      <DxcFlex direction="column" gap="var(--spacing-gap-m)">
        {/* Header */}
        <DxcFlex justifyContent="space-between" alignItems="center">
          <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
            <DxcHeading level={1} text={submission.id} />
            <DxcTypography fontSize="font-scale-04" color="var(--color-fg-neutral-dark)">
              {submission.applicantName} - {submission.lineOfBusiness}
            </DxcTypography>
          </DxcFlex>
          <DxcFlex gap="var(--spacing-gap-m)" alignItems="center">
            <DxcButton
              label="Approve"
              icon="check"
              onClick={() => {}}
            />
            <DxcButton
              label="Decline"
              icon="cancel"
              mode="secondary"
              onClick={() => {}}
            />
            <DxcButton
              label="Request Info"
              icon="info"
              mode="tertiary"
              onClick={() => {}}
            />
          </DxcFlex>
        </DxcFlex>

        {/* Summary Cards */}
        <DxcFlex gap="var(--spacing-gap-m)">
          <div style={{
            backgroundColor: "var(--color-bg-neutral-lightest)",
            borderRadius: "var(--border-radius-m)",
            boxShadow: "var(--shadow-mid-02)",
            flex: 1,
            padding: "var(--spacing-padding-m)"
          }}>
            <DxcFlex direction="column" gap="var(--spacing-gap-s)">
              <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
                STATUS
              </DxcTypography>
              <DxcBadge
                label={submission.status}
                mode="contextual"
                color={getStatusColor(submission.status)}
              />
            </DxcFlex>
          </div>

          <div style={{
            backgroundColor: "var(--color-bg-neutral-lightest)",
            borderRadius: "var(--border-radius-m)",
            boxShadow: "var(--shadow-mid-02)",
            flex: 1,
            padding: "var(--spacing-padding-m)"
          }}>
            <DxcFlex direction="column" gap="var(--spacing-gap-s)">
              <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
                PRIORITY
              </DxcTypography>
              <DxcBadge
                label={submission.priority}
                mode="contextual"
                color={getPriorityColor(submission.priority)}
              />
            </DxcFlex>
          </div>

          <div style={{
            backgroundColor: "var(--color-bg-neutral-lightest)",
            borderRadius: "var(--border-radius-m)",
            boxShadow: "var(--shadow-mid-02)",
            flex: 1,
            padding: "var(--spacing-padding-m)"
          }}>
            <DxcFlex direction="column" gap="var(--spacing-gap-s)">
              <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
                COVERAGE AMOUNT
              </DxcTypography>
              <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-semibold" color="#0095FF">
                ${submission.coverageAmount.toLocaleString()}
              </DxcTypography>
            </DxcFlex>
          </div>

          <div style={{
            backgroundColor: "var(--color-bg-neutral-lightest)",
            borderRadius: "var(--border-radius-m)",
            boxShadow: "var(--shadow-mid-02)",
            flex: 1,
            padding: "var(--spacing-padding-m)"
          }}>
            <DxcFlex direction="column" gap="var(--spacing-gap-s)">
              <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
                RISK SCORE
              </DxcTypography>
              <DxcTypography
                fontSize="font-scale-04"
                fontWeight="font-weight-semibold"
                color={submission.riskScore >= 75 ? "#24A148" : submission.riskScore >= 60 ? "#FF6B00" : "#D0021B"}
              >
                {submission.riskScore}
              </DxcTypography>
            </DxcFlex>
          </div>

          <div style={{
            backgroundColor: "var(--color-bg-neutral-lightest)",
            borderRadius: "var(--border-radius-m)",
            boxShadow: "var(--shadow-mid-02)",
            flex: 1,
            padding: "var(--spacing-padding-m)"
          }}>
            <DxcFlex direction="column" gap="var(--spacing-gap-s)">
              <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
                ASSIGNED TO
              </DxcTypography>
              <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                {submission.assignedTo}
              </DxcTypography>
            </DxcFlex>
          </div>
        </DxcFlex>

        {/* Tabs Section */}
        <div style={{
          backgroundColor: "var(--color-bg-neutral-lightest)",
          borderRadius: "var(--border-radius-m)",
          boxShadow: "var(--shadow-mid-02)",
          padding: "var(--spacing-padding-l)"
        }}>
          <DxcTabs iconPosition="left">
            <DxcTabs.Tab
              label="Overview"
              icon="dashboard"
              active={activeTabIndex === 0}
              onClick={() => setActiveTabIndex(0)}
            >
              <div />
            </DxcTabs.Tab>
            <DxcTabs.Tab
              label="Requirements"
              icon="checklist"
              active={activeTabIndex === 1}
              onClick={() => setActiveTabIndex(1)}
            >
              <div />
            </DxcTabs.Tab>
            <DxcTabs.Tab
              label="Timeline"
              icon="history"
              active={activeTabIndex === 2}
              onClick={() => setActiveTabIndex(2)}
            >
              <div />
            </DxcTabs.Tab>
            <DxcTabs.Tab
              label="Notes"
              icon="notes"
              active={activeTabIndex === 3}
              onClick={() => setActiveTabIndex(3)}
            >
              <div />
            </DxcTabs.Tab>
            <DxcTabs.Tab
              label="Documents"
              icon="folder"
              active={activeTabIndex === 4}
              onClick={() => setActiveTabIndex(4)}
            >
              <div />
            </DxcTabs.Tab>
            <DxcTabs.Tab
              label="Risk Assessment"
              icon="assessment"
              active={activeTabIndex === 5}
              onClick={() => setActiveTabIndex(5)}
            >
              <div />
            </DxcTabs.Tab>
            <DxcTabs.Tab
              label="Tasks & SLA"
              icon="checklist_rtl"
              active={activeTabIndex === 6}
              onClick={() => setActiveTabIndex(6)}
            >
              <div />
            </DxcTabs.Tab>
          </DxcTabs>

          {/* Render Tab Content */}
          {renderTabContent()}
        </div>
      </DxcFlex>
    </div>
  );
};

export default UnderwritingWorkbench;
