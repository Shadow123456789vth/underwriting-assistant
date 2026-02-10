import { useState } from 'react';
import {
  DxcFlex,
  DxcTypography,
  DxcButton,
  DxcTabs,
  DxcBadge,
  DxcInset,
  DxcTextInput,
  DxcSelect,
  DxcDialog,
} from '@dxc-technology/halstack-react';
import WorkflowProgress from '../shared/WorkflowProgress';
import GuidelinesPanel from '../shared/GuidelinesPanel';
import LossRunsPanel from '../shared/LossRunsPanel';
import ReportsPanel from '../shared/ReportsPanel';
import './UnderwritingWorkbench.css';

const UnderwritingWorkbench = ({ submission }) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [uploadedDocs, setUploadedDocs] = useState([
    { id: 1, name: 'Bldg1.jpg', description: 'Pic of Building', docType: 'Auto Info', uploadedBy: 'John Smith', uploadDate: '01/01/26' },
    { id: 2, name: 'Home_Inspection.pdf', description: 'Inspection Report', docType: 'Insured Details', uploadedBy: 'Jane Gold', uploadDate: '01/01/26' },
    { id: 3, name: 'My_Healthcard.png', description: 'Health ID', docType: 'Policy Info', uploadedBy: 'John Smith', uploadDate: '01/01/26' },
  ]);
  const [notes, setNotes] = useState([
    { date: '01/02/2026', type: 'Reminder', note: 'Send a note to UW processing team to make sure they have gotten all forms' },
    { date: '12/22/2025', type: 'Reminder', note: 'Follow up with Policy draft makers' },
    { date: '12/10/2025', type: 'Task', note: 'Clone policy 123445 for future reference' },
  ]);
  const [messages, setMessages] = useState([
    { date: '01/02/26', subject: 'Verifying Liability', from: 'person@assuremail.com', message: 'Hello I need to verify a few files for this policy: 1234522' },
    { date: '11/22/25', subject: 'New System Policy', from: 'person@assuremail.com', message: 'We\'re creating a new policy in the system' },
    { date: '10/19/25', subject: 'Comprehensive Deductibles', from: 'person@assuremail.com', message: 'A question about Comprehensive Deductibles' },
    { date: '10/01/25', subject: 'Inquiry About Policy Changes', from: 'person@assuremail.com', message: 'We\'re creating a new policy in the system' },
    { date: '09/08/25', subject: 'Verifying Financial Coverage', from: 'person@assuremail.com', message: 'A question about Comprehensive Deductibles' },
    { date: '08/03/25', subject: 'Adding a New Vehicle', from: 'person@assuremail.com', message: 'Hello I need to verify a few files for this policy: 1234522' },
  ]);
  const [activeMessageTab, setActiveMessageTab] = useState(0);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [submissionAccepted, setSubmissionAccepted] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [newNoteType, setNewNoteType] = useState('Reminder');
  const [newNoteText, setNewNoteText] = useState('');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [newMessageTo, setNewMessageTo] = useState('');
  const [newMessageSubject, setNewMessageSubject] = useState('');
  const [newMessageBody, setNewMessageBody] = useState('');
  const [validationErrors] = useState([
    'Vehicles: VIN ID is invalid',
    'Coverage type is missing for Rental Reimbursement for vehicle 1',
    'Invalid contact number',
  ]);

  if (!submission) {
    return (
      <div style={{ padding: '24px', width: '100%' }}>
        <DxcTypography>No submission selected</DxcTypography>
      </div>
    );
  }

  // Mock data for the various tabs
  const mockApplicantData = {
    applicant: 'John Doe',
    address: '70 Worcester St. Boston, MA 02118',
    yearsInBusiness: '7 Years',
    ageOfPolicy: '5 Years',
    annualReceipts: '$ 5,000,000.00',
    sicCode: '1711',
  };

  const mockAgentData = {
    name: 'Mike Johnson',
    company: 'Johnson Insurance Sales',
    phone: '(859)-5551234',
    email: 'mike@johnsoninsurance.com',
    license: 'KY-INS-1928463',
  };

  const renderTabContent = () => {
    switch (activeTabIndex) {
      case 0: // Overview
        return (
          <DxcInset>
            <DxcFlex direction="column" gap="var(--spacing-gap-l)">
              {/* Workflow Progress */}
              {submission.workflow && <WorkflowProgress workflow={submission.workflow} />}

              {/* Guidelines & Authority */}
              {submission.guidelines && submission.referral && (
                <GuidelinesPanel
                  guidelines={submission.guidelines}
                  referral={submission.referral}
                  coverageAmount={submission.coverageAmount}
                />
              )}

              {/* AI-Powered Risk Assessment & Recommendations */}
              {submission.aiRecommendations && (
                <div>
                  <DxcFlex alignItems="center" gap="var(--spacing-gap-s)" style={{ marginBottom: 'var(--spacing-gap-m)' }}>
                    <span className="material-icons" style={{ color: '#1B75BB', fontSize: '24px' }}>psychology</span>
                    <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="#333333">
                      AI Risk Assessment & Recommendations
                    </DxcTypography>
                  </DxcFlex>

                  <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                    {/* AI Pricing Recommendation */}
                    {submission.aiRecommendations.pricing && (
                      <div style={{
                        padding: 'var(--spacing-padding-m)',
                        backgroundColor: '#E5F1FA',
                        borderRadius: 'var(--border-radius-s)',
                        borderLeft: '4px solid #1B75BB'
                      }}>
                        <DxcFlex gap="var(--spacing-gap-s)" alignItems="flex-start">
                          <span className="material-icons" style={{ color: '#1B75BB', fontSize: '20px' }}>lightbulb</span>
                          <div style={{ flex: 1 }}>
                            <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#1B75BB">
                              AI Pricing Recommendation
                            </DxcTypography>
                            <DxcTypography fontSize="font-scale-02" color="#333333" style={{ marginTop: '4px' }}>
                              {submission.aiRecommendations.pricing.suggestion}
                            </DxcTypography>
                            <DxcTypography fontSize="font-scale-01" color="#666666" style={{ marginTop: '8px' }}>
                              <strong>Reasoning:</strong> {submission.aiRecommendations.pricing.reasoning}
                            </DxcTypography>
                            {submission.aiRecommendations.pricing.comparable && (
                              <DxcTypography fontSize="font-scale-01" color="#666666" style={{ marginTop: '4px' }}>
                                <strong>Comparable:</strong> {submission.aiRecommendations.pricing.comparable}
                              </DxcTypography>
                            )}
                          </div>
                        </DxcFlex>
                      </div>
                    )}

                    {/* Red Flags */}
                    {submission.aiRecommendations.redFlags && submission.aiRecommendations.redFlags.length > 0 && (
                      <div>
                        <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#D02E2E" style={{ marginBottom: '8px' }}>
                          Risk Factors Identified
                        </DxcTypography>
                        <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                          {submission.aiRecommendations.redFlags.map((flag, index) => (
                            <div key={index} className="risk-row risk-row-error">
                              <span className="material-icons-outlined risk-row-icon" style={{ color: '#D02E2E' }}>warning</span>
                              <DxcFlex direction="column" gap="2px" style={{ flex: 1 }}>
                                <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#D02E2E">
                                  {typeof flag === 'string' ? flag : flag.title}
                                </DxcTypography>
                                {typeof flag === 'object' && flag.description && (
                                  <DxcTypography fontSize="font-scale-01" color="#666666">
                                    {flag.description}
                                  </DxcTypography>
                                )}
                              </DxcFlex>
                              {typeof flag === 'object' && flag.severity && (
                                <span className={`risk-severity-pill risk-severity-${flag.severity.toLowerCase()}`}>
                                  {flag.severity}
                                </span>
                              )}
                            </div>
                          ))}
                        </DxcFlex>
                      </div>
                    )}

                    {/* Positive Factors */}
                    {submission.aiRecommendations.positiveFactors && submission.aiRecommendations.positiveFactors.length > 0 && (
                      <div>
                        <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#37A526" style={{ marginBottom: '8px' }}>
                          Positive Risk Factors
                        </DxcTypography>
                        <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                          {submission.aiRecommendations.positiveFactors.map((factor, index) => (
                            <div key={index} className="risk-row risk-row-success">
                              <span className="material-icons-outlined risk-row-icon" style={{ color: '#37A526' }}>check_circle</span>
                              <DxcFlex direction="column" gap="2px" style={{ flex: 1 }}>
                                <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#37A526">
                                  {typeof factor === 'string' ? factor : factor.title}
                                </DxcTypography>
                                {typeof factor === 'object' && factor.description && (
                                  <DxcTypography fontSize="font-scale-01" color="#666666">
                                    {factor.description}
                                  </DxcTypography>
                                )}
                              </DxcFlex>
                            </div>
                          ))}
                        </DxcFlex>
                      </div>
                    )}

                    {/* Comparable Risks */}
                    {submission.aiRecommendations.comparableRisks && submission.aiRecommendations.comparableRisks.length > 0 && (
                      <div style={{
                        padding: 'var(--spacing-padding-m)',
                        backgroundColor: '#F5F5F5',
                        borderRadius: 'var(--border-radius-s)'
                      }}>
                        <DxcFlex gap="var(--spacing-gap-s)" alignItems="flex-start">
                          <span className="material-icons" style={{ color: '#666666', fontSize: '20px' }}>analytics</span>
                          <div style={{ flex: 1 }}>
                            <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">
                              Comparable Risks Analysis
                            </DxcTypography>
                            <div style={{ marginTop: '12px' }}>
                              {submission.aiRecommendations.comparableRisks.map((risk, index) => (
                                <div key={index} style={{
                                  padding: '8px 0',
                                  borderBottom: index < submission.aiRecommendations.comparableRisks.length - 1 ? '1px solid #E0E0E0' : 'none'
                                }}>
                                  <DxcTypography fontSize="font-scale-02" color="#333333" fontWeight="font-weight-medium">
                                    {risk.account || risk.name}
                                  </DxcTypography>
                                  <DxcFlex gap="var(--spacing-gap-m)" style={{ marginTop: '4px' }}>
                                    <DxcTypography fontSize="font-scale-01" color="#666666">
                                      Loss Ratio: {typeof risk.lossRatio === 'number' ? (risk.lossRatio * 100).toFixed(0) + '%' : risk.lossRatio}
                                    </DxcTypography>
                                    <DxcTypography fontSize="font-scale-01" color="#37A526" fontWeight="font-weight-semibold">
                                      Premium: ${typeof risk.premium === 'number' ? risk.premium.toLocaleString() : risk.premium}
                                    </DxcTypography>
                                  </DxcFlex>
                                </div>
                              ))}
                            </div>
                          </div>
                        </DxcFlex>
                      </div>
                    )}
                  </DxcFlex>
                </div>
              )}

              {/* Compliance & Authorization */}
              {submission.compliance && (
                <div style={{
                  padding: 'var(--spacing-padding-m)',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--border-radius-s)',
                  border: '1px solid #E0E0E0'
                }}>
                  <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                    <DxcFlex alignItems="center" gap="var(--spacing-gap-s)">
                      <span className="material-icons" style={{ color: '#1B75BB', fontSize: '24px' }}>verified_user</span>
                      <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="#333333">
                        Compliance & Authorization
                      </DxcTypography>
                    </DxcFlex>

                    {/* Compliance Checklist */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: 'var(--spacing-gap-m)'
                    }}>
                      {/* State Filing Compliance */}
                      <div style={{
                        padding: 'var(--spacing-padding-s)',
                        backgroundColor: submission.compliance.stateFilingCompliant ? '#E8F5E9' : '#FFF3E0',
                        borderRadius: 'var(--border-radius-s)',
                        borderLeft: `4px solid ${submission.compliance.stateFilingCompliant ? '#37A526' : '#FFA500'}`
                      }}>
                        <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
                          <span className="material-icons" style={{
                            color: submission.compliance.stateFilingCompliant ? '#37A526' : '#FFA500',
                            fontSize: '20px'
                          }}>
                            {submission.compliance.stateFilingCompliant ? 'check_circle' : 'warning'}
                          </span>
                          <div>
                            <DxcTypography fontSize="font-scale-01" color="#666666">
                              State Filing
                            </DxcTypography>
                            <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color={
                              submission.compliance.stateFilingCompliant ? '#37A526' : '#FFA500'
                            }>
                              {submission.compliance.stateFilingCompliant ? 'Compliant' : 'Pending'}
                            </DxcTypography>
                          </div>
                        </DxcFlex>
                      </div>

                      {/* Required Documents */}
                      <div style={{
                        padding: 'var(--spacing-padding-s)',
                        backgroundColor: submission.compliance.requiredDocsReceived ? '#E8F5E9' : '#FFF3E0',
                        borderRadius: 'var(--border-radius-s)',
                        borderLeft: `4px solid ${submission.compliance.requiredDocsReceived ? '#37A526' : '#FFA500'}`
                      }}>
                        <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
                          <span className="material-icons" style={{
                            color: submission.compliance.requiredDocsReceived ? '#37A526' : '#FFA500',
                            fontSize: '20px'
                          }}>
                            {submission.compliance.requiredDocsReceived ? 'check_circle' : 'warning'}
                          </span>
                          <div>
                            <DxcTypography fontSize="font-scale-01" color="#666666">
                              Required Documents
                            </DxcTypography>
                            <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color={
                              submission.compliance.requiredDocsReceived ? '#37A526' : '#FFA500'
                            }>
                              {submission.compliance.requiredDocsReceived ? 'Complete' : 'Incomplete'}
                            </DxcTypography>
                          </div>
                        </DxcFlex>
                      </div>

                      {/* Guidelines Followed */}
                      <div style={{
                        padding: 'var(--spacing-padding-s)',
                        backgroundColor: submission.compliance.guidelinesFollowed ? '#E8F5E9' : '#FFEBEE',
                        borderRadius: 'var(--border-radius-s)',
                        borderLeft: `4px solid ${submission.compliance.guidelinesFollowed ? '#37A526' : '#D02E2E'}`
                      }}>
                        <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
                          <span className="material-icons" style={{
                            color: submission.compliance.guidelinesFollowed ? '#37A526' : '#D02E2E',
                            fontSize: '20px'
                          }}>
                            {submission.compliance.guidelinesFollowed ? 'check_circle' : 'cancel'}
                          </span>
                          <div>
                            <DxcTypography fontSize="font-scale-01" color="#666666">
                              Guidelines
                            </DxcTypography>
                            <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color={
                              submission.compliance.guidelinesFollowed ? '#37A526' : '#D02E2E'
                            }>
                              {submission.compliance.guidelinesFollowed ? 'Followed' : 'Exception'}
                            </DxcTypography>
                          </div>
                        </DxcFlex>
                      </div>

                      {/* Authority Verified */}
                      <div style={{
                        padding: 'var(--spacing-padding-s)',
                        backgroundColor: submission.compliance.authorityVerified ? '#E8F5E9' : '#FFF3E0',
                        borderRadius: 'var(--border-radius-s)',
                        borderLeft: `4px solid ${submission.compliance.authorityVerified ? '#37A526' : '#FFA500'}`
                      }}>
                        <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
                          <span className="material-icons" style={{
                            color: submission.compliance.authorityVerified ? '#37A526' : '#FFA500',
                            fontSize: '20px'
                          }}>
                            {submission.compliance.authorityVerified ? 'check_circle' : 'pending'}
                          </span>
                          <div>
                            <DxcTypography fontSize="font-scale-01" color="#666666">
                              Authority
                            </DxcTypography>
                            <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color={
                              submission.compliance.authorityVerified ? '#37A526' : '#FFA500'
                            }>
                              {submission.compliance.authorityVerified ? 'Verified' : 'Pending'}
                            </DxcTypography>
                          </div>
                        </DxcFlex>
                      </div>
                    </div>

                    {/* Missing Documents Alert */}
                    {submission.compliance.missingDocs && submission.compliance.missingDocs.length > 0 && (
                      <div style={{
                        padding: 'var(--spacing-padding-m)',
                        backgroundColor: '#FFF3E0',
                        borderRadius: 'var(--border-radius-s)',
                        borderLeft: '4px solid #FFA500'
                      }}>
                        <DxcFlex gap="var(--spacing-gap-s)" alignItems="flex-start">
                          <span className="material-icons" style={{ color: '#FFA500', fontSize: '20px' }}>
                            description
                          </span>
                          <div style={{ flex: 1 }}>
                            <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#FFA500">
                              Missing Documents ({submission.compliance.missingDocs.length})
                            </DxcTypography>
                            <ul style={{
                              margin: '8px 0 0 0',
                              paddingLeft: '20px',
                              listStyleType: 'disc'
                            }}>
                              {submission.compliance.missingDocs.map((doc, index) => (
                                <li key={index}>
                                  <DxcTypography fontSize="font-scale-01" color="#666666">
                                    {doc}
                                  </DxcTypography>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </DxcFlex>
                      </div>
                    )}

                    {/* Referral Transparency */}
                    {submission.referral && submission.referral.required && (
                      <div style={{
                        padding: 'var(--spacing-padding-m)',
                        backgroundColor: '#FFF3E0',
                        borderRadius: 'var(--border-radius-s)',
                        borderLeft: '4px solid #FFA500'
                      }}>
                        <DxcFlex gap="var(--spacing-gap-s)" alignItems="flex-start">
                          <span className="material-icons" style={{ color: '#FFA500', fontSize: '20px' }}>
                            forward_to_inbox
                          </span>
                          <div style={{ flex: 1 }}>
                            <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#FFA500">
                              Referral Required
                            </DxcTypography>
                            <div style={{
                              marginTop: '8px',
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                              gap: 'var(--spacing-gap-m)'
                            }}>
                              <div>
                                <DxcTypography fontSize="font-scale-01" color="#666666">
                                  Refer To
                                </DxcTypography>
                                <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">
                                  {submission.referral.referTo}
                                </DxcTypography>
                              </div>
                              <div>
                                <DxcTypography fontSize="font-scale-01" color="#666666">
                                  Reason
                                </DxcTypography>
                                <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">
                                  {submission.referral.reason}
                                </DxcTypography>
                              </div>
                              <div>
                                <DxcTypography fontSize="font-scale-01" color="#666666">
                                  Guideline Reference
                                </DxcTypography>
                                <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">
                                  {submission.referral.guidelineReference}
                                </DxcTypography>
                              </div>
                            </div>
                            {submission.referral.yourLimit && (
                              <div style={{
                                marginTop: '12px',
                                padding: 'var(--spacing-padding-s)',
                                backgroundColor: '#FFFFFF',
                                borderRadius: 'var(--border-radius-s)'
                              }}>
                                <DxcTypography fontSize="font-scale-01" color="#666666">
                                  <strong>Authority Check:</strong> Your authority limit is{' '}
                                  <span style={{ color: '#37A526', fontWeight: 600 }}>
                                    ${submission.referral.yourLimit.toLocaleString()}
                                  </span>
                                  {' '}but submission coverage is{' '}
                                  <span style={{ color: '#D02E2E', fontWeight: 600 }}>
                                    ${submission.coverageAmount.toLocaleString()}
                                  </span>
                                </DxcTypography>
                              </div>
                            )}
                          </div>
                        </DxcFlex>
                      </div>
                    )}

                    {/* All Clear Message */}
                    {submission.compliance.stateFilingCompliant &&
                     submission.compliance.requiredDocsReceived &&
                     submission.compliance.guidelinesFollowed &&
                     submission.compliance.authorityVerified &&
                     (!submission.referral || !submission.referral.required) && (
                      <div style={{
                        padding: 'var(--spacing-padding-m)',
                        backgroundColor: '#E8F5E9',
                        borderRadius: 'var(--border-radius-s)',
                        textAlign: 'center'
                      }}>
                        <DxcFlex gap="var(--spacing-gap-s)" alignItems="center" justifyContent="center">
                          <span className="material-icons" style={{ color: '#37A526', fontSize: '24px' }}>
                            verified
                          </span>
                          <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#37A526">
                            ✓ All compliance and authorization requirements met
                          </DxcTypography>
                        </DxcFlex>
                      </div>
                    )}
                  </DxcFlex>
                </div>
              )}

              {/* Applicant Details - own card */}
              <div className="detail-card">
                <div className="detail-card-header">
                  <DxcFlex justifyContent="space-between" alignItems="center">
                    <DxcFlex alignItems="center" gap="var(--spacing-gap-s)">
                      <span className="material-icons-outlined" style={{ color: '#1B75BB', fontSize: '20px' }}>person_outline</span>
                      <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="#333333">
                        Applicant Details
                      </DxcTypography>
                    </DxcFlex>
                    <button className="icon-btn">
                      <span className="material-icons-outlined">edit</span>
                    </button>
                  </DxcFlex>
                </div>
                <div className="detail-card-body">
                  <div className="detail-grid">
                    <div className="detail-item">
                      <DxcTypography fontSize="font-scale-01" color="#808285">Applicant / Insured</DxcTypography>
                      <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">
                        {mockApplicantData.applicant}
                      </DxcTypography>
                    </div>
                    <div className="detail-item">
                      <DxcTypography fontSize="font-scale-01" color="#808285">Address</DxcTypography>
                      <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">
                        {mockApplicantData.address}
                      </DxcTypography>
                    </div>
                    <div className="detail-item">
                      <DxcTypography fontSize="font-scale-01" color="#808285">Years in Business</DxcTypography>
                      <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">
                        {mockApplicantData.yearsInBusiness}
                      </DxcTypography>
                    </div>
                    <div className="detail-item">
                      <DxcTypography fontSize="font-scale-01" color="#808285">Age of Policy</DxcTypography>
                      <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">
                        {mockApplicantData.ageOfPolicy}
                      </DxcTypography>
                    </div>
                    <div className="detail-item">
                      <DxcTypography fontSize="font-scale-01" color="#808285">Annual Receipts</DxcTypography>
                      <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">
                        {mockApplicantData.annualReceipts}
                      </DxcTypography>
                    </div>
                    <div className="detail-item">
                      <DxcTypography fontSize="font-scale-01" color="#808285">SIC Code</DxcTypography>
                      <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">
                        {mockApplicantData.sicCode}
                      </DxcTypography>
                    </div>
                  </div>
                </div>
              </div>

              {/* Agent / Broker Information - own card */}
              <div className="detail-card">
                <div className="detail-card-header">
                  <DxcFlex justifyContent="space-between" alignItems="center">
                    <DxcFlex alignItems="center" gap="var(--spacing-gap-s)">
                      <span className="material-icons-outlined" style={{ color: '#1B75BB', fontSize: '20px' }}>support_agent</span>
                      <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="#333333">
                        Agent / Broker Information
                      </DxcTypography>
                    </DxcFlex>
                    <button className="icon-btn">
                      <span className="material-icons-outlined">edit</span>
                    </button>
                  </DxcFlex>
                </div>
                <div className="detail-card-body">
                  <div className="detail-grid">
                    <div className="detail-item">
                      <DxcTypography fontSize="font-scale-01" color="#808285">Agent Name</DxcTypography>
                      <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">
                        {mockAgentData.name}
                      </DxcTypography>
                    </div>
                    <div className="detail-item">
                      <DxcTypography fontSize="font-scale-01" color="#808285">Company</DxcTypography>
                      <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">
                        {mockAgentData.company}
                      </DxcTypography>
                    </div>
                    <div className="detail-item">
                      <DxcTypography fontSize="font-scale-01" color="#808285">Phone</DxcTypography>
                      <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">
                        {mockAgentData.phone}
                      </DxcTypography>
                    </div>
                    <div className="detail-item">
                      <DxcTypography fontSize="font-scale-01" color="#808285">Email</DxcTypography>
                      <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">
                        {mockAgentData.email}
                      </DxcTypography>
                    </div>
                    <div className="detail-item">
                      <DxcTypography fontSize="font-scale-01" color="#808285">License</DxcTypography>
                      <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">
                        {mockAgentData.license}
                      </DxcTypography>
                    </div>
                  </div>
                </div>
              </div>
            </DxcFlex>
          </DxcInset>
        );

      case 1: // Loss Runs
        return (
          <DxcInset>
            {submission.lossRuns ? (
              <LossRunsPanel lossRuns={submission.lossRuns} />
            ) : (
              <DxcTypography>No loss runs data available</DxcTypography>
            )}
          </DxcInset>
        );

      case 2: // Reports & Inspections
        return (
          <DxcInset>
            {submission.reports ? (
              <ReportsPanel reports={submission.reports} />
            ) : (
              <DxcTypography>No reports data available</DxcTypography>
            )}
          </DxcInset>
        );

      case 3: // Policy Data
        return (
          <DxcInset>
            <DxcFlex direction="column" gap="var(--spacing-gap-l)">
              {/* General Policy / Quote Information */}
              <div className="detail-card">
                <div className="detail-card-header">
                  <DxcFlex alignItems="center" gap="var(--spacing-gap-s)">
                    <span className="material-icons-outlined" style={{ color: '#1B75BB', fontSize: '20px' }}>description</span>
                    <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="#333333">
                      General Policy / Quote Information
                    </DxcTypography>
                  </DxcFlex>
                </div>
                <div className="detail-card-body">
                  <div className="detail-grid">
                    <div className="detail-item">
                      <DxcTypography fontSize="font-scale-01" color="#808285">Company Name</DxcTypography>
                      <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">ABC Incorporated</DxcTypography>
                    </div>
                    <div className="detail-item">
                      <DxcTypography fontSize="font-scale-01" color="#808285">DBA</DxcTypography>
                      <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">ABC Construction</DxcTypography>
                    </div>
                    <div className="detail-item">
                      <DxcTypography fontSize="font-scale-01" color="#808285">Business Type</DxcTypography>
                      <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">Construction</DxcTypography>
                    </div>
                    <div className="detail-item">
                      <DxcTypography fontSize="font-scale-01" color="#808285">Years in Business</DxcTypography>
                      <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">7 Years</DxcTypography>
                    </div>
                    <div className="detail-item">
                      <DxcTypography fontSize="font-scale-01" color="#808285">Number of Employees</DxcTypography>
                      <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">50</DxcTypography>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle Details */}
              <div className="detail-card">
                <div className="detail-card-header">
                  <DxcFlex justifyContent="space-between" alignItems="center">
                    <DxcFlex alignItems="center" gap="var(--spacing-gap-s)">
                      <span className="material-icons-outlined" style={{ color: '#1B75BB', fontSize: '20px' }}>directions_car</span>
                      <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="#333333">
                        Vehicle Details
                      </DxcTypography>
                    </DxcFlex>
                    <DxcButton label="View Quote" iconPosition="after" icon="open_in_new" mode="text" onClick={() => {}} />
                  </DxcFlex>
                </div>
                <div className="detail-card-body">
                  <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                    <DxcSelect
                      label="Select Vehicle"
                      options={[{ label: '1998 Ford Focus - 123xxx', value: '1' }]}
                      value="1"
                    />
                    <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">
                      Vehicle 1 - 1998 Ford Focus - 123xxx
                    </DxcTypography>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <DxcTypography fontSize="font-scale-01" color="#808285">Year</DxcTypography>
                        <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">1998</DxcTypography>
                      </div>
                      <div className="detail-item">
                        <DxcTypography fontSize="font-scale-01" color="#808285">Cost New</DxcTypography>
                        <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">$12,299.00</DxcTypography>
                      </div>
                      <div className="detail-item">
                        <DxcTypography fontSize="font-scale-01" color="#808285">Make</DxcTypography>
                        <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">Ford</DxcTypography>
                      </div>
                      <div className="detail-item">
                        <DxcTypography fontSize="font-scale-01" color="#808285">State</DxcTypography>
                        <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">WA</DxcTypography>
                      </div>
                      <div className="detail-item">
                        <DxcTypography fontSize="font-scale-01" color="#808285">Model</DxcTypography>
                        <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">Contour</DxcTypography>
                      </div>
                      <div className="detail-item">
                        <DxcTypography fontSize="font-scale-01" color="#808285">Territory</DxcTypography>
                        <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">001</DxcTypography>
                      </div>
                      <div className="detail-item">
                        <DxcTypography fontSize="font-scale-01" color="#808285">Body Type</DxcTypography>
                        <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">4 Door Hardtop</DxcTypography>
                      </div>
                      <div className="detail-item">
                        <DxcTypography fontSize="font-scale-01" color="#808285">Class</DxcTypography>
                        <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">9876</DxcTypography>
                      </div>
                      <div className="detail-item">
                        <DxcTypography fontSize="font-scale-01" color="#808285">VIN</DxcTypography>
                        <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">1001-1223453</DxcTypography>
                      </div>
                      <div className="detail-item">
                        <DxcTypography fontSize="font-scale-01" color="#808285">Use</DxcTypography>
                        <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">Commercial</DxcTypography>
                      </div>
                      <div className="detail-item">
                        <DxcTypography fontSize="font-scale-01" color="#808285">Vehicle Type</DxcTypography>
                        <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">Sedan</DxcTypography>
                      </div>
                      <div className="detail-item">
                        <DxcTypography fontSize="font-scale-01" color="#808285">Coverage</DxcTypography>
                        <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">
                          Liab, Comm'l, No Fault, Med Pay, Towing
                        </DxcTypography>
                      </div>
                      <div className="detail-item">
                        <DxcTypography fontSize="font-scale-01" color="#808285">Symbol</DxcTypography>
                        <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">10</DxcTypography>
                      </div>
                    </div>
                  </DxcFlex>
                </div>
              </div>

              {/* Driver Details */}
              <div className="detail-card">
                <div className="detail-card-header">
                  <DxcFlex alignItems="center" gap="var(--spacing-gap-s)">
                    <span className="material-icons-outlined" style={{ color: '#1B75BB', fontSize: '20px' }}>person_outline</span>
                    <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="#333333">
                      Driver Details
                    </DxcTypography>
                  </DxcFlex>
                </div>
                <div className="detail-card-body">
                  <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                    <DxcSelect
                      label="Select Driver"
                      options={[{ label: 'Scott Carpenter', value: '1' }]}
                      value="1"
                    />
                    {/* Driver Codes grid subordinate to Driver Details */}
                    <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">
                      Driver Codes
                    </DxcTypography>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Description</th>
                          <th>Effective Date</th>
                          <th>Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>DV01</td>
                          <td>Clean Record Discount</td>
                          <td>01/01/2026</td>
                          <td>0</td>
                        </tr>
                        <tr>
                          <td>DV05</td>
                          <td>Defensive Driving Course</td>
                          <td>06/15/2025</td>
                          <td>-2</td>
                        </tr>
                      </tbody>
                    </table>
                  </DxcFlex>
                </div>
              </div>
            </DxcFlex>
          </DxcInset>
        );

      case 4: // Data Reports
        return (
          <DxcInset>
            <DxcFlex direction="column" gap="var(--spacing-gap-l)">
              {/* Customer/Business Data Reports */}
              <div className="detail-card">
                <div className="detail-card-header">
                  <DxcFlex alignItems="center" gap="var(--spacing-gap-s)">
                    <span className="material-icons-outlined" style={{ color: '#1B75BB', fontSize: '20px' }}>assessment</span>
                    <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="#333333">
                      Customer / Business Data Reports
                    </DxcTypography>
                  </DxcFlex>
                </div>
                <div className="detail-card-body">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Report</th>
                        <th>Source</th>
                        <th>Status</th>
                        <th>Date Ordered</th>
                        <th>Results (If Available)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <a href="#" className="table-link">
                            Credit Score
                            <span className="material-icons-outlined external-link-icon">open_in_new</span>
                          </a>
                        </td>
                        <td>Dun & Bradstreet</td>
                        <td><span className="status-pill status-available">Available</span></td>
                        <td>08/03/2011</td>
                        <td>Excellent</td>
                      </tr>
                      <tr>
                        <td>
                          <a href="#" className="table-link">
                            Prior Claims
                            <span className="material-icons-outlined external-link-icon">open_in_new</span>
                          </a>
                        </td>
                        <td>ISO ClaimSearch</td>
                        <td><span className="status-pill status-available">Available</span></td>
                        <td>10/31/2015</td>
                        <td>0 in 5 years</td>
                      </tr>
                      <tr>
                        <td>Business License</td>
                        <td>State Database</td>
                        <td><span className="status-pill status-processing">Processing</span></td>
                        <td></td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Vehicle Details Data Reports */}
              <div className="detail-card">
                <div className="detail-card-header">
                  <DxcFlex alignItems="center" gap="var(--spacing-gap-s)">
                    <span className="material-icons-outlined" style={{ color: '#1B75BB', fontSize: '20px' }}>directions_car</span>
                    <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="#333333">
                      Vehicle Details Data Reports
                    </DxcTypography>
                  </DxcFlex>
                </div>
                <div className="detail-card-body">
                  <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                    <DxcSelect
                      label="Select Vehicle"
                      options={[{ label: '1998 Ford Focus - 123xxx', value: '1' }]}
                      value="1"
                    />
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Report</th>
                          <th>Source</th>
                          <th>Status</th>
                          <th>Date Ordered</th>
                          <th>Results (If Available)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Vehicle History</td>
                          <td>Carfax</td>
                          <td><span className="status-pill status-order">Order</span></td>
                          <td></td>
                          <td></td>
                        </tr>
                        <tr>
                          <td>
                            <a href="#" className="table-link">
                              Clue Report
                              <span className="material-icons-outlined external-link-icon">open_in_new</span>
                            </a>
                          </td>
                          <td>LexisNexis</td>
                          <td><span className="status-pill status-available">Available</span></td>
                          <td>10/31/2015</td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </DxcFlex>
                </div>
              </div>

              {/* Driver Details */}
              <div className="detail-card">
                <div className="detail-card-header">
                  <DxcFlex alignItems="center" gap="var(--spacing-gap-s)">
                    <span className="material-icons-outlined" style={{ color: '#1B75BB', fontSize: '20px' }}>person_outline</span>
                    <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="#333333">
                      Driver Details
                    </DxcTypography>
                  </DxcFlex>
                </div>
                <div className="detail-card-body">
                  <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                    <DxcSelect
                      label="Select Driver"
                      options={[{ label: 'Scott Carpenter', value: '1' }]}
                      value="1"
                    />
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Report</th>
                          <th>Source</th>
                          <th>Status</th>
                          <th>Date Ordered</th>
                          <th>Results (If Available)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Commercial MVR</td>
                          <td>LexisNexis</td>
                          <td><span className="status-pill status-order">Order</span></td>
                          <td></td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </DxcFlex>
                </div>
              </div>
            </DxcFlex>
          </DxcInset>
        );

      case 5: // Document Upload
        return (
          <DxcInset>
            <DxcFlex direction="column" gap="var(--spacing-gap-l)">
              <DxcFlex justifyContent="space-between" alignItems="center">
                <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="#333333">
                  Upload Supporting Documents
                </DxcTypography>
                <button className="link-btn" onClick={() => {}}>
                  <span className="material-icons-outlined" style={{ fontSize: '18px' }}>mail_outline</span>
                  Request Documentation
                </button>
              </DxcFlex>

              <DxcTypography fontSize="font-scale-02" color="#808285">
                Supported formats include pdf, doc, docx, xsl, xslx, jpg, and png
              </DxcTypography>

              <div className="upload-section">
                <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333" style={{ marginBottom: 'var(--spacing-gap-s)' }}>
                  Upload document
                </DxcTypography>
                <DxcFlex gap="var(--spacing-gap-m)" alignItems="flex-end">
                  <button className="select-file-btn">Select file</button>
                  <DxcTypography fontSize="font-scale-02" color="#808285">
                    or drop file
                  </DxcTypography>
                  <DxcTextInput
                    label="Description"
                    placeholder="Describe the document"
                    style={{ flex: 1 }}
                  />
                  <DxcSelect
                    label="Document Type"
                    placeholder="Choose file type"
                    options={[
                      { label: 'Auto Info', value: 'auto' },
                      { label: 'Insured Details', value: 'insured' },
                      { label: 'Policy Info', value: 'policy' },
                    ]}
                  />
                </DxcFlex>
                <DxcButton
                  label="+ Add another document"
                  mode="text"
                  onClick={() => {}}
                  style={{ marginTop: 'var(--spacing-gap-s)' }}
                />
                <DxcButton
                  label="Upload Documents"
                  icon="upload"
                  mode="primary"
                  onClick={() => {}}
                  style={{ marginTop: 'var(--spacing-gap-m)' }}
                />
              </div>

              {/* ACORD Forms Section */}
              {submission.acordForms && submission.acordForms.length > 0 && (
                <div style={{
                  padding: 'var(--spacing-padding-l)',
                  backgroundColor: '#E5F1FA',
                  borderRadius: 'var(--border-radius-m)',
                  borderLeft: '4px solid #1B75BB'
                }}>
                  <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                    <DxcFlex alignItems="center" gap="var(--spacing-gap-s)">
                      <span className="material-icons" style={{ color: '#1B75BB', fontSize: '24px' }}>
                        verified
                      </span>
                      <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="#1B75BB">
                        ACORD Forms - Auto-Extracted
                      </DxcTypography>
                    </DxcFlex>
                    {submission.acordForms.map((form, index) => (
                      <div key={index} style={{
                        padding: 'var(--spacing-padding-m)',
                        backgroundColor: '#FFFFFF',
                        borderRadius: 'var(--border-radius-s)',
                        border: '1px solid #1B75BB'
                      }}>
                        <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                          <DxcFlex justifyContent="space-between" alignItems="center">
                            <DxcFlex alignItems="center" gap="var(--spacing-gap-s)">
                              <DxcBadge
                                label={form.type}
                                mode="contextual"
                                color="info"
                              />
                              <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
                                {form.name}
                              </DxcTypography>
                            </DxcFlex>
                            <DxcBadge
                              label={`${form.confidenceScore}% confidence`}
                              mode="contextual"
                              color={form.confidenceScore >= 95 ? 'success' : form.confidenceScore >= 85 ? 'info' : 'warning'}
                            />
                          </DxcFlex>
                          <DxcFlex gap="var(--spacing-gap-l)">
                            <div>
                              <DxcTypography fontSize="font-scale-01" color="#666666">
                                Fields Extracted
                              </DxcTypography>
                              <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#37A526">
                                {form.fieldsExtracted} / {form.totalFields}
                              </DxcTypography>
                            </div>
                            <div>
                              <DxcTypography fontSize="font-scale-01" color="#666666">
                                Processing Time
                              </DxcTypography>
                              <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
                                {form.extractionTime}
                              </DxcTypography>
                            </div>
                          </DxcFlex>
                          <div style={{
                            padding: '8px 12px',
                            backgroundColor: '#E8F5E9',
                            borderRadius: '4px'
                          }}>
                            <DxcTypography fontSize="font-scale-01" color="#37A526">
                              ✓ Auto-filled {form.fieldsExtracted} fields from this form - Manual entry time saved: ~{Math.floor(form.fieldsExtracted * 0.5)} min
                            </DxcTypography>
                          </div>
                        </DxcFlex>
                      </div>
                    ))}
                  </DxcFlex>
                </div>
              )}

              <div>
                <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333" style={{ marginBottom: 'var(--spacing-gap-s)' }}>
                  Other Documents
                </DxcTypography>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Document Name</th>
                      <th>Description</th>
                      <th>Doc Type</th>
                      <th>Uploaded By</th>
                      <th>Upload Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadedDocs.map((doc) => (
                      <tr key={doc.id}>
                        <td>{doc.name}</td>
                        <td>{doc.description}</td>
                        <td>{doc.docType}</td>
                        <td>{doc.uploadedBy}</td>
                        <td>{doc.uploadDate}</td>
                        <td>
                          <DxcFlex gap="var(--spacing-gap-xs)">
                            <button className="icon-btn-small">
                              <span className="material-icons-outlined">download</span>
                            </button>
                            <button className="icon-btn-small">
                              <span className="material-icons-outlined">visibility</span>
                            </button>
                          </DxcFlex>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DxcFlex>
          </DxcInset>
        );

      case 6: // Quotation
        return (
          <DxcInset>
            <DxcFlex direction="column" gap="var(--spacing-gap-l)">
              {/* Total Annual Premium */}
              <div className="detail-card">
                <div className="detail-card-header">
                  <DxcFlex alignItems="center" gap="var(--spacing-gap-s)">
                    <span className="material-icons-outlined" style={{ color: '#1B75BB', fontSize: '20px' }}>calculate</span>
                    <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="#333333">
                      Quotation of Premium
                    </DxcTypography>
                  </DxcFlex>
                </div>
                <div className="detail-card-body">
                  <div className="total-premium-box">
                    <DxcFlex justifyContent="space-between" alignItems="center">
                      <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="#333333">
                        Total Annual Premium
                      </DxcTypography>
                      <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-bold" color="#1B75BB">
                        $11,145.00
                      </DxcTypography>
                    </DxcFlex>
                  </div>
                </div>
              </div>

              {/* Insurance Line Coverages */}
              <div className="detail-card">
                <div className="detail-card-header">
                  <DxcFlex justifyContent="space-between" alignItems="center">
                    <DxcFlex alignItems="center" gap="var(--spacing-gap-s)">
                      <span className="material-icons-outlined" style={{ color: '#1B75BB', fontSize: '20px' }}>list_alt</span>
                      <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="#333333">
                        Insurance Line Coverages
                      </DxcTypography>
                    </DxcFlex>
                    <DxcButton label="View Quote" iconPosition="after" icon="open_in_new" mode="text" onClick={() => {}} />
                  </DxcFlex>
                </div>
                <div className="detail-card-body">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Limits/Deductible</th>
                        <th>Premium</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Liability</td>
                        <td>$1,000,000 CSL</td>
                        <td>$ 5,100</td>
                      </tr>
                      <tr>
                        <td>Uninsured / Underinsured Motorist</td>
                        <td>$1,000,000</td>
                        <td>$480</td>
                      </tr>
                      <tr>
                        <td>Comprehensive Deductible</td>
                        <td>$1,000</td>
                        <td>$985</td>
                      </tr>
                      <tr>
                        <td>Collision Deductible</td>
                        <td>$1,000</td>
                        <td>$880</td>
                      </tr>
                      <tr>
                        <td>Hired and Non-Owned Auto</td>
                        <td>Included</td>
                        <td>$1,985</td>
                      </tr>
                      <tr>
                        <td>Towing and Labor</td>
                        <td>Included</td>
                        <td>$420</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Fleet Vehicles */}
              <div className="detail-card">
                <div className="detail-card-header">
                  <DxcFlex justifyContent="space-between" alignItems="center">
                    <DxcFlex alignItems="center" gap="var(--spacing-gap-s)">
                      <span className="material-icons-outlined" style={{ color: '#1B75BB', fontSize: '20px' }}>local_shipping</span>
                      <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="#333333">
                        Fleet Vehicles
                      </DxcTypography>
                    </DxcFlex>
                    <DxcButton label="View Quote" iconPosition="after" icon="open_in_new" mode="text" onClick={() => {}} />
                  </DxcFlex>
                </div>
                <div className="detail-card-body">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Vehicle</th>
                        <th>Use</th>
                        <th>Stated Value</th>
                        <th>Comp</th>
                        <th>Collision</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>1</td>
                        <td>F-150 (2023)</td>
                        <td>Service</td>
                        <td>$ 45,100</td>
                        <td>$ 280</td>
                        <td>$ 450</td>
                        <td>$ 46,500</td>
                      </tr>
                      <tr>
                        <td>2</td>
                        <td>F-150 (2022)</td>
                        <td>Service</td>
                        <td>$ 40,100</td>
                        <td>$ 280</td>
                        <td>$ 400</td>
                        <td>$ 46,100</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </DxcFlex>
          </DxcInset>
        );

      case 7: // Notes/Messages
        return (
          <DxcInset>
            <DxcFlex direction="column" gap="var(--spacing-gap-l)">
              {/* Notes Section */}
              <div className="detail-card">
                <div className="detail-card-header">
                  <DxcFlex justifyContent="space-between" alignItems="center">
                    <DxcFlex alignItems="center" gap="var(--spacing-gap-s)">
                      <span className="material-icons-outlined" style={{ color: '#1B75BB', fontSize: '20px' }}>sticky_note_2</span>
                      <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="#333333">
                        Notes
                      </DxcTypography>
                    </DxcFlex>
                    <DxcButton
                      label="+ Add Note"
                      mode="primary"
                      onClick={() => setShowAddNoteModal(true)}
                    />
                  </DxcFlex>
                </div>
                <div className="detail-card-body">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notes.map((note, index) => (
                        <tr key={index}>
                          <td>{note.date}</td>
                          <td>
                            <DxcBadge
                              label={note.type}
                              mode="contextual"
                              color={note.type === 'Reminder' ? 'info' : 'warning'}
                            />
                          </td>
                          <td>{note.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Message Center */}
              <div className="detail-card">
                <div className="detail-card-header">
                  <DxcFlex justifyContent="space-between" alignItems="center">
                    <DxcFlex alignItems="center" gap="var(--spacing-gap-s)">
                      <span className="material-icons-outlined" style={{ color: '#1B75BB', fontSize: '20px' }}>mail_outline</span>
                      <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="#333333">
                        Message Center
                      </DxcTypography>
                    </DxcFlex>
                    <DxcButton
                      label="+ New Message"
                      mode="primary"
                      onClick={() => setShowNewMessageModal(true)}
                    />
                  </DxcFlex>
                </div>
                <div className="detail-card-body">
                  <div className="message-tabs">
                    <button
                      className={`message-tab ${activeMessageTab === 0 ? 'active' : ''}`}
                      onClick={() => setActiveMessageTab(0)}
                    >
                      Inbox
                    </button>
                    <button
                      className={`message-tab ${activeMessageTab === 1 ? 'active' : ''}`}
                      onClick={() => setActiveMessageTab(1)}
                    >
                      Sent
                    </button>
                    <button
                      className={`message-tab ${activeMessageTab === 2 ? 'active' : ''}`}
                      onClick={() => setActiveMessageTab(2)}
                    >
                      Drafts
                    </button>
                    <button
                      className={`message-tab ${activeMessageTab === 3 ? 'active' : ''}`}
                      onClick={() => setActiveMessageTab(3)}
                    >
                      Archived
                    </button>
                  </div>

                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Subject</th>
                        <th>From</th>
                        <th>Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {messages.map((msg, index) => (
                        <tr key={index}>
                          <td>{msg.date}</td>
                          <td><a href="#" className="table-link">{msg.subject}</a></td>
                          <td>{msg.from}</td>
                          <td>{msg.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </DxcFlex>
          </DxcInset>
        );

      case 8: // Actions
        return (
          <DxcInset>
            {submissionAccepted ? (
              // Success Screen
              <DxcFlex direction="column" gap="var(--spacing-gap-l)">
                <DxcTypography fontSize="font-scale-05" fontWeight="font-weight-bold" color="#37A526">
                  Success!
                </DxcTypography>

                <div className="success-message-box">
                  <DxcTypography fontSize="font-scale-02" color="#333333">
                    Submission {submission.id} has been accepted, the agent has been notified, and the quote is ready to convert to a policy.
                  </DxcTypography>
                </div>

                <DxcFlex justifyContent="flex-end" gap="var(--spacing-gap-m)">
                  <DxcButton
                    label="Email Agent"
                    icon="email"
                    mode="secondary"
                    onClick={() => {}}
                  />
                  <DxcButton
                    label="View Quote Letter"
                    icon="description"
                    mode="secondary"
                    onClick={() => {}}
                  />
                  <DxcButton
                    label="Convert Quote to Policy"
                    icon="policy"
                    onClick={() => {}}
                  />
                </DxcFlex>
              </DxcFlex>
            ) : (
              // Underwriting Actions Form
              <DxcFlex direction="column" gap="var(--spacing-gap-l)">
                <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="#333333">
                  Underwriting Actions
                </DxcTypography>

                <DxcTextInput
                  label="Subject"
                  placeholder="Subject matter"
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-gap-xs)' }}>
                  <label style={{
                    fontSize: 'var(--font-scale-02)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: '#333333'
                  }}>
                    Message (Max limit 3000 characters)
                  </label>
                  <textarea
                    className="message-textarea"
                    placeholder="Enter your text here..."
                    maxLength={3000}
                    rows={12}
                  />
                </div>

                <DxcFlex justifyContent="flex-end" gap="var(--spacing-gap-m)">
                  <DxcButton
                    label="Reassign"
                    icon="swap_horiz"
                    mode="secondary"
                    onClick={() => {}}
                  />
                  <DxcButton
                    label="Decline"
                    icon="cancel"
                    mode="secondary"
                    onClick={() => {}}
                  />
                  <DxcButton
                    label="Accept"
                    icon="check"
                    onClick={() => setShowValidationModal(true)}
                  />
                </DxcFlex>
              </DxcFlex>
            )}
          </DxcInset>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '24px', width: '100%', backgroundColor: '#f5f5f5' }}>
      {/* Page Container - wraps all content in white card */}
      <div className="page-container">
        <DxcFlex direction="column" gap="var(--spacing-gap-m)">
          {/* Breadcrumb */}
          <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
            <DxcTypography fontSize="font-scale-02" color="#808285">
              Submissions
            </DxcTypography>
            <DxcTypography fontSize="font-scale-02" color="#808285">/</DxcTypography>
            <DxcTypography fontSize="font-scale-02" color="#1B75BB">
              {submission.applicantName}
            </DxcTypography>
          </DxcFlex>

          {/* Header */}
          <DxcFlex justifyContent="space-between" alignItems="center">
            <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
              <DxcTypography fontSize="font-scale-05" fontWeight="font-weight-bold" color="#333333">
                {submission.applicantName}
              </DxcTypography>
              <DxcFlex gap="var(--spacing-gap-m)" alignItems="center">
                <DxcTypography fontSize="font-scale-02" color="#808285">
                  Submission #: {submission.id}
                </DxcTypography>
                <DxcBadge
                  label="New Business"
                  mode="contextual"
                  color="success"
                />
              </DxcFlex>
            </DxcFlex>
            <DxcFlex gap="var(--spacing-gap-m)" alignItems="center">
              <DxcButton
                label="Notes"
                icon="sticky_note_2"
                mode="secondary"
                onClick={() => setActiveTabIndex(7)}
              />
              <DxcButton
                label="Reassign"
                icon="swap_horiz"
                mode="secondary"
                onClick={() => {}}
              />
              <DxcButton
                label="Decline"
                icon="cancel"
                mode="secondary"
                onClick={() => {}}
              />
              <DxcButton
                label="Accept"
                icon="check"
                onClick={() => setShowValidationModal(true)}
              />
            </DxcFlex>
          </DxcFlex>

          {/* Tabs Section */}
          <div className="tabs-card">
            <DxcTabs iconPosition="left">
              <DxcTabs.Tab label="Overview" active={activeTabIndex === 0} onClick={() => setActiveTabIndex(0)}><div /></DxcTabs.Tab>
              <DxcTabs.Tab label="Loss Runs" active={activeTabIndex === 1} onClick={() => setActiveTabIndex(1)}><div /></DxcTabs.Tab>
              <DxcTabs.Tab label="Reports & Inspections" active={activeTabIndex === 2} onClick={() => setActiveTabIndex(2)}><div /></DxcTabs.Tab>
              <DxcTabs.Tab label="Policy Data" active={activeTabIndex === 3} onClick={() => setActiveTabIndex(3)}><div /></DxcTabs.Tab>
              <DxcTabs.Tab label="Data Reports" active={activeTabIndex === 4} onClick={() => setActiveTabIndex(4)}><div /></DxcTabs.Tab>
              <DxcTabs.Tab label="Document Upload" active={activeTabIndex === 5} onClick={() => setActiveTabIndex(5)}><div /></DxcTabs.Tab>
              <DxcTabs.Tab label="Quotation" active={activeTabIndex === 6} onClick={() => setActiveTabIndex(6)}><div /></DxcTabs.Tab>
              <DxcTabs.Tab label="Notes/ Messages" active={activeTabIndex === 7} onClick={() => setActiveTabIndex(7)}><div /></DxcTabs.Tab>
              <DxcTabs.Tab label="Actions" active={activeTabIndex === 8} onClick={() => setActiveTabIndex(8)}><div /></DxcTabs.Tab>
            </DxcTabs>

            {/* Render Tab Content */}
            <div style={{ padding: 'var(--spacing-padding-l)' }}>
              {renderTabContent()}
            </div>
          </div>
        </DxcFlex>
      </div>

      {/* Validation Error Modal */}
      {showValidationModal && (
        <DxcDialog onCloseClick={() => setShowValidationModal(false)}>
          <div style={{ padding: 'var(--spacing-padding-l)', minWidth: '500px' }}>
            <DxcFlex direction="column" gap="var(--spacing-gap-m)">
              <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-bold" color="#D0021B">
                Submission Failed
              </DxcTypography>
              <DxcTypography fontSize="font-scale-02" color="#333333">
                Submission failed due to the following reasons:
              </DxcTypography>
              <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                {validationErrors.map((error, index) => (
                  <DxcFlex key={index} alignItems="center" gap="var(--spacing-gap-s)">
                    <span className="material-icons-outlined" style={{ color: '#D0021B', fontSize: '20px' }}>error_outline</span>
                    <DxcTypography fontSize="font-scale-02" color="#333333">{error}</DxcTypography>
                  </DxcFlex>
                ))}
              </DxcFlex>
              <DxcFlex justifyContent="space-between">
                <DxcButton label="Back to Review" mode="secondary" onClick={() => setShowValidationModal(false)} />
                <DxcButton
                  label="Accept Anyway"
                  mode="primary"
                  onClick={() => {
                    setShowValidationModal(false);
                    setSubmissionAccepted(true);
                    setActiveTabIndex(8);
                  }}
                />
              </DxcFlex>
            </DxcFlex>
          </div>
        </DxcDialog>
      )}

      {/* Add Note Modal */}
      {showAddNoteModal && (
        <DxcDialog onCloseClick={() => setShowAddNoteModal(false)}>
          <div style={{ padding: 'var(--spacing-padding-l)', minWidth: '500px' }}>
            <DxcFlex direction="column" gap="var(--spacing-gap-m)">
              <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-bold" color="#333333">
                Add Note
              </DxcTypography>
              <DxcSelect
                label="Type"
                options={[
                  { label: 'Reminder', value: 'Reminder' },
                  { label: 'Task', value: 'Task' },
                  { label: 'General', value: 'General' },
                ]}
                value={newNoteType}
                onChange={(value) => setNewNoteType(value)}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-gap-xs)' }}>
                <label style={{ fontSize: 'var(--font-scale-02)', fontWeight: 'var(--font-weight-semibold)', color: '#333333' }}>
                  Note
                </label>
                <textarea
                  className="message-textarea"
                  placeholder="Enter your text here..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  rows={6}
                />
              </div>
              <DxcFlex justifyContent="flex-end" gap="var(--spacing-gap-m)">
                <DxcButton label="Cancel" mode="secondary" onClick={() => { setShowAddNoteModal(false); setNewNoteText(''); setNewNoteType('Reminder'); }} />
                <DxcButton
                  label="Add"
                  mode="primary"
                  onClick={() => {
                    const newNote = { date: new Date().toLocaleDateString(), type: newNoteType, note: newNoteText };
                    setNotes([newNote, ...notes]);
                    setShowAddNoteModal(false);
                    setNewNoteText('');
                    setNewNoteType('Reminder');
                  }}
                />
              </DxcFlex>
            </DxcFlex>
          </div>
        </DxcDialog>
      )}

      {/* New Message Modal */}
      {showNewMessageModal && (
        <DxcDialog onCloseClick={() => setShowNewMessageModal(false)}>
          <div style={{ padding: 'var(--spacing-padding-l)', minWidth: '600px' }}>
            <DxcFlex direction="column" gap="var(--spacing-gap-m)">
              <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-bold" color="#333333">
                New Message
              </DxcTypography>
              <DxcTextInput label="To" placeholder="Enter recipient email..." value={newMessageTo} onChange={({ value }) => setNewMessageTo(value)} size="fillParent" />
              <DxcTextInput label="Subject" placeholder="Enter message subject..." value={newMessageSubject} onChange={({ value }) => setNewMessageSubject(value)} size="fillParent" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-gap-xs)' }}>
                <label style={{ fontSize: 'var(--font-scale-02)', fontWeight: 'var(--font-weight-semibold)', color: '#333333' }}>
                  Message
                </label>
                <textarea
                  className="message-textarea"
                  placeholder="Enter your message here..."
                  value={newMessageBody}
                  onChange={(e) => setNewMessageBody(e.target.value)}
                  rows={8}
                />
              </div>
              <DxcFlex justifyContent="flex-end" gap="var(--spacing-gap-m)">
                <DxcButton label="Cancel" mode="secondary" onClick={() => { setShowNewMessageModal(false); setNewMessageTo(''); setNewMessageSubject(''); setNewMessageBody(''); }} />
                <DxcButton
                  label="Send Message"
                  mode="primary"
                  onClick={() => {
                    const newMessage = { date: new Date().toLocaleDateString(), subject: newMessageSubject, from: 'you@assuremail.com', message: newMessageBody };
                    setMessages([newMessage, ...messages]);
                    setShowNewMessageModal(false);
                    setNewMessageTo('');
                    setNewMessageSubject('');
                    setNewMessageBody('');
                  }}
                />
              </DxcFlex>
            </DxcFlex>
          </div>
        </DxcDialog>
      )}
    </div>
  );
};

export default UnderwritingWorkbench;
