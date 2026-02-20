// ================================================================
// ServiceNow API Service
// Tables: x_dxcis_underwri_0_*
// Auth:   OAuth 2.0 - Authorization Code Grant
// ================================================================

const SN_INSTANCE   = import.meta.env.VITE_SN_INSTANCE    || 'https://nextgenbpmnp1.service-now.com';
const CLIENT_ID     = import.meta.env.VITE_SN_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_SN_CLIENT_SECRET;
const REDIRECT_URI  = import.meta.env.VITE_SN_REDIRECT_URI || 'http://localhost:5173/';
const APP_PREFIX    = import.meta.env.VITE_SN_APP_PREFIX   || 'x_dxcis_underwri_0';

const TOKEN_KEY    = 'sn_access_token';
const TOKEN_EXP_KEY= 'sn_token_expires_at';
const STATE_KEY    = 'sn_oauth_state';

// ── Token Management ──────────────────────────────────────────────

export function getStoredToken() {
  const token   = sessionStorage.getItem(TOKEN_KEY);
  const expires = sessionStorage.getItem(TOKEN_EXP_KEY);
  if (!token || !expires) return null;
  if (Date.now() >= parseInt(expires, 10)) {
    clearToken();
    return null;
  }
  return token;
}

function storeToken(token, expiresIn) {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(TOKEN_EXP_KEY, Date.now() + (expiresIn - 30) * 1000);
}

export function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_EXP_KEY);
}

export function isConnected() {
  return !!getStoredToken();
}

// ── OAuth 2.0 - Authorization Code Flow ──────────────────────────

// Step 1: Redirect browser to ServiceNow authorization page
export function connect() {
  const state = crypto.randomUUID();
  sessionStorage.setItem(STATE_KEY, state);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id:     CLIENT_ID,
    redirect_uri:  REDIRECT_URI,
    state,
  });
  window.location.href = `${SN_INSTANCE}/oauth_auth.do?${params.toString()}`;
}

// Step 2: Exchange authorization code for access token
export async function handleOAuthCallback(code, returnedState) {
  const savedState = sessionStorage.getItem(STATE_KEY);
  sessionStorage.removeItem(STATE_KEY);

  if (!savedState || savedState !== returnedState) {
    throw new Error('OAuth state mismatch — possible CSRF. Please try connecting again.');
  }

  const params = new URLSearchParams({
    grant_type:    'authorization_code',
    code,
    redirect_uri:  REDIRECT_URI,
    client_id:     CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  const res = await fetch('/api/servicenow-oauth', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    params.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token exchange failed (${res.status}): ${err}`);
  }

  const data = await res.json();

  if (!data.access_token) {
    throw new Error(data.error_description || data.error || 'No access_token returned');
  }

  storeToken(data.access_token, data.expires_in || 1800);
  return data.access_token;
}

export function disconnect() {
  clearToken();
}

// ── Base API Caller ───────────────────────────────────────────────

async function snFetch(path, options = {}) {
  let token = getStoredToken();
  if (!token) throw new Error('Not connected to ServiceNow');

  const url = `/api/servicenow-api?path=${encodeURIComponent(path)}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type':  'application/json',
      'Accept':        'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`ServiceNow API error (${res.status}): ${body}`);
  }

  return res.json();
}

// ── Table API Helpers ─────────────────────────────────────────────

function tableURL(shortName, query = '') {
  return `/api/now/table/${APP_PREFIX}_${shortName}${query ? '?' + query : ''}`;
}

function bySubmission(shortName, submissionSysId, extra = '') {
  return tableURL(
    shortName,
    `sysparm_query=submission=${submissionSysId}${extra ? '^' + extra : ''}&sysparm_display_value=true&sysparm_exclude_reference_link=false`
  );
}

// ── Connection Test ───────────────────────────────────────────────

export async function testConnection() {
  const data = await snFetch(
    tableURL('submission', 'sysparm_limit=1&sysparm_fields=sys_id,number,applicant_name,status')
  );
  return { success: true, sample: data.result?.[0] || null };
}

// ================================================================
// TABLE QUERIES
// ================================================================

// 1. Submissions
export async function fetchSubmissions(params = '') {
  return snFetch(tableURL('submission',
    `sysparm_display_value=true&sysparm_exclude_reference_link=false${params ? '&' + params : ''}`
  ));
}

export async function fetchSubmission(sysId) {
  return snFetch(tableURL(`submission/${sysId}`, 'sysparm_display_value=true'));
}

export async function createSubmission(payload) {
  return snFetch(tableURL('submission'), { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateSubmission(sysId, payload) {
  return snFetch(tableURL(`submission/${sysId}`), { method: 'PATCH', body: JSON.stringify(payload) });
}

// 2. Vehicles
export async function fetchVehicles(submissionSysId) {
  return snFetch(bySubmission('vehicle', submissionSysId));
}

export async function createVehicle(payload) {
  return snFetch(tableURL('vehicle'), { method: 'POST', body: JSON.stringify(payload) });
}

// 3. Drivers
export async function fetchDrivers(submissionSysId) {
  return snFetch(bySubmission('driver', submissionSysId));
}

export async function createDriver(payload) {
  return snFetch(tableURL('driver'), { method: 'POST', body: JSON.stringify(payload) });
}

// 4. Driver Codes
export async function fetchDriverCodes(driverSysId) {
  return snFetch(tableURL('driver_code',
    `sysparm_query=driver=${driverSysId}&sysparm_display_value=true`
  ));
}

export async function createDriverCode(payload) {
  return snFetch(tableURL('driver_code'), { method: 'POST', body: JSON.stringify(payload) });
}

// 5. Documents
export async function fetchDocuments(submissionSysId) {
  return snFetch(bySubmission('document', submissionSysId));
}

export async function createDocument(payload) {
  return snFetch(tableURL('document'), { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateDocument(sysId, payload) {
  return snFetch(tableURL(`document/${sysId}`), { method: 'PATCH', body: JSON.stringify(payload) });
}

// 6. IDP Fields
export async function fetchIDPFields(submissionSysId) {
  return snFetch(bySubmission('idp_field', submissionSysId));
}

export async function fetchIDPFieldsByDocument(documentSysId) {
  return snFetch(tableURL('idp_field',
    `sysparm_query=document=${documentSysId}&sysparm_display_value=true`
  ));
}

export async function createIDPField(payload) {
  return snFetch(tableURL('idp_field'), { method: 'POST', body: JSON.stringify(payload) });
}

// 7. Loss Runs
export async function fetchLossRuns(submissionSysId) {
  return snFetch(bySubmission('loss_run', submissionSysId));
}

export async function createLossRun(payload) {
  return snFetch(tableURL('loss_run'), { method: 'POST', body: JSON.stringify(payload) });
}

// 8. Workflow Stages
export async function fetchWorkflowStages(submissionSysId) {
  return snFetch(bySubmission('workflow_stage', submissionSysId, 'ORDERBYsequence'));
}

export async function updateWorkflowStage(sysId, payload) {
  return snFetch(tableURL(`workflow_stage/${sysId}`), { method: 'PATCH', body: JSON.stringify(payload) });
}

// 9. UW Tasks
export async function fetchUWTasks(submissionSysId) {
  return snFetch(bySubmission('uw_task', submissionSysId));
}

export async function createUWTask(payload) {
  return snFetch(tableURL('uw_task'), { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateUWTask(sysId, payload) {
  return snFetch(tableURL(`uw_task/${sysId}`), { method: 'PATCH', body: JSON.stringify(payload) });
}

// 10. Notes
export async function fetchNotes(submissionSysId) {
  return snFetch(bySubmission('note', submissionSysId, 'ORDERBYDESCcreated_date'));
}

export async function createNote(payload) {
  return snFetch(tableURL('note'), { method: 'POST', body: JSON.stringify(payload) });
}

// 11. Messages
export async function fetchMessages(submissionSysId) {
  return snFetch(bySubmission('message', submissionSysId, 'ORDERBYDESCsent_date'));
}

export async function createMessage(payload) {
  return snFetch(tableURL('message'), { method: 'POST', body: JSON.stringify(payload) });
}

// 12. Reports
export async function fetchReports(submissionSysId) {
  return snFetch(bySubmission('report', submissionSysId));
}

export async function updateReport(sysId, payload) {
  return snFetch(tableURL(`report/${sysId}`), { method: 'PATCH', body: JSON.stringify(payload) });
}

// 13. Referrals
export async function fetchReferrals(submissionSysId) {
  if (!submissionSysId) {
    return snFetch(tableURL('referral', 'sysparm_display_value=true&sysparm_limit=500'));
  }
  return snFetch(bySubmission('referral', submissionSysId));
}

export async function createReferral(payload) {
  return snFetch(tableURL('referral'), { method: 'POST', body: JSON.stringify(payload) });
}

// 14. AI Recommendations
export async function fetchAIRecommendations(submissionSysId) {
  if (!submissionSysId) {
    return snFetch(tableURL('ai_recommendation', 'sysparm_display_value=true&sysparm_limit=500'));
  }
  return snFetch(bySubmission('ai_recommendation', submissionSysId));
}

export async function createAIRecommendation(payload) {
  return snFetch(tableURL('ai_recommendation'), { method: 'POST', body: JSON.stringify(payload) });
}

// 15. Compliance
export async function fetchCompliance(submissionSysId) {
  return snFetch(bySubmission('compliance', submissionSysId));
}

export async function updateCompliance(sysId, payload) {
  return snFetch(tableURL(`compliance/${sysId}`), { method: 'PATCH', body: JSON.stringify(payload) });
}

// ── Convenience: Fetch All Submission Details ─────────────────────

export async function fetchAllSubmissionData(submissionSysId) {
  const [
    vehicles, drivers, documents, lossRuns,
    workflowStages, tasks, notes, messages,
    reports, referrals, aiRecs, compliance
  ] = await Promise.all([
    fetchVehicles(submissionSysId),
    fetchDrivers(submissionSysId),
    fetchDocuments(submissionSysId),
    fetchLossRuns(submissionSysId),
    fetchWorkflowStages(submissionSysId),
    fetchUWTasks(submissionSysId),
    fetchNotes(submissionSysId),
    fetchMessages(submissionSysId),
    fetchReports(submissionSysId),
    fetchReferrals(submissionSysId),
    fetchAIRecommendations(submissionSysId),
    fetchCompliance(submissionSysId),
  ]);

  return {
    vehicles:       vehicles.result       || [],
    drivers:        drivers.result        || [],
    documents:      documents.result      || [],
    lossRuns:       lossRuns.result       || [],
    workflowStages: workflowStages.result || [],
    tasks:          tasks.result          || [],
    notes:          notes.result          || [],
    messages:       messages.result       || [],
    reports:        reports.result        || [],
    referrals:      referrals.result      || [],
    aiRecommendations: aiRecs.result      || [],
    compliance:     compliance.result     || [],
  };
}
