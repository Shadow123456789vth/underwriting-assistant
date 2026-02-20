import { useState, useEffect, useRef } from 'react';
import { connect, disconnect, handleOAuthCallback, isConnected, testConnection } from '../../services/servicenow';
import './ServiceNowConnect.css';

export default function ServiceNowConnect({ onConnectionChange }) {
  const [connected, setConnected]       = useState(isConnected());
  const [loading, setLoading]           = useState(false);
  const [showPanel, setShowPanel]       = useState(false);
  const [error, setError]               = useState('');
  const [statusMsg, setStatusMsg]       = useState('');
  const [sampleRecord, setSampleRecord] = useState(null);
  const panelRef = useRef(null);

  // Handle OAuth callback: exchange code for token on page load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code   = params.get('code');
    const state  = params.get('state');
    if (code) {
      setLoading(true);
      setStatusMsg('Exchanging authorization code...');
      handleOAuthCallback(code, state)
        .then(() => testConnection())
        .then((result) => {
          setConnected(true);
          setSampleRecord(result.sample);
          setStatusMsg('Connected successfully');
          onConnectionChange?.(true);
          // Clean ?code= from URL without reloading
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch((err) => {
          setError(err.message);
          setStatusMsg('');
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .finally(() => setLoading(false));
    }
  }, []);

  // Close panel on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowPanel(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleConnect = () => {
    setError('');
    connect(); // redirects to ServiceNow login — no return
  };

  const handleDisconnect = () => {
    disconnect();
    setConnected(false);
    setSampleRecord(null);
    setStatusMsg('');
    setError('');
    setShowPanel(false);
    onConnectionChange?.(false);
  };

  return (
    <div className="snc-wrapper" ref={panelRef}>

      {/* ── Trigger Button ── */}
      <button
        className={`snc-trigger ${connected ? 'snc-trigger--on' : 'snc-trigger--off'}`}
        onClick={() => setShowPanel(v => !v)}
        title={connected ? 'ServiceNow Connected' : 'Connect to ServiceNow'}
      >
        <span className={`snc-dot ${connected ? 'snc-dot--on' : 'snc-dot--off'}`} />
        <span className="snc-trigger-label">ServiceNow</span>
        <span className="material-icons snc-chevron">
          {showPanel ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {/* ── Dropdown Panel ── */}
      {showPanel && (
        <div className="snc-panel">

          {/* Panel Header */}
          <div className="snc-panel-header">
            <span className="material-icons snc-panel-icon">
              {connected ? 'cloud_done' : 'cloud_off'}
            </span>
            <div>
              <div className="snc-panel-title">
                {connected ? 'Connected to ServiceNow' : 'ServiceNow — Not Connected'}
              </div>
              <div className="snc-panel-instance">
                {(import.meta.env.VITE_SN_INSTANCE || 'https://nextgenbpmnp1.service-now.com').replace('https://', '')}
              </div>
            </div>
          </div>

          {/* Live Sample (post-connect) */}
          {connected && sampleRecord && (
            <div className="snc-sample">
              <div className="snc-sample-heading">
                <span className="material-icons" style={{ fontSize: 13 }}>verified</span>
                Live data confirmed
              </div>
              <div className="snc-sample-row">
                <span>Number</span><span>{sampleRecord.number}</span>
              </div>
              <div className="snc-sample-row">
                <span>Applicant</span><span>{sampleRecord.applicant_name}</span>
              </div>
              <div className="snc-sample-row">
                <span>Status</span><span>{sampleRecord.status}</span>
              </div>
            </div>
          )}

          {/* Status Messages */}
          {statusMsg && !error && (
            <div className="snc-msg snc-msg--info">
              {loading && <span className="snc-spinner" />}
              {statusMsg}
            </div>
          )}
          {error && (
            <div className="snc-msg snc-msg--error">
              <span className="material-icons" style={{ fontSize: 14 }}>error_outline</span>
              {error}
            </div>
          )}

          {/* Action */}
          <div className="snc-actions">
            {!connected ? (
              <button
                className="snc-btn snc-btn--connect"
                onClick={handleConnect}
                disabled={loading}
              >
                {loading
                  ? <><span className="snc-spinner" />Connecting...</>
                  : <><span className="material-icons" style={{ fontSize: 15 }}>link</span>Connect to ServiceNow</>
                }
              </button>
            ) : (
              <button className="snc-btn snc-btn--disconnect" onClick={handleDisconnect}>
                <span className="material-icons" style={{ fontSize: 15 }}>link_off</span>
                Disconnect
              </button>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
