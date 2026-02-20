import { useState, useEffect } from 'react';
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
  DxcSpinner,
} from '@dxc-technology/halstack-react';
import WorkflowProgress from '../shared/WorkflowProgress';
import GuidelinesPanel from '../shared/GuidelinesPanel';
import LossRunsPanel from '../shared/LossRunsPanel';
import ReportsPanel from '../shared/ReportsPanel';
import { isConnected, fetchAllSubmissionData } from '../../services/servicenow';
import './UnderwritingWorkbench.css';

const fmtDate = (v) => v ? String(v).split(' ')[0] : '';
const val     = (f)  => f?.display_value ?? f ?? '';
const bool    = (f)  => f === 'true' || f === true;

const UnderwritingWorkbench = ({ submission }) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  // ── Live data from ServiceNow ─────────────────────────────────
  const [liveData, setLiveData]   = useState(null);
  const [loading, setLoading]     = useState(false);
  const [dataError, setDataError] = useState('');

  // selected vehicle/driver index for Policy Data tab
  const [selVehicle, setSelVehicle] = useState(0);
  const [selDriver,  setSelDriver]  = useState(0);

  useEffect(() => {
    const sysId = submission?.sys_id;
    if (!sysId || !isConnected()) return;

    setLoading(true);
    setDataError('');
    fetchAllSubmissionData(sysId)
      .then(data => setLiveData(data))
      .catch(err => setDataError(err.message))
      .finally(() => setLoading(false));
  }, [submission?.sys_id]);

  // ── Derive working datasets (live → fallback mock) ────────────
  const uploadedDocs = liveData?.documents?.length
    ? liveData.documents.map((d, i) => ({
        id:         val(d.sys_id) || i,
        name:       val(d.file_name),
        description:val(d.description),
        docType:    val(d.document_type),
        uploadedBy: val(d.uploaded_by),
        uploadDate: fmtDate(val(d.uploaded_date)),
        status:     val(d.status),
        pageCount:  val(d.page_count),
        confidence: val(d.confidence_score),
      }))
    : [
        { id: 1, name: 'Bldg1.jpg',           description: 'Pic of Building',    docType: 'Auto Info',       uploadedBy: 'John Smith', uploadDate: '01/01/2026' },
        { id: 2, name: 'Home_Inspection.pdf',  description: 'Inspection Report',  docType: 'Insured Details', uploadedBy: 'Jane Gold',  uploadDate: '01/01/2026' },
        { id: 3, name: 'My_Healthcard.png',    description: 'Health ID',          docType: 'Policy Info',     uploadedBy: 'John Smith', uploadDate: '01/01/2026' },
      ];

  const [notes, setNotes] = useState([]);
  const [messages, setMessages] = useState([]);

  // Sync notes/messages from live data
  useEffect(() => {
    if (liveData?.notes?.length) {
      setNotes(liveData.notes.map(n => ({
        date: fmtDate(val(n.created_date)),
        type: val(n.type) || 'General',
        note: val(n.note),
      })));
    } else if (!liveData) {
      setNotes([
        { date: '01/02/2026', type: 'Reminder', note: 'Send a note to UW processing team' },
        { date: '12/22/2025', type: 'Reminder', note: 'Follow up with Policy draft makers' },
        { date: '12/10/2025', type: 'Task',     note: 'Clone policy 123445 for future reference' },
      ]);
    }
  }, [liveData]);

  useEffect(() => {
    if (liveData?.messages?.length) {
      setMessages(liveData.messages.map(m => ({
        date:    fmtDate(val(m.sent_date)),
        subject: val(m.subject),
        from:    val(m.from_email),
        message: val(m.body),
        folder:  val(m.folder) || 'inbox',
      })));
    } else if (!liveData) {
      setMessages([
        { date: '01/02/2026', subject: 'Verifying Liability',        from: 'person@assuremail.com', message: 'Hello I need to verify a few files for this policy: 1234522', folder: 'inbox' },
        { date: '11/22/2025', subject: 'New System Policy',          from: 'person@assuremail.com', message: "We're creating a new policy in the system",                   folder: 'inbox' },
        { date: '10/19/2025', subject: 'Comprehensive Deductibles',  from: 'person@assuremail.com', message: 'A question about Comprehensive Deductibles',                  folder: 'inbox' },
      ]);
    }
  }, [liveData]);
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

  // Applicant details — prefer live submission fields
  const mockApplicantData = {
    applicant:       submission?.applicantName || 'John Doe',
    address:         submission?.primaryState  ? `${submission.primaryState}` : '70 Worcester St. Boston, MA 02118',
    yearsInBusiness: submission?.years_in_business ? `${val(submission.years_in_business)} Years` : '7 Years',
    ageOfPolicy:     '5 Years',
    annualReceipts:  submission?.annual_receipts   ? `$${Number(val(submission.annual_receipts)).toLocaleString()}` : '$ 5,000,000.00',
    sicCode:         submission?.sic_code          ? val(submission.sic_code) : '1711',
    cargoType:       submission?.cargo_type        ? val(submission.cargo_type) : '',
    fleetSize:       submission?.fleet_size        ? val(submission.fleet_size) : '',
    driversCount:    submission?.drivers_count     ? val(submission.drivers_count) : '',
    priorCarrier:    submission?.prior_carrier     ? val(submission.prior_carrier) : '',
    priorPolicy:     submission?.prior_policy_number ? val(submission.prior_policy_number) : '',
  };

  const mockAgentData = {
    name: 'Mike Johnson', company: 'Johnson Insurance Sales',
    phone: '(859)-5551234', email: 'mike@johnsoninsurance.com',
    license: 'KY-INS-1928463',
  };

  // Live data shortcuts
  const vehicles      = liveData?.vehicles      || [];
  const drivers       = liveData?.drivers       || [];
  const lossRuns      = liveData?.lossRuns      || submission?.lossRuns      || [];
  const reports       = liveData?.reports       || submission?.reports       || [];
  const workflowStgs  = liveData?.workflowStages|| submission?.workflowStages|| [];
  const aiRec         = liveData?.aiRecommendations?.[0] || null;
  const compliance    = liveData?.compliance?.[0]        || null;
  const referral      = liveData?.referrals?.[0]         || submission?.referral || null;
  const uwTasks       = liveData?.tasks         || [];

  // Driver codes for selected driver
  const selectedDriverSysId = drivers[selDriver]?.sys_id?.value || drivers[selDriver]?.sys_id;
  const driverCodes = liveData ? [] : []; // fetched separately if needed

  const renderTabContent = () => {
    switch (activeTabIndex) {
      case 0: // Overview
        return (
          <DxcInset>
            <DxcFlex direction="column" gap="var(--spacing-gap-l)">

              {/* Loading / Error banner */}
              {loading && (
                <DxcFlex alignItems="center" gap="var(--spacing-gap-s)" style={{ padding: '10px 14px', background: '#E3F2FD', borderRadius: '6px' }}>
                  <DxcSpinner mode="small" />
                  <DxcTypography fontSize="font-scale-02" color="#1565c0">Loading live data from ServiceNow...</DxcTypography>
                </DxcFlex>
              )}
              {dataError && (
                <div style={{ padding: '10px 14px', background: '#FDECEA', borderRadius: '6px', borderLeft: '4px solid #c62828' }}>
                  <DxcTypography fontSize="font-scale-02" color="#c62828">⚠ {dataError}</DxcTypography>
                </div>
              )}

              {/* Workflow Progress — live stages */}
              {workflowStgs.length > 0 && (
                <WorkflowProgress workflow={{
                  stages: workflowStgs.map(s => ({
                    name:   val(s.stage_name),
                    status: val(s.status),
                  }))
                }} />
              )}
              {!workflowStgs.length && submission.workflow && <WorkflowProgress workflow={submission.workflow} />}

              {/* UW Tasks summary */}
              {uwTasks.length > 0 && (
                <div className="detail-card">
                  <div className="detail-card-header">
                    <DxcFlex alignItems="center" gap="var(--spacing-gap-s)">
                      <span className="material-icons-outlined" style={{ color: '#1B75BB', fontSize: '20px' }}>task_alt</span>
                      <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="#333333">UW Tasks ({uwTasks.length})</DxcTypography>
                    </DxcFlex>
                  </div>
                  <div className="detail-card-body">
                    <table className="data-table">
                      <thead><tr><th>Title</th><th>Category</th><th>Priority</th><th>Status</th><th>Due</th><th>SLA</th></tr></thead>
                      <tbody>
                        {uwTasks.map((t, i) => (
                          <tr key={i}>
                            <td>{val(t.title)}</td>
                            <td>{val(t.category)}</td>
                            <td><DxcBadge label={val(t.priority)||'—'} mode="contextual" color={val(t.priority)==='critical'?'error':val(t.priority)==='high'?'warning':'info'} size="small" /></td>
                            <td><DxcBadge label={val(t.status)||'—'} mode="contextual" color={val(t.status)==='completed'?'success':val(t.status)==='overdue'?'error':'warning'} size="small" /></td>
                            <td>{fmtDate(val(t.due_date))}</td>
                            <td><DxcBadge label={val(t.sla_status)||'—'} mode="contextual" color={val(t.sla_status)==='on_time'?'success':val(t.sla_status)==='breached'?'error':'warning'} size="small" /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Guidelines & Authority */}
              {submission.guidelines && referral && (
                <GuidelinesPanel
                  guidelines={submission.guidelines}
                  referral={referral}
                  coverageAmount={submission.coverageAmount}
                />
              )}

              {/* AI-Powered Risk Assessment & Recommendations */}
              {(aiRec || submission.aiRecommendations) && (() => {
                const ai = aiRec ? {
                  pricing: {
                    suggestion:  val(aiRec.pricing_suggestion),
                    reasoning:   val(aiRec.pricing_reasoning),
                    comparable:  val(aiRec.comparable_risks),
                  },
                  redFlags:        (val(aiRec.red_flags)||'').split('|').filter(Boolean).map(f=>f.trim()),
                  positiveFactors: (val(aiRec.positive_factors)||'').split('|').filter(Boolean).map(f=>f.trim()),
                  manualRate:      val(aiRec.manual_rate),
                  aiSuggestedRate: val(aiRec.ai_suggested_rate),
                  aiConfidence:    val(aiRec.ai_confidence),
                } : submission.aiRecommendations;
                return (
                <div>
                  <DxcFlex alignItems="center" gap="var(--spacing-gap-s)" style={{ marginBottom: 'var(--spacing-gap-m)' }}>
                    <span className="material-icons" style={{ color: '#1B75BB', fontSize: '24px' }}>psychology</span>
                    <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="#333333">
                      AI Risk Assessment & Recommendations
                    </DxcTypography>
                    {aiRec && <DxcBadge label={`${val(aiRec.ai_confidence)}% confidence`} mode="contextual" color={Number(val(aiRec.ai_confidence))>=85?'success':'warning'} />}
                  </DxcFlex>

                  <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                    {/* Rate comparison */}
                    {aiRec && (val(aiRec.manual_rate) || val(aiRec.ai_suggested_rate)) && (
                      <DxcFlex gap="var(--spacing-gap-m)">
                        <div style={{ flex:1, padding:'12px', background:'#F5F5F5', borderRadius:'6px', textAlign:'center' }}>
                          <DxcTypography fontSize="font-scale-01" color="#808285">Manual Rate</DxcTypography>
                          <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-bold" color="#333">${Number(val(aiRec.manual_rate)||0).toLocaleString()}</DxcTypography>
                        </div>
                        <div style={{ flex:1, padding:'12px', background:'#E5F1FA', borderRadius:'6px', textAlign:'center' }}>
                          <DxcTypography fontSize="font-scale-01" color="#1B75BB">AI Suggested Rate</DxcTypography>
                          <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-bold" color="#1B75BB">${Number(val(aiRec.ai_suggested_rate)||0).toLocaleString()}</DxcTypography>
                        </div>
                      </DxcFlex>
                    )}

                    {/* AI Pricing Recommendation */}
                    {ai.pricing && ai.pricing.suggestion && (
                      <div style={{ padding:'var(--spacing-padding-m)', backgroundColor:'#E5F1FA', borderRadius:'var(--border-radius-s)', borderLeft:'4px solid #1B75BB' }}>
                        <DxcFlex gap="var(--spacing-gap-s)" alignItems="flex-start">
                          <span className="material-icons" style={{ color:'#1B75BB', fontSize:'20px' }}>lightbulb</span>
                          <div style={{ flex:1 }}>
                            <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#1B75BB">AI Pricing Recommendation</DxcTypography>
                            <DxcTypography fontSize="font-scale-02" color="#333333" style={{ marginTop:'4px' }}>{ai.pricing.suggestion}</DxcTypography>
                            <DxcTypography fontSize="font-scale-01" color="#666666" style={{ marginTop:'8px' }}><strong>Reasoning:</strong> {ai.pricing.reasoning}</DxcTypography>
                            {ai.pricing.comparable && (
                              <DxcTypography fontSize="font-scale-01" color="#666666" style={{ marginTop:'4px' }}><strong>Comparable:</strong> {ai.pricing.comparable}</DxcTypography>
                            )}
                          </div>
                        </DxcFlex>
                      </div>
                    )}

                    {/* Red Flags */}
                    {ai.redFlags && ai.redFlags.length > 0 && (
                      <div>
                        <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#D02E2E" style={{ marginBottom:'8px' }}>Risk Factors Identified</DxcTypography>
                        <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                          {ai.redFlags.map((flag, i) => (
                            <div key={i} className="risk-row risk-row-error">
                              <span className="material-icons-outlined risk-row-icon" style={{ color:'#D02E2E' }}>warning</span>
                              <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#D02E2E">{typeof flag==='string'?flag:flag.title}</DxcTypography>
                            </div>
                          ))}
                        </DxcFlex>
                      </div>
                    )}

                    {/* Positive Factors */}
                    {ai.positiveFactors && ai.positiveFactors.length > 0 && (
                      <div>
                        <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#37A526" style={{ marginBottom:'8px' }}>Positive Risk Factors</DxcTypography>
                        <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                          {ai.positiveFactors.map((factor, i) => (
                            <div key={i} className="risk-row risk-row-success">
                              <span className="material-icons-outlined risk-row-icon" style={{ color:'#37A526' }}>check_circle</span>
                              <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#37A526">{typeof factor==='string'?factor:factor.title}</DxcTypography>
                            </div>
                          ))}
                        </DxcFlex>
                      </div>
                    )}
                  </DxcFlex>
                </div>
                );
              })()}

              {/* Compliance & Authorization */}
              {(compliance || submission.compliance) && (() => {
                const c = compliance ? {
                  stateFilingCompliant:  bool(compliance.state_filing_compliant),
                  requiredDocsReceived:  bool(compliance.required_docs_received),
                  guidelinesFollowed:    bool(compliance.guidelines_followed),
                  authorityVerified:     bool(compliance.authority_verified),
                  missingDocs: (val(compliance.missing_docs)||'').split('|').filter(Boolean).map(s=>s.trim()),
                } : submission.compliance;
                return (
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
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'var(--spacing-gap-m)' }}>
                      {[
                        { label:'State Filing',      ok: c.stateFilingCompliant, yes:'Compliant',  no:'Pending'    },
                        { label:'Required Documents', ok: c.requiredDocsReceived, yes:'Complete',   no:'Incomplete' },
                        { label:'Guidelines',         ok: c.guidelinesFollowed,   yes:'Followed',   no:'Exception'  },
                        { label:'Authority',          ok: c.authorityVerified,    yes:'Verified',   no:'Pending'    },
                      ].map(item => (
                        <div key={item.label} style={{ padding:'var(--spacing-padding-s)', backgroundColor:item.ok?'#E8F5E9':'#FFF3E0', borderRadius:'var(--border-radius-s)', borderLeft:`4px solid ${item.ok?'#37A526':'#FFA500'}` }}>
                          <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
                            <span className="material-icons" style={{ color:item.ok?'#37A526':'#FFA500', fontSize:'20px' }}>{item.ok?'check_circle':'warning'}</span>
                            <div>
                              <DxcTypography fontSize="font-scale-01" color="#666666">{item.label}</DxcTypography>
                              <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color={item.ok?'#37A526':'#FFA500'}>{item.ok?item.yes:item.no}</DxcTypography>
                            </div>
                          </DxcFlex>
                        </div>
                      ))}
                    </div>

                    {/* Missing Documents */}
                    {c.missingDocs && c.missingDocs.length > 0 && (
                      <div style={{ padding:'var(--spacing-padding-m)', backgroundColor:'#FFF3E0', borderRadius:'var(--border-radius-s)', borderLeft:'4px solid #FFA500' }}>
                        <DxcFlex gap="var(--spacing-gap-s)" alignItems="flex-start">
                          <span className="material-icons" style={{ color:'#FFA500', fontSize:'20px' }}>description</span>
                          <div style={{ flex:1 }}>
                            <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#FFA500">Missing Documents ({c.missingDocs.length})</DxcTypography>
                            <ul style={{ margin:'8px 0 0 0', paddingLeft:'20px' }}>
                              {c.missingDocs.map((doc, i) => <li key={i}><DxcTypography fontSize="font-scale-01" color="#666666">{doc}</DxcTypography></li>)}
                            </ul>
                          </div>
                        </DxcFlex>
                      </div>
                    )}

                    {/* Referral */}
                    {referral && (bool(referral.required) || referral.required===true) && (
                      <div style={{ padding:'var(--spacing-padding-m)', backgroundColor:'#FFF3E0', borderRadius:'var(--border-radius-s)', borderLeft:'4px solid #FFA500' }}>
                        <DxcFlex gap="var(--spacing-gap-s)" alignItems="flex-start">
                          <span className="material-icons" style={{ color:'#FFA500', fontSize:'20px' }}>forward_to_inbox</span>
                          <div style={{ flex:1 }}>
                            <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#FFA500">Referral Required</DxcTypography>
                            <div style={{ marginTop:'8px', display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:'var(--spacing-gap-m)' }}>
                              <div><DxcTypography fontSize="font-scale-01" color="#666666">Refer To</DxcTypography><DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333">{val(referral.refer_to)||referral.referTo||'—'}</DxcTypography></div>
                              <div><DxcTypography fontSize="font-scale-01" color="#666666">Reason</DxcTypography><DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333">{val(referral.reason)||'—'}</DxcTypography></div>
                              <div><DxcTypography fontSize="font-scale-01" color="#666666">Guideline Ref</DxcTypography><DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333">{val(referral.guideline_reference)||referral.guidelineReference||'—'}</DxcTypography></div>
                            </div>
                          </div>
                        </DxcFlex>
                      </div>
                    )}

                    {/* All Clear */}
                    {c.stateFilingCompliant && c.requiredDocsReceived && c.guidelinesFollowed && c.authorityVerified && (!referral || !bool(referral.required)) && (
                      <div style={{ padding:'var(--spacing-padding-m)', backgroundColor:'#E8F5E9', borderRadius:'var(--border-radius-s)', textAlign:'center' }}>
                        <DxcFlex gap="var(--spacing-gap-s)" alignItems="center" justifyContent="center">
                          <span className="material-icons" style={{ color:'#37A526', fontSize:'24px' }}>verified</span>
                          <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#37A526">✓ All compliance and authorization requirements met</DxcTypography>
                        </DxcFlex>
                      </div>
                    )}
                  </DxcFlex>
                </div>
                );
              })()}

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
            {lossRuns.length > 0 ? (
              <div className="detail-card">
                <div className="detail-card-header">
                  <DxcFlex alignItems="center" gap="var(--spacing-gap-s)">
                    <span className="material-icons-outlined" style={{ color: '#1B75BB', fontSize: '20px' }}>history</span>
                    <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="#333333">Loss Runs ({lossRuns.length})</DxcTypography>
                    <DxcBadge label="● Live" mode="contextual" color="success" size="small" />
                  </DxcFlex>
                </div>
                <div className="detail-card-body">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Loss Date</th><th>Claim Type</th><th>Description</th>
                        <th>Status</th><th>Incurred</th><th>Paid</th><th>Reserved</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lossRuns.map((lr, i) => (
                        <tr key={i}>
                          <td>{fmtDate(val(lr.loss_date))}</td>
                          <td>{val(lr.claim_type)}</td>
                          <td>{val(lr.description)}</td>
                          <td><DxcBadge label={val(lr.claim_status)||'—'} mode="contextual" color={val(lr.claim_status)==='closed'?'success':val(lr.claim_status)==='open'?'error':'warning'} size="small" /></td>
                          <td>${Number(val(lr.total_incurred)||0).toLocaleString()}</td>
                          <td>${Number(val(lr.total_paid)||0).toLocaleString()}</td>
                          <td>${Number(val(lr.total_reserved)||0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : submission.lossRuns ? (
              <LossRunsPanel lossRuns={submission.lossRuns} />
            ) : (
              <DxcTypography>No loss runs data available</DxcTypography>
            )}
          </DxcInset>
        );

      case 2: // Reports & Inspections
        return (
          <DxcInset>
            {reports.length > 0 ? (
              <div className="detail-card">
                <div className="detail-card-header">
                  <DxcFlex alignItems="center" gap="var(--spacing-gap-s)">
                    <span className="material-icons-outlined" style={{ color: '#1B75BB', fontSize: '20px' }}>assessment</span>
                    <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="#333333">Reports & Inspections ({reports.length})</DxcTypography>
                    <DxcBadge label="● Live" mode="contextual" color="success" size="small" />
                  </DxcFlex>
                </div>
                <div className="detail-card-body">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Report Type</th><th>Source</th><th>Status</th>
                        <th>Date Ordered</th><th>Score / Result</th><th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((r, i) => (
                        <tr key={i}>
                          <td>{val(r.report_type)}</td>
                          <td>{val(r.source)}</td>
                          <td><DxcBadge label={val(r.status)||'—'} mode="contextual" color={val(r.status)==='complete'||val(r.status)==='available'?'success':val(r.status)==='pending'?'warning':'info'} size="small" /></td>
                          <td>{fmtDate(val(r.date_ordered))}</td>
                          <td>{val(r.score)||val(r.result)||val(r.results)||'—'}</td>
                          <td>{val(r.notes)||val(r.reason)||'—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : submission.reports ? (
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
                        Vehicle Details {vehicles.length > 0 && `(${vehicles.length})`}
                      </DxcTypography>
                      {vehicles.length > 0 && <DxcBadge label="● Live" mode="contextual" color="success" size="small" />}
                    </DxcFlex>
                    <DxcButton label="View Quote" iconPosition="after" icon="open_in_new" mode="text" onClick={() => {}} />
                  </DxcFlex>
                </div>
                <div className="detail-card-body">
                  {vehicles.length > 0 ? (() => {
                    const v = vehicles[selVehicle] || vehicles[0];
                    return (
                      <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                        {vehicles.length > 1 && (
                          <DxcSelect
                            label="Select Vehicle"
                            options={vehicles.map((veh, i) => ({
                              label: `${val(veh.year) || ''} ${val(veh.make) || ''} ${val(veh.model) || ''} — ${val(veh.vin) || 'No VIN'}`.trim(),
                              value: String(i),
                            }))}
                            value={String(selVehicle)}
                            onChange={(value) => setSelVehicle(Number(value))}
                          />
                        )}
                        <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">
                          Vehicle {selVehicle + 1} — {val(v.year)} {val(v.make)} {val(v.model)}
                        </DxcTypography>
                        <div className="detail-grid">
                          {[
                            { label: 'Year',         value: val(v.year)          },
                            { label: 'Make',         value: val(v.make)          },
                            { label: 'Model',        value: val(v.model)         },
                            { label: 'VIN',          value: val(v.vin)           },
                            { label: 'Body Type',    value: val(v.body_type)     },
                            { label: 'Vehicle Type', value: val(v.vehicle_type)  },
                            { label: 'Use',          value: val(v.use)           },
                            { label: 'State',        value: val(v.state)         },
                            { label: 'Territory',    value: val(v.territory)     },
                            { label: 'Class',        value: val(v.vehicle_class) },
                            { label: 'Cost New',     value: val(v.cost_new) ? `$${Number(val(v.cost_new)).toLocaleString()}` : '' },
                            { label: 'Coverage',     value: val(v.coverage)      },
                            { label: 'Symbol',       value: val(v.symbol)        },
                          ].filter(f => f.value).map(f => (
                            <div key={f.label} className="detail-item">
                              <DxcTypography fontSize="font-scale-01" color="#808285">{f.label}</DxcTypography>
                              <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">{f.value}</DxcTypography>
                            </div>
                          ))}
                        </div>
                      </DxcFlex>
                    );
                  })() : (
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
                        <div className="detail-item"><DxcTypography fontSize="font-scale-01" color="#808285">Year</DxcTypography><DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">1998</DxcTypography></div>
                        <div className="detail-item"><DxcTypography fontSize="font-scale-01" color="#808285">Cost New</DxcTypography><DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">$12,299.00</DxcTypography></div>
                        <div className="detail-item"><DxcTypography fontSize="font-scale-01" color="#808285">Make</DxcTypography><DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">Ford</DxcTypography></div>
                        <div className="detail-item"><DxcTypography fontSize="font-scale-01" color="#808285">State</DxcTypography><DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">WA</DxcTypography></div>
                        <div className="detail-item"><DxcTypography fontSize="font-scale-01" color="#808285">Model</DxcTypography><DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">Contour</DxcTypography></div>
                        <div className="detail-item"><DxcTypography fontSize="font-scale-01" color="#808285">Territory</DxcTypography><DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">001</DxcTypography></div>
                        <div className="detail-item"><DxcTypography fontSize="font-scale-01" color="#808285">Body Type</DxcTypography><DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">4 Door Hardtop</DxcTypography></div>
                        <div className="detail-item"><DxcTypography fontSize="font-scale-01" color="#808285">Class</DxcTypography><DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">9876</DxcTypography></div>
                        <div className="detail-item"><DxcTypography fontSize="font-scale-01" color="#808285">VIN</DxcTypography><DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">1001-1223453</DxcTypography></div>
                        <div className="detail-item"><DxcTypography fontSize="font-scale-01" color="#808285">Use</DxcTypography><DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">Commercial</DxcTypography></div>
                        <div className="detail-item"><DxcTypography fontSize="font-scale-01" color="#808285">Vehicle Type</DxcTypography><DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">Sedan</DxcTypography></div>
                        <div className="detail-item"><DxcTypography fontSize="font-scale-01" color="#808285">Coverage</DxcTypography><DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">Liab, Comm'l, No Fault, Med Pay, Towing</DxcTypography></div>
                        <div className="detail-item"><DxcTypography fontSize="font-scale-01" color="#808285">Symbol</DxcTypography><DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">10</DxcTypography></div>
                      </div>
                    </DxcFlex>
                  )}
                </div>
              </div>

              {/* Driver Details */}
              <div className="detail-card">
                <div className="detail-card-header">
                  <DxcFlex alignItems="center" gap="var(--spacing-gap-s)">
                    <span className="material-icons-outlined" style={{ color: '#1B75BB', fontSize: '20px' }}>person_outline</span>
                    <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="#333333">
                      Driver Details {drivers.length > 0 && `(${drivers.length})`}
                    </DxcTypography>
                    {drivers.length > 0 && <DxcBadge label="● Live" mode="contextual" color="success" size="small" />}
                  </DxcFlex>
                </div>
                <div className="detail-card-body">
                  {drivers.length > 0 ? (() => {
                    const d = drivers[selDriver] || drivers[0];
                    const driverName = [val(d.first_name), val(d.last_name)].filter(Boolean).join(' ') || val(d.name) || `Driver ${selDriver + 1}`;
                    return (
                      <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                        {drivers.length > 1 && (
                          <DxcSelect
                            label="Select Driver"
                            options={drivers.map((dr, i) => ({
                              label: [val(dr.first_name), val(dr.last_name)].filter(Boolean).join(' ') || val(dr.name) || `Driver ${i + 1}`,
                              value: String(i),
                            }))}
                            value={String(selDriver)}
                            onChange={(value) => setSelDriver(Number(value))}
                          />
                        )}
                        <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">
                          {driverName}
                        </DxcTypography>
                        <div className="detail-grid">
                          {[
                            { label: 'First Name',        value: val(d.first_name)        },
                            { label: 'Last Name',         value: val(d.last_name)         },
                            { label: 'Date of Birth',     value: fmtDate(val(d.date_of_birth)) },
                            { label: 'License Number',    value: val(d.license_number)    },
                            { label: 'License State',     value: val(d.license_state)     },
                            { label: 'Hire Date',         value: fmtDate(val(d.hire_date)) },
                            { label: 'Experience (yrs)',  value: val(d.experience_years)  },
                            { label: 'Status',            value: val(d.status)            },
                          ].filter(f => f.value).map(f => (
                            <div key={f.label} className="detail-item">
                              <DxcTypography fontSize="font-scale-01" color="#808285">{f.label}</DxcTypography>
                              <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">{f.value}</DxcTypography>
                            </div>
                          ))}
                        </div>
                        <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">
                          Driver Codes
                        </DxcTypography>
                        <table className="data-table">
                          <thead>
                            <tr><th>Code</th><th>Description</th><th>Effective Date</th><th>Points</th></tr>
                          </thead>
                          <tbody>
                            <tr><td colSpan={4} style={{ color: '#808285', fontStyle: 'italic' }}>No driver codes on file</td></tr>
                          </tbody>
                        </table>
                      </DxcFlex>
                    );
                  })() : (
                    <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                      <DxcSelect
                        label="Select Driver"
                        options={[{ label: 'Scott Carpenter', value: '1' }]}
                        value="1"
                      />
                      <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">
                        Driver Codes
                      </DxcTypography>
                      <table className="data-table">
                        <thead>
                          <tr><th>Code</th><th>Description</th><th>Effective Date</th><th>Points</th></tr>
                        </thead>
                        <tbody>
                          <tr><td>DV01</td><td>Clean Record Discount</td><td>01/01/2026</td><td>0</td></tr>
                          <tr><td>DV05</td><td>Defensive Driving Course</td><td>06/15/2025</td><td>-2</td></tr>
                        </tbody>
                      </table>
                    </DxcFlex>
                  )}
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
                      options={vehicles.length > 0
                        ? vehicles.map((veh, i) => ({ label: `${val(veh.year) || ''} ${val(veh.make) || ''} ${val(veh.model) || ''}`.trim() || `Vehicle ${i+1}`, value: String(i) }))
                        : [{ label: '1998 Ford Focus - 123xxx', value: '1' }]}
                      value={vehicles.length > 0 ? String(selVehicle) : '1'}
                      onChange={vehicles.length > 0 ? (value) => setSelVehicle(Number(value)) : undefined}
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
                      options={drivers.length > 0
                        ? drivers.map((dr, i) => ({ label: [val(dr.first_name), val(dr.last_name)].filter(Boolean).join(' ') || val(dr.name) || `Driver ${i+1}`, value: String(i) }))
                        : [{ label: 'Scott Carpenter', value: '1' }]}
                      value={drivers.length > 0 ? String(selDriver) : '1'}
                      onChange={drivers.length > 0 ? (value) => setSelDriver(Number(value)) : undefined}
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
                Supported formats include pdf, doc, docx, xls, xlsx, jpg, and png
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
                  <div style={{ flex: 1 }}>
                    <DxcTextInput
                      label="Description"
                      placeholder="Describe the document"
                      size="fillParent"
                    />
                  </div>
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
                <div style={{ marginTop: 'var(--spacing-gap-s)' }}>
                  <DxcButton
                    label="Add Another Document"
                    icon="add"
                    mode="text"
                    onClick={() => {}}
                  />
                </div>
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
                      label="Add Note"
                      icon="add"
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
                      label="New Message"
                      icon="add"
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
                  size="fillParent"
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-gap-xs)' }}>
                  <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">
                    Message (Max 3000 characters)
                  </DxcTypography>
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
              <DxcTabs.Tab label="Notes / Messages" active={activeTabIndex === 7} onClick={() => setActiveTabIndex(7)}><div /></DxcTabs.Tab>
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
                <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">
                  Note
                </DxcTypography>
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
                <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#333333">
                  Message
                </DxcTypography>
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
