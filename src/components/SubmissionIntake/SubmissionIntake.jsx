import { useState, useMemo } from 'react';
import {
  DxcHeading,
  DxcFlex,
  DxcTypography,
  DxcButton,
  DxcTextInput,
  DxcSelect,
  DxcInset,
  DxcBadge,
  DxcAccordion,
  DxcDialog,
} from '@dxc-technology/halstack-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import './SubmissionIntake.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const SubmissionIntake = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedForms, setUploadedForms] = useState([]);
  const [supportDocs, setSupportDocs] = useState([]);
  const [extractedData, setExtractedData] = useState({
    namedInsured: 'ABC Moving Services, Inc.',
    mailingAddress: '33 Inner Belt Rd',
    city: 'Somerville',
    state: 'MA',
    zipCode: '02143',
    businessType: 'Moving & Storage',
    yearsInBusiness: '46',
    coverageType: 'Business Auto',
    effectiveDate: '2026-01-01',
    expirationDate: '2027-01-01',
    limitsOfLiability: '$1,000,000 Combined Single Limit',
    fleetSize: '26',
    vehicleTypes: 'Vans (20), Trucks (6)',
    driversCount: '51',
    radiusOfOperation: 'Mostly Local',
    cargoType: 'Moving - Computer firms, hospitals, professional offices',
    priorCarrier: 'MAPFRE Insurance Group',
    priorPolicyNumber: 'Renewal',
    claimsLast3Years: 'See attached loss runs',
    totalLossAmount: 'See attached loss runs',
  });
  const [validationErrors, setValidationErrors] = useState({
    numberOfEmployees: 'Value may be inconsistent - form shows 67 employees but driver list shows 51 drivers',
  });
  const [lowConfidenceFields, setLowConfidenceFields] = useState(['businessDescription', 'totalLossAmount']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showProcessingBanner, setShowProcessingBanner] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDocProcessingModal, setShowDocProcessingModal] = useState(false);
  const [dontShowDocProcessingAgain, setDontShowDocProcessingAgain] = useState(false);
  const [showViewSource, setShowViewSource] = useState(false);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  const submissionId = 'ABCMOVI-01';

  const validationSummary = useMemo(() => {
    const errorCount = Object.keys(validationErrors).length;
    const lowConfCount = lowConfidenceFields.length;
    return { errorCount, lowConfCount };
  }, [validationErrors, lowConfidenceFields]);

  const steps = [
    { number: 1, label: 'Upload Insurance Forms', completed: currentStep > 1 },
    { number: 2, label: 'Upload Supporting Documents', completed: currentStep > 2 },
    { number: 3, label: 'Review/Edit AI-Extracted Data', completed: currentStep > 3 },
    { number: 4, label: 'Submit', completed: false },
  ];

  const handleFileUpload = (files, isSupport = false) => {
    const newFiles = Array.from(files).map((file, index) => {
      const fileUrl = URL.createObjectURL(file);
      return {
        id: Date.now() + index,
        name: file.name,
        size: (file.size / 1024).toFixed(2) + ' KB',
        uploadDate: new Date().toLocaleDateString(),
        documentType: isSupport ? 'Loss Runs' : 'ACORD 125',
        description: isSupport ? '' : 'Commercial Auto Application',
        file: file,
        fileUrl: fileUrl,
        fileType: file.type,
      };
    });

    if (isSupport) {
      setSupportDocs([...supportDocs, ...newFiles]);
    } else {
      setUploadedForms([...uploadedForms, ...newFiles]);
    }
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      // Show Documents for Processing modal after Step 1 (ACORD forms are processed by AI)
      if (currentStep === 1 && !dontShowDocProcessingAgain && uploadedForms.length > 0) {
        setShowDocProcessingModal(true);
      } else {
        setCurrentStep(currentStep + 1);
        // Start processing simulation when leaving step 1 with uploaded forms
        if (currentStep === 1 && uploadedForms.length > 0) {
          setIsProcessing(true);
          setShowProcessingBanner(true);
          setTimeout(() => { setIsProcessing(false); }, 5000);
        }
      }
    }
  };

  const handleContinueFromDocProcessing = () => {
    setShowDocProcessingModal(false);
    setCurrentStep(2);
    setIsProcessing(true);
    setShowProcessingBanner(true);
    setTimeout(() => { setIsProcessing(false); }, 5000);
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    setShowSuccessModal(true);
  };

  const handleFieldChange = (field, value) => {
    setExtractedData({ ...extractedData, [field]: value });
    if (validationErrors[field]) {
      const newErrors = { ...validationErrors };
      delete newErrors[field];
      setValidationErrors(newErrors);
    }
    if (lowConfidenceFields.includes(field)) {
      setLowConfidenceFields(lowConfidenceFields.filter(f => f !== field));
    }
  };

  const renderProgressStepper = () => (
    <div className="progress-stepper">
      {steps.map((step, index) => (
        <div key={step.number} className="step-container">
          <div className="step-indicator-wrapper">
            <div className={`step-indicator ${
              step.completed ? 'completed' :
              step.number === currentStep ? 'active' : 'pending'
            }`}>
              {step.completed ? (
                <span className="material-icons" style={{ fontSize: '16px' }}>check</span>
              ) : (
                <span>{step.number}</span>
              )}
            </div>
            <DxcTypography
              fontSize="font-scale-01"
              fontWeight={step.number === currentStep ? 'font-weight-semibold' : 'font-weight-regular'}
              color={step.number === currentStep ? '#1B75BB' : 'var(--color-fg-neutral-stronger)'}
            >
              {step.label}
            </DxcTypography>
          </div>
          {index < steps.length - 1 && <div className="step-connector" />}
        </div>
      ))}
    </div>
  );

  const renderBreadcrumb = () => (
    <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center" style={{ marginBottom: 'var(--spacing-gap-m)' }}>
      <DxcTypography fontSize="font-scale-02" color="var(--color-fg-neutral-stronger)">
        Submissions
      </DxcTypography>
      <DxcTypography fontSize="font-scale-02" color="var(--color-fg-neutral-stronger)">/</DxcTypography>
      <DxcTypography fontSize="font-scale-02" color="#1B75BB">
        Submission ID - {submissionId}
      </DxcTypography>
    </DxcFlex>
  );

  // ─── STEP 1 ────────────────────────────────────────────────────────────────
  const renderStep1 = () => (
    <div className="step-content-container">
      <DxcFlex direction="column" gap="var(--spacing-gap-l)">
        <DxcTypography fontSize="var(--font-scale-04, 1.25rem)" fontWeight="font-weight-semibold" color="#333333">
          Upload Insurance Forms (ACORD)
        </DxcTypography>

        <div className="upload-area">
          <input
            type="file"
            id="acord-upload"
            multiple
            accept=".pdf,.doc,.docx"
            onChange={(e) => handleFileUpload(e.target.files)}
            style={{ display: 'none' }}
          />
          <label htmlFor="acord-upload" className="upload-label">
            <span className="material-icons" style={{ fontSize: '48px', color: '#1B75BB' }}>cloud_upload</span>
            <DxcTypography fontSize="var(--font-scale-03, 1rem)" fontWeight="font-weight-semibold">
              Drag and drop files here or click to browse
            </DxcTypography>
            <DxcTypography fontSize="var(--font-scale-02, 0.875rem)" color="var(--color-fg-neutral-stronger)">
              Supported formats: PDF, DOC, DOCX
            </DxcTypography>
          </label>
        </div>

        {uploadedForms.length > 0 && (
          <DxcFlex direction="column" gap="var(--spacing-gap-m)">
            <DxcTypography fontSize="var(--font-scale-03, 1rem)" fontWeight="font-weight-semibold" color="#333333">
              Uploaded Files
            </DxcTypography>
            <table className="document-table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Document Type</th>
                  <th>Description</th>
                  <th>Size</th>
                  <th>Upload Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {uploadedForms.map((file) => (
                  <tr key={file.id}>
                    <td>{file.name}</td>
                    <td>{file.documentType}</td>
                    <td>{file.description}</td>
                    <td>{file.size}</td>
                    <td>{file.uploadDate}</td>
                    <td>
                      <button className="icon-btn-small" onClick={() => setUploadedForms(uploadedForms.filter(f => f.id !== file.id))}>
                        <span className="material-icons">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DxcFlex>
        )}
      </DxcFlex>
    </div>
  );

  // ─── STEP 2 ────────────────────────────────────────────────────────────────
  const renderStep2 = () => (
    <div className="step-content-container">
      <DxcFlex direction="column" gap="var(--spacing-gap-l)">
        <DxcTypography fontSize="var(--font-scale-04, 1.25rem)" fontWeight="font-weight-semibold" color="#333333">
          Upload Supporting Documents
        </DxcTypography>

        {/* Processing status banner from Step 1 ACORD processing */}
        {isProcessing && showProcessingBanner && (
          <div className="processing-banner">
            <DxcFlex alignItems="flex-start" justifyContent="space-between" gap="var(--spacing-gap-m)">
              <DxcFlex alignItems="center" gap="var(--spacing-gap-m)">
                <span className="material-icons" style={{ color: '#1B75BB', fontSize: '24px' }}>info</span>
                <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                  <DxcTypography fontSize="var(--font-scale-02, 0.875rem)" fontWeight="font-weight-semibold">
                    ACORD forms are being processed
                  </DxcTypography>
                  <DxcTypography fontSize="var(--font-scale-02, 0.875rem)">
                    AI extraction is running on your uploaded insurance forms. You can continue uploading supporting documents while processing completes.
                  </DxcTypography>
                </DxcFlex>
              </DxcFlex>
              <button className="close-banner-btn" onClick={() => setShowProcessingBanner(false)} aria-label="Close banner">
                <span className="material-icons">close</span>
              </button>
            </DxcFlex>
          </div>
        )}

        <div className="upload-area">
          <input
            type="file"
            id="support-upload"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx"
            onChange={(e) => handleFileUpload(e.target.files, true)}
            style={{ display: 'none' }}
          />
          <label htmlFor="support-upload" className="upload-label">
            <span className="material-icons" style={{ fontSize: '48px', color: '#1B75BB' }}>cloud_upload</span>
            <DxcTypography fontSize="var(--font-scale-03, 1rem)" fontWeight="font-weight-semibold">
              Drag and drop files here or click to browse
            </DxcTypography>
            <DxcTypography fontSize="var(--font-scale-02, 0.875rem)" color="var(--color-fg-neutral-stronger)">
              Loss Runs, MVRs, Financial Statements, etc.
            </DxcTypography>
          </label>
        </div>

        {supportDocs.length > 0 && (
          <DxcFlex direction="column" gap="var(--spacing-gap-m)">
            <DxcTypography fontSize="var(--font-scale-03, 1rem)" fontWeight="font-weight-semibold" color="#333333">
              Uploaded Supporting Documents
            </DxcTypography>
            <table className="document-table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Document Type</th>
                  <th>Description</th>
                  <th>Size</th>
                  <th>Upload Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {supportDocs.map((file) => (
                  <tr key={file.id}>
                    <td>{file.name}</td>
                    <td>
                      <DxcSelect
                        size="small"
                        options={[
                          { label: 'Loss Runs', value: 'loss-runs' },
                          { label: 'MVR', value: 'mvr' },
                          { label: 'Financial Statement', value: 'financial' },
                          { label: 'Other', value: 'other' },
                        ]}
                        value="loss-runs"
                      />
                    </td>
                    <td>
                      <DxcTextInput size="small" placeholder="Add description..." />
                    </td>
                    <td>{file.size}</td>
                    <td>{file.uploadDate}</td>
                    <td>
                      <button className="icon-btn-small" onClick={() => setSupportDocs(supportDocs.filter(f => f.id !== file.id))}>
                        <span className="material-icons">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DxcFlex>
        )}
      </DxcFlex>
    </div>
  );

  // ─── STEP 3 ────────────────────────────────────────────────────────────────
  const renderStep3 = () => (
    <div className="step-content-container">
      <DxcFlex direction="column" gap="var(--spacing-gap-l)">
        <DxcTypography fontSize="var(--font-scale-04, 1.25rem)" fontWeight="font-weight-semibold" color="#333333">
          Review / Edit Extraction
        </DxcTypography>

        <DxcTypography fontSize="var(--font-scale-02, 0.875rem)" color="var(--color-fg-neutral-stronger)">
          Review and modify the AI-extracted data. Override AI suggestions and address validation issues before submission.
        </DxcTypography>

        {/* Processing Banner */}
        {isProcessing && showProcessingBanner && (
          <div className="processing-banner">
            <DxcFlex alignItems="flex-start" justifyContent="space-between" gap="var(--spacing-gap-m)">
              <DxcFlex alignItems="center" gap="var(--spacing-gap-m)">
                <span className="material-icons" style={{ color: '#1B75BB', fontSize: '24px' }}>info</span>
                <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                  <DxcTypography fontSize="var(--font-scale-02, 0.875rem)" fontWeight="font-weight-semibold">
                    Documents are still being processed
                  </DxcTypography>
                  <DxcTypography fontSize="var(--font-scale-02, 0.875rem)">
                    The system is currently processing the documents for data extraction. Please wait for a few minutes then refresh the page to see the results.
                  </DxcTypography>
                </DxcFlex>
              </DxcFlex>
              <button className="close-banner-btn" onClick={() => setShowProcessingBanner(false)} aria-label="Close banner">
                <span className="material-icons">close</span>
              </button>
            </DxcFlex>
          </div>
        )}

        {/* Error Alert (separate) */}
        {validationSummary.errorCount > 0 && (
          <div className="alert-error">
            <DxcFlex alignItems="center" gap="var(--spacing-gap-m)">
              <span className="material-icons" style={{ color: '#D0021B', fontSize: '22px' }}>error</span>
              <DxcTypography fontSize="var(--font-scale-02, 0.875rem)" fontWeight="font-weight-semibold" color="#D0021B">
                {validationSummary.errorCount} Validation Error{validationSummary.errorCount !== 1 ? 's' : ''} — Fields with data inconsistencies that need to be resolved
              </DxcTypography>
            </DxcFlex>
          </div>
        )}

        {/* Low Confidence Alert (separate) */}
        {validationSummary.lowConfCount > 0 && (
          <div className="alert-low-confidence">
            <DxcFlex alignItems="center" gap="var(--spacing-gap-m)">
              <span className="material-icons" style={{ color: '#F6921E', fontSize: '22px' }}>warning_amber</span>
              <DxcTypography fontSize="var(--font-scale-02, 0.875rem)" fontWeight="font-weight-semibold" color="#F6921E">
                {validationSummary.lowConfCount} Low AI Confidence — Fields where the AI extraction confidence is below threshold
              </DxcTypography>
            </DxcFlex>
          </div>
        )}

        <DxcFlex justifyContent="flex-end">
          <button
            className={`view-source-btn ${showViewSource ? 'active' : ''}`}
            onClick={() => setShowViewSource(!showViewSource)}
          >
            <DxcFlex alignItems="center" gap="var(--spacing-gap-xs)">
              <span className="material-icons" style={{ fontSize: '18px' }}>description</span>
              <span>{showViewSource ? 'Hide Source' : 'View Source'}</span>
            </DxcFlex>
          </button>
        </DxcFlex>

        {/* Side-by-side layout when View Source is active */}
        <div className={showViewSource ? 'extraction-container side-by-side' : 'extraction-container'}>
          <div className="extraction-fields">
            {/* Named Insured Information */}
            <div className="form-section">
              <DxcTypography fontSize="var(--font-scale-03, 1rem)" fontWeight="font-weight-semibold" color="#333333">
                Named Insured Information
              </DxcTypography>
              <div style={{ marginTop: 'var(--spacing-gap-m)' }}>
                <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                  <DxcTextInput label="Named Insured" value={extractedData.namedInsured} onChange={({ value }) => handleFieldChange('namedInsured', value)} size="fillParent" />
                  <DxcTextInput label="Mailing Address" value={extractedData.mailingAddress} onChange={({ value }) => handleFieldChange('mailingAddress', value)} size="fillParent" />
                  <DxcFlex gap="var(--spacing-gap-m)">
                    <DxcTextInput label="City" value={extractedData.city} onChange={({ value }) => handleFieldChange('city', value)} size="fillParent" />
                    <DxcTextInput label="State" value={extractedData.state} onChange={({ value }) => handleFieldChange('state', value)} size="fillParent" />
                    <div style={{ position: 'relative', width: '100%' }}>
                      {validationErrors.zipCode && (
                        <span className="field-indicator error" title="Invalid Zip Code">
                          <span className="material-icons" style={{ fontSize: '16px' }}>error</span>
                        </span>
                      )}
                      <DxcTextInput label="Zip Code" value={extractedData.zipCode} onChange={({ value }) => handleFieldChange('zipCode', value)} size="fillParent" error={validationErrors.zipCode} />
                    </div>
                  </DxcFlex>
                  <DxcFlex gap="var(--spacing-gap-m)">
                    <DxcTextInput label="Business Type" value={extractedData.businessType} onChange={({ value }) => handleFieldChange('businessType', value)} size="fillParent" />
                    <DxcTextInput label="Years in Business" value={extractedData.yearsInBusiness} onChange={({ value }) => handleFieldChange('yearsInBusiness', value)} size="fillParent" />
                  </DxcFlex>
                </DxcFlex>
              </div>
            </div>

            {/* Coverage Information */}
            <div className="form-section">
              <DxcTypography fontSize="var(--font-scale-03, 1rem)" fontWeight="font-weight-semibold" color="#333333">
                Coverage Information
              </DxcTypography>
              <div style={{ marginTop: 'var(--spacing-gap-m)' }}>
                <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                  <DxcTextInput label="Coverage Type" value={extractedData.coverageType} onChange={({ value }) => handleFieldChange('coverageType', value)} size="fillParent" />
                  <DxcFlex gap="var(--spacing-gap-m)">
                    <DxcTextInput label="Effective Date" type="date" value={extractedData.effectiveDate} onChange={({ value }) => handleFieldChange('effectiveDate', value)} size="fillParent" />
                    <DxcTextInput label="Expiration Date" type="date" value={extractedData.expirationDate} onChange={({ value }) => handleFieldChange('expirationDate', value)} size="fillParent" />
                  </DxcFlex>
                  <DxcTextInput label="Limits of Liability" value={extractedData.limitsOfLiability} onChange={({ value }) => handleFieldChange('limitsOfLiability', value)} size="fillParent" />
                </DxcFlex>
              </div>
            </div>

            {/* Fleet Information */}
            <div className="form-section">
              <DxcTypography fontSize="var(--font-scale-03, 1rem)" fontWeight="font-weight-semibold" color="#333333">
                Fleet Information
              </DxcTypography>
              <div style={{ marginTop: 'var(--spacing-gap-m)' }}>
                <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                  <DxcFlex gap="var(--spacing-gap-m)">
                    <DxcTextInput label="Fleet Size" value={extractedData.fleetSize} onChange={({ value }) => handleFieldChange('fleetSize', value)} size="fillParent" />
                    <DxcTextInput label="Number of Drivers" value={extractedData.driversCount} onChange={({ value }) => handleFieldChange('driversCount', value)} size="fillParent" />
                  </DxcFlex>
                  <DxcTextInput label="Vehicle Types" value={extractedData.vehicleTypes} onChange={({ value }) => handleFieldChange('vehicleTypes', value)} size="fillParent" />
                  <DxcFlex gap="var(--spacing-gap-m)">
                    <DxcTextInput label="Radius of Operation" value={extractedData.radiusOfOperation} onChange={({ value }) => handleFieldChange('radiusOfOperation', value)} size="fillParent" />
                    <DxcTextInput label="Cargo Type" value={extractedData.cargoType} onChange={({ value }) => handleFieldChange('cargoType', value)} size="fillParent" />
                  </DxcFlex>
                </DxcFlex>
              </div>
            </div>

            {/* Loss History */}
            <div className="form-section">
              <DxcTypography fontSize="var(--font-scale-03, 1rem)" fontWeight="font-weight-semibold" color="#333333">
                Loss History
              </DxcTypography>
              <div style={{ marginTop: 'var(--spacing-gap-m)' }}>
                <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                  <DxcFlex gap="var(--spacing-gap-m)">
                    <div style={{ position: 'relative', width: '100%' }}>
                      {lowConfidenceFields.includes('priorCarrier') && (
                        <span className="field-indicator warning" title="Low AI Confidence">
                          <span className="confidence-dot"></span>
                        </span>
                      )}
                      <DxcTextInput label="Prior Carrier" value={extractedData.priorCarrier} onChange={({ value }) => handleFieldChange('priorCarrier', value)} size="fillParent" />
                    </div>
                    <DxcTextInput label="Prior Policy Number" value={extractedData.priorPolicyNumber} onChange={({ value }) => handleFieldChange('priorPolicyNumber', value)} size="fillParent" />
                  </DxcFlex>
                  <DxcFlex gap="var(--spacing-gap-m)">
                    <DxcTextInput label="Claims in Last 3 Years" value={extractedData.claimsLast3Years} onChange={({ value }) => handleFieldChange('claimsLast3Years', value)} size="fillParent" />
                    <DxcTextInput label="Total Loss Amount" value={extractedData.totalLossAmount} onChange={({ value }) => handleFieldChange('totalLossAmount', value)} size="fillParent" />
                  </DxcFlex>
                </DxcFlex>
              </div>
            </div>
          </div>

          {/* Document Viewer - shown when View Source is active */}
          {showViewSource && (
            <div className="document-viewer">
              <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                <DxcTypography fontSize="var(--font-scale-03, 1rem)" fontWeight="font-weight-semibold" color="#333333">
                  Source Document - {uploadedForms.length > 0 ? uploadedForms[0].documentType : 'ACORD 125'}
                </DxcTypography>
                <div className="document-preview">
                  {uploadedForms.length > 0 && uploadedForms[0].fileUrl ? (
                    uploadedForms[0].fileType === 'application/pdf' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-gap-s)', width: '100%' }}>
                        <DxcFlex alignItems="center" justifyContent="center" gap="var(--spacing-gap-s)" style={{ padding: 'var(--spacing-padding-xs)', backgroundColor: 'var(--color-bg-neutral-lighter)', borderRadius: 'var(--border-radius-s)' }}>
                          <button className="zoom-btn" onClick={() => setScale(Math.max(0.5, scale - 0.25))} disabled={scale <= 0.5} title="Zoom Out">
                            <span className="material-icons" style={{ fontSize: '18px' }}>remove</span>
                          </button>
                          <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold">
                            {Math.round(scale * 100)}%
                          </DxcTypography>
                          <button className="zoom-btn" onClick={() => setScale(Math.min(2.0, scale + 0.25))} disabled={scale >= 2.0} title="Zoom In">
                            <span className="material-icons" style={{ fontSize: '18px' }}>add</span>
                          </button>
                          <button className="zoom-btn" onClick={() => setScale(1.0)} title="Reset Zoom">
                            <span className="material-icons" style={{ fontSize: '18px' }}>refresh</span>
                          </button>
                        </DxcFlex>
                        <div style={{ overflowY: 'auto', maxHeight: '700px', display: 'flex', justifyContent: 'center' }}>
                          <Document
                            file={uploadedForms[0].fileUrl}
                            onLoadSuccess={({ numPages }) => { setNumPages(numPages); setPageNumber(1); }}
                            onLoadError={(error) => console.error('Error loading PDF:', error)}
                          >
                            <Page pageNumber={pageNumber} scale={scale} renderTextLayer={true} renderAnnotationLayer={true} />
                          </Document>
                        </div>
                        {numPages && numPages > 1 && (
                          <DxcFlex alignItems="center" justifyContent="center" gap="var(--spacing-gap-m)" style={{ padding: 'var(--spacing-padding-s)', backgroundColor: 'var(--color-bg-neutral-lighter)', borderRadius: 'var(--border-radius-s)' }}>
                            <DxcButton label="Previous" mode="secondary" size="small" disabled={pageNumber <= 1} onClick={() => setPageNumber(pageNumber - 1)} />
                            <DxcTypography fontSize="var(--font-scale-02, 0.875rem)" fontWeight="font-weight-semibold">
                              Page {pageNumber} of {numPages}
                            </DxcTypography>
                            <DxcButton label="Next" mode="secondary" size="small" disabled={pageNumber >= numPages} onClick={() => setPageNumber(pageNumber + 1)} />
                          </DxcFlex>
                        )}
                      </div>
                    ) : uploadedForms[0].fileType.startsWith('image/') ? (
                      <img src={uploadedForms[0].fileUrl} alt={uploadedForms[0].name} style={{ maxWidth: '100%', height: 'auto', objectFit: 'contain' }} />
                    ) : (
                      <DxcFlex direction="column" alignItems="center" justifyContent="center" style={{ height: '100%', padding: 'var(--spacing-padding-xl)' }}>
                        <span className="material-icons" style={{ fontSize: '120px', color: '#1B75BB', marginBottom: 'var(--spacing-gap-m)' }}>description</span>
                        <DxcTypography fontSize="var(--font-scale-03, 1rem)" fontWeight="font-weight-semibold" color="var(--color-fg-neutral-stronger)">{uploadedForms[0].name}</DxcTypography>
                        <DxcTypography fontSize="var(--font-scale-02, 0.875rem)" color="var(--color-fg-neutral-medium)" style={{ marginTop: 'var(--spacing-gap-s)' }}>Preview not available for this file type</DxcTypography>
                      </DxcFlex>
                    )
                  ) : (
                    <DxcFlex direction="column" alignItems="center" justifyContent="center" style={{ height: '100%', padding: 'var(--spacing-padding-xl)' }}>
                      <span className="material-icons" style={{ fontSize: '120px', color: '#1B75BB', marginBottom: 'var(--spacing-gap-m)' }}>description</span>
                      <DxcTypography fontSize="var(--font-scale-03, 1rem)" fontWeight="font-weight-semibold" color="var(--color-fg-neutral-stronger)">ACORD 125 - Commercial Auto Application</DxcTypography>
                      <DxcTypography fontSize="var(--font-scale-02, 0.875rem)" color="var(--color-fg-neutral-medium)" style={{ marginTop: 'var(--spacing-gap-s)' }}>No document uploaded yet</DxcTypography>
                    </DxcFlex>
                  )}
                </div>
              </DxcFlex>
            </div>
          )}
        </div>
      </DxcFlex>
    </div>
  );

  // ─── STEP 4 ────────────────────────────────────────────────────────────────
  const renderStep4 = () => {
    const hasErrors = validationSummary.errorCount > 0;
    const hasDocs = uploadedForms.length > 0;
    const allFieldsFilled = extractedData.namedInsured && extractedData.effectiveDate && extractedData.coverageType;

    return (
      <div className="step-content-container">
        <DxcFlex direction="column" gap="var(--spacing-gap-l)">
          <DxcTypography fontSize="var(--font-scale-04, 1.25rem)" fontWeight="font-weight-semibold" color="#333333">
            Review and Submit
          </DxcTypography>

          <DxcTypography fontSize="var(--font-scale-02, 0.875rem)" color="var(--color-fg-neutral-stronger)">
            Please review all information before submitting.
          </DxcTypography>

          {/* Submission Checklist */}
          <div className="submission-checklist">
            <DxcTypography fontSize="var(--font-scale-03, 1rem)" fontWeight="font-weight-semibold" color="#333333">
              Submission Checklist
            </DxcTypography>
            <div style={{ marginTop: 'var(--spacing-gap-m)' }}>
              <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                <DxcFlex alignItems="center" gap="var(--spacing-gap-s)">
                  <span className="material-icons" style={{ fontSize: '20px', color: allFieldsFilled ? '#37A526' : '#D0021B' }}>
                    {allFieldsFilled ? 'check_circle' : 'cancel'}
                  </span>
                  <DxcTypography fontSize="var(--font-scale-02, 0.875rem)">All required fields completed</DxcTypography>
                </DxcFlex>
                <DxcFlex alignItems="center" gap="var(--spacing-gap-s)">
                  <span className="material-icons" style={{ fontSize: '20px', color: hasDocs ? '#37A526' : '#D0021B' }}>
                    {hasDocs ? 'check_circle' : 'cancel'}
                  </span>
                  <DxcTypography fontSize="var(--font-scale-02, 0.875rem)">Documents uploaded</DxcTypography>
                </DxcFlex>
                <DxcFlex alignItems="center" gap="var(--spacing-gap-s)">
                  <span className="material-icons" style={{ fontSize: '20px', color: !hasErrors ? '#37A526' : '#D0021B' }}>
                    {!hasErrors ? 'check_circle' : 'cancel'}
                  </span>
                  <DxcTypography fontSize="var(--font-scale-02, 0.875rem)">No unresolved validation errors</DxcTypography>
                </DxcFlex>
              </DxcFlex>
            </div>
          </div>

          {/* Named Insured Information */}
          <div className="review-card">
            <div className="review-card-header">
              <DxcTypography fontSize="var(--font-scale-03, 1rem)" fontWeight="font-weight-semibold" color="#333333">Named Insured Information</DxcTypography>
            </div>
            <div className="review-card-body">
              <div className="review-row"><span className="review-label">Named Insured</span><span className="review-value">{extractedData.namedInsured}</span></div>
              <div className="review-row"><span className="review-label">Address</span><span className="review-value">{extractedData.mailingAddress}, {extractedData.city}, {extractedData.state} {extractedData.zipCode}</span></div>
              <div className="review-row"><span className="review-label">Business Type</span><span className="review-value">{extractedData.businessType}</span></div>
              <div className="review-row"><span className="review-label">Years in Business</span><span className="review-value">{extractedData.yearsInBusiness}</span></div>
            </div>
          </div>

          {/* Coverage Information */}
          <div className="review-card">
            <div className="review-card-header">
              <DxcTypography fontSize="var(--font-scale-03, 1rem)" fontWeight="font-weight-semibold" color="#333333">Coverage Information</DxcTypography>
            </div>
            <div className="review-card-body">
              <div className="review-row"><span className="review-label">Coverage Type</span><span className="review-value">{extractedData.coverageType}</span></div>
              <div className="review-row"><span className="review-label">Effective Date</span><span className="review-value">{extractedData.effectiveDate}</span></div>
              <div className="review-row"><span className="review-label">Expiration Date</span><span className="review-value">{extractedData.expirationDate}</span></div>
              <div className="review-row"><span className="review-label">Limits of Liability</span><span className="review-value">{extractedData.limitsOfLiability}</span></div>
            </div>
          </div>

          {/* Fleet Information */}
          <div className="review-card">
            <div className="review-card-header">
              <DxcTypography fontSize="var(--font-scale-03, 1rem)" fontWeight="font-weight-semibold" color="#333333">Fleet Information</DxcTypography>
            </div>
            <div className="review-card-body">
              <div className="review-row"><span className="review-label">Fleet Size</span><span className="review-value">{extractedData.fleetSize}</span></div>
              <div className="review-row"><span className="review-label">Number of Drivers</span><span className="review-value">{extractedData.driversCount}</span></div>
              <div className="review-row"><span className="review-label">Vehicle Types</span><span className="review-value">{extractedData.vehicleTypes}</span></div>
              <div className="review-row"><span className="review-label">Radius of Operation</span><span className="review-value">{extractedData.radiusOfOperation}</span></div>
              <div className="review-row"><span className="review-label">Cargo Type</span><span className="review-value">{extractedData.cargoType}</span></div>
            </div>
          </div>

          {/* Loss History */}
          <div className="review-card">
            <div className="review-card-header">
              <DxcTypography fontSize="var(--font-scale-03, 1rem)" fontWeight="font-weight-semibold" color="#333333">Loss History</DxcTypography>
            </div>
            <div className="review-card-body">
              <div className="review-row"><span className="review-label">Prior Carrier</span><span className="review-value">{extractedData.priorCarrier}</span></div>
              <div className="review-row"><span className="review-label">Prior Policy Number</span><span className="review-value">{extractedData.priorPolicyNumber}</span></div>
              <div className="review-row"><span className="review-label">Claims in Last 3 Years</span><span className="review-value">{extractedData.claimsLast3Years}</span></div>
              <div className="review-row"><span className="review-label">Total Loss Amount</span><span className="review-value">{extractedData.totalLossAmount}</span></div>
            </div>
          </div>

          {/* Uploaded Documents */}
          <div className="review-card">
            <div className="review-card-header">
              <DxcTypography fontSize="var(--font-scale-03, 1rem)" fontWeight="font-weight-semibold" color="#333333">Uploaded Documents</DxcTypography>
            </div>
            <div className="review-card-body">
              {uploadedForms.length > 0 && (
                <>
                  <DxcTypography fontSize="var(--font-scale-02, 0.875rem)" fontWeight="font-weight-semibold" color="#333333">Insurance Forms</DxcTypography>
                  {uploadedForms.map(file => (
                    <div key={file.id} className="review-row"><span className="review-label">{file.documentType}</span><span className="review-value">{file.name}</span></div>
                  ))}
                </>
              )}
              {supportDocs.length > 0 && (
                <div style={{ marginTop: uploadedForms.length > 0 ? 'var(--spacing-gap-m)' : '0' }}>
                  <DxcTypography fontSize="var(--font-scale-02, 0.875rem)" fontWeight="font-weight-semibold" color="#333333">Supporting Documents</DxcTypography>
                  {supportDocs.map(file => (
                    <div key={file.id} className="review-row"><span className="review-label">{file.documentType}</span><span className="review-value">{file.name}</span></div>
                  ))}
                </div>
              )}
              {uploadedForms.length === 0 && supportDocs.length === 0 && (
                <DxcTypography fontSize="var(--font-scale-02, 0.875rem)" color="var(--color-fg-neutral-medium)">No documents uploaded</DxcTypography>
              )}
            </div>
          </div>

          {/* Action Bar */}
          <div className="action-bar">
            <DxcFlex justifyContent="space-between" alignItems="center">
              <DxcButton label="Cancel" mode="tertiary" onClick={() => {}} />
              <DxcFlex gap="var(--spacing-gap-m)">
                <DxcButton label="Save as Draft" mode="secondary" onClick={() => {}} />
                <DxcButton label="Submit" mode="primary" onClick={handleSubmit} />
              </DxcFlex>
            </DxcFlex>
          </div>
        </DxcFlex>
      </div>
    );
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: 'var(--spacing-padding-l)', backgroundColor: '#f5f5f5', minHeight: '100%' }}>
      <DxcFlex direction="column" gap="var(--spacing-gap-l)">
        {renderBreadcrumb()}

        <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
          <DxcTypography fontSize="var(--font-scale-05, 1.5rem)" fontWeight="font-weight-semibold" color="#333333">
            New Submission
          </DxcTypography>
          <DxcTypography fontSize="var(--font-scale-02, 0.875rem)" color="var(--color-fg-neutral-stronger)">
            {submissionId} | Commercial Auto
          </DxcTypography>
        </DxcFlex>

        {renderProgressStepper()}

        <div>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        {/* Navigation buttons (Step 4 has its own action bar) */}
        {currentStep < 4 && (
          <DxcFlex justifyContent="space-between">
            <div>
              {currentStep > 1 && (
                <DxcButton label="Previous Step" mode="secondary" onClick={handlePreviousStep} />
              )}
            </div>
            <DxcButton label="Next Step" mode="primary" onClick={handleNextStep} />
          </DxcFlex>
        )}
      </DxcFlex>

      {/* Success Modal */}
      {showSuccessModal && (
        <DxcDialog onCloseClick={() => setShowSuccessModal(false)}>
          <div style={{ padding: 'var(--spacing-padding-l)', minWidth: '400px' }}>
            <DxcFlex direction="column" gap="var(--spacing-gap-m)" alignItems="center">
              <span className="material-icons" style={{ fontSize: '48px', color: '#37A526' }}>check_circle</span>
              <DxcTypography fontSize="var(--font-scale-04, 1.25rem)" fontWeight="font-weight-semibold" color="#333333">
                Submission Successful
              </DxcTypography>
              <DxcTypography fontSize="var(--font-scale-02, 0.875rem)" color="var(--color-fg-neutral-stronger)" style={{ textAlign: 'center' }}>
                Your submission has been successfully processed. Please reach out to the support team for any questions or concerns.
              </DxcTypography>
              <DxcButton label="Okay" mode="primary" onClick={() => setShowSuccessModal(false)} />
            </DxcFlex>
          </div>
        </DxcDialog>
      )}

      {/* Documents for Processing Modal — shown after Step 1 */}
      {showDocProcessingModal && (
        <DxcDialog onCloseClick={() => setShowDocProcessingModal(false)}>
          <div style={{ padding: 'var(--spacing-padding-l)', minWidth: '500px' }}>
            <DxcFlex direction="column" gap="var(--spacing-gap-l)">
              <DxcFlex alignItems="flex-start" gap="var(--spacing-gap-m)">
                <span className="material-icons" style={{ color: '#1B75BB', fontSize: '32px' }}>info</span>
                <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                  <DxcTypography fontSize="var(--font-scale-04, 1.25rem)" fontWeight="font-weight-semibold" color="#333333">
                    Documents for Processing
                  </DxcTypography>
                  <DxcTypography fontSize="var(--font-scale-02, 0.875rem)" color="var(--color-fg-neutral-stronger)">
                    The ACORD forms you uploaded will now be processed by our AI extraction engine. This typically takes 2-5 minutes depending on document complexity.
                  </DxcTypography>
                  <DxcTypography fontSize="var(--font-scale-02, 0.875rem)" color="var(--color-fg-neutral-stronger)" style={{ marginTop: 'var(--spacing-gap-s)' }}>
                    You can continue uploading supporting documents while processing runs. The extracted data will be available for review in Step 3.
                  </DxcTypography>
                </DxcFlex>
              </DxcFlex>

              <div style={{ borderTop: '1px solid var(--color-border-neutral-lighter)', paddingTop: 'var(--spacing-gap-m)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-gap-s)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={dontShowDocProcessingAgain}
                    onChange={(e) => setDontShowDocProcessingAgain(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <DxcTypography fontSize="var(--font-scale-02, 0.875rem)">Do not show this message again</DxcTypography>
                </label>
              </div>

              <DxcFlex justifyContent="flex-end" gap="var(--spacing-gap-m)">
                <DxcButton label="Cancel" mode="secondary" onClick={() => setShowDocProcessingModal(false)} />
                <DxcButton label="Continue" mode="primary" onClick={handleContinueFromDocProcessing} />
              </DxcFlex>
            </DxcFlex>
          </div>
        </DxcDialog>
      )}
    </div>
  );
};

export default SubmissionIntake;
