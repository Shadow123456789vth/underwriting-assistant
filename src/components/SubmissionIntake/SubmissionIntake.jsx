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
    // Named Insured Information
    namedInsured: 'ABC Moving Services, Inc.',
    mailingAddress: '33 Inner Belt Rd',
    city: 'Somerville',
    state: 'MA',
    zipCode: '02143',
    businessType: 'Moving & Storage',
    yearsInBusiness: '46',

    // Coverage Information
    coverageType: 'Business Auto',
    effectiveDate: '2026-01-01',
    expirationDate: '2027-01-01',
    limitsOfLiability: '$1,000,000 Combined Single Limit',

    // Fleet Information
    fleetSize: '26',
    vehicleTypes: 'Vans (20), Trucks (6)',
    driversCount: '51',
    radiusOfOperation: 'Mostly Local',
    cargoType: 'Moving - Computer firms, hospitals, professional offices',

    // Loss History
    priorCarrier: 'MAPFRE Insurance Group', // Low confidence
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

  // Mock AI extraction validation
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
      // Create a URL for the file to display it
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
      // Show Documents for Processing modal when moving from step 2 to step 3
      if (currentStep === 2 && !dontShowDocProcessingAgain) {
        setShowDocProcessingModal(true);
      } else {
        setCurrentStep(currentStep + 1);

        // Simulate processing when moving to step 3
        if (currentStep === 2) {
          setIsProcessing(true);
          setShowProcessingBanner(true);
          // Simulate processing completion after 5 seconds
          setTimeout(() => {
            setIsProcessing(false);
          }, 5000);
        }
      }
    }
  };

  const handleContinueToStep3 = () => {
    setShowDocProcessingModal(false);
    setCurrentStep(3);
    setIsProcessing(true);
    setShowProcessingBanner(true);
    setTimeout(() => {
      setIsProcessing(false);
    }, 5000);
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

    // Clear validation error if user fixes the field
    if (validationErrors[field]) {
      const newErrors = { ...validationErrors };
      delete newErrors[field];
      setValidationErrors(newErrors);
    }

    // Remove from low confidence if edited
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
              step.number === currentStep ? 'active' :
              'pending'
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
              color={step.number === currentStep ? '#0095FF' : 'var(--color-fg-neutral-stronger)'}
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
      <DxcTypography fontSize="font-scale-02" color="#0095FF">
        Submission ID - {submissionId}
      </DxcTypography>
    </DxcFlex>
  );

  const renderStep1 = () => (
    <DxcInset>
      <DxcFlex direction="column" gap="var(--spacing-gap-l)">
        <DxcHeading level={4} text="Upload Insurance Forms (ACORD)" />

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
            <span className="material-icons" style={{ fontSize: '48px', color: '#0095FF' }}>
              cloud_upload
            </span>
            <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
              Drag and drop files here or click to browse
            </DxcTypography>
            <DxcTypography fontSize="font-scale-02" color="var(--color-fg-neutral-stronger)">
              Supported formats: PDF, DOC, DOCX
            </DxcTypography>
          </label>
        </div>

        {uploadedForms.length > 0 && (
          <div>
            <DxcHeading level={5} text="Uploaded Files" />
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
                      <button
                        className="icon-btn-small"
                        onClick={() => setUploadedForms(uploadedForms.filter(f => f.id !== file.id))}
                      >
                        <span className="material-icons">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DxcFlex>
    </DxcInset>
  );

  const renderStep2 = () => (
    <DxcInset>
      <DxcFlex direction="column" gap="var(--spacing-gap-l)">
        <DxcHeading level={4} text="Upload Supporting Documents" />

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
            <span className="material-icons" style={{ fontSize: '48px', color: '#0095FF' }}>
              cloud_upload
            </span>
            <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
              Drag and drop files here or click to browse
            </DxcTypography>
            <DxcTypography fontSize="font-scale-02" color="var(--color-fg-neutral-stronger)">
              Loss Runs, MVRs, Financial Statements, etc.
            </DxcTypography>
          </label>
        </div>

        {supportDocs.length > 0 && (
          <div>
            <DxcHeading level={5} text="Uploaded Supporting Documents" />
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
                      <DxcTextInput
                        size="small"
                        placeholder="Add description..."
                      />
                    </td>
                    <td>{file.size}</td>
                    <td>{file.uploadDate}</td>
                    <td>
                      <button
                        className="icon-btn-small"
                        onClick={() => setSupportDocs(supportDocs.filter(f => f.id !== file.id))}
                      >
                        <span className="material-icons">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DxcFlex>
    </DxcInset>
  );

  const renderStep3 = () => (
    <DxcInset>
      <DxcFlex direction="column" gap="var(--spacing-gap-l)">
        <DxcHeading level={4} text="Review / Edit Extraction" />

        <DxcTypography fontSize="font-scale-02" color="var(--color-fg-neutral-stronger)">
          Review and modify the AI-extracted data. Override AI suggestions and address validation issues before submission
        </DxcTypography>

        {/* Processing Banner */}
        {isProcessing && showProcessingBanner && (
          <div className="processing-banner">
            <DxcFlex alignItems="flex-start" justifyContent="space-between" gap="var(--spacing-gap-m)">
              <DxcFlex alignItems="center" gap="var(--spacing-gap-m)">
                <span className="material-icons" style={{ color: '#0095FF', fontSize: '24px' }}>info</span>
                <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                  <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
                    Documents are still being processed
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-02">
                    The system is currently processing the documents for data extraction. Please wait for a few minutes then refresh the page to see the results.
                  </DxcTypography>
                </DxcFlex>
              </DxcFlex>
              <button
                className="close-banner-btn"
                onClick={() => setShowProcessingBanner(false)}
                aria-label="Close banner"
              >
                <span className="material-icons">close</span>
              </button>
            </DxcFlex>
          </div>
        )}

        {(validationSummary.errorCount > 0 || validationSummary.lowConfCount > 0) && (
          <div className="validation-warning">
            <DxcFlex alignItems="center" gap="var(--spacing-gap-m)">
              <span className="material-icons" style={{ color: '#FF6B00' }}>warning</span>
              <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#FF6B00">
                AI-Extracted Data Issues - We identified {validationSummary.errorCount} error{validationSummary.errorCount !== 1 ? 's' : ''} and {validationSummary.lowConfCount} Low AI Confidence instance{validationSummary.lowConfCount !== 1 ? 's' : ''}
              </DxcTypography>
            </DxcFlex>
          </div>
        )}

        <DxcFlex justifyContent="flex-end">
          <button
            className={`view-toggle-btn ${showViewSource ? 'active' : ''}`}
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
              <DxcHeading level={5} text="Named Insured Information" />
          <DxcFlex direction="column" gap="var(--spacing-gap-m)">
            <DxcTextInput
              label="Named Insured"
              value={extractedData.namedInsured}
              onChange={({ value }) => handleFieldChange('namedInsured', value)}
              size="fillParent"
            />
            <DxcTextInput
              label="Mailing Address"
              value={extractedData.mailingAddress}
              onChange={({ value }) => handleFieldChange('mailingAddress', value)}
              size="fillParent"
            />
            <DxcFlex gap="var(--spacing-gap-m)">
              <DxcTextInput
                label="City"
                value={extractedData.city}
                onChange={({ value }) => handleFieldChange('city', value)}
                size="fillParent"
              />
              <DxcTextInput
                label="State"
                value={extractedData.state}
                onChange={({ value }) => handleFieldChange('state', value)}
                size="fillParent"
              />
              <div style={{ position: 'relative', width: '100%' }}>
                {validationErrors.zipCode && (
                  <span className="field-indicator error" title="Invalid Zip Code">
                    <span className="material-icons" style={{ fontSize: '16px' }}>error</span>
                  </span>
                )}
                <DxcTextInput
                  label="Zip Code"
                  value={extractedData.zipCode}
                  onChange={({ value }) => handleFieldChange('zipCode', value)}
                  size="fillParent"
                  error={validationErrors.zipCode}
                />
              </div>
            </DxcFlex>
            <DxcFlex gap="var(--spacing-gap-m)">
              <DxcTextInput
                label="Business Type"
                value={extractedData.businessType}
                onChange={({ value }) => handleFieldChange('businessType', value)}
                size="fillParent"
              />
              <DxcTextInput
                label="Years in Business"
                value={extractedData.yearsInBusiness}
                onChange={({ value }) => handleFieldChange('yearsInBusiness', value)}
                size="fillParent"
              />
            </DxcFlex>
          </DxcFlex>
        </div>

        {/* Coverage Information */}
        <div className="form-section">
          <DxcHeading level={5} text="Coverage Information" />
          <DxcFlex direction="column" gap="var(--spacing-gap-m)">
            <DxcTextInput
              label="Coverage Type"
              value={extractedData.coverageType}
              onChange={({ value }) => handleFieldChange('coverageType', value)}
              size="fillParent"
            />
            <DxcFlex gap="var(--spacing-gap-m)">
              <DxcTextInput
                label="Effective Date"
                type="date"
                value={extractedData.effectiveDate}
                onChange={({ value }) => handleFieldChange('effectiveDate', value)}
                size="fillParent"
              />
              <DxcTextInput
                label="Expiration Date"
                type="date"
                value={extractedData.expirationDate}
                onChange={({ value }) => handleFieldChange('expirationDate', value)}
                size="fillParent"
              />
            </DxcFlex>
            <DxcTextInput
              label="Limits of Liability"
              value={extractedData.limitsOfLiability}
              onChange={({ value }) => handleFieldChange('limitsOfLiability', value)}
              size="fillParent"
            />
          </DxcFlex>
        </div>

        {/* Fleet Information */}
        <div className="form-section">
          <DxcHeading level={5} text="Fleet Information" />
          <DxcFlex direction="column" gap="var(--spacing-gap-m)">
            <DxcFlex gap="var(--spacing-gap-m)">
              <DxcTextInput
                label="Fleet Size"
                value={extractedData.fleetSize}
                onChange={({ value }) => handleFieldChange('fleetSize', value)}
                size="fillParent"
              />
              <DxcTextInput
                label="Number of Drivers"
                value={extractedData.driversCount}
                onChange={({ value }) => handleFieldChange('driversCount', value)}
                size="fillParent"
              />
            </DxcFlex>
            <DxcTextInput
              label="Vehicle Types"
              value={extractedData.vehicleTypes}
              onChange={({ value }) => handleFieldChange('vehicleTypes', value)}
              size="fillParent"
            />
            <DxcFlex gap="var(--spacing-gap-m)">
              <DxcTextInput
                label="Radius of Operation"
                value={extractedData.radiusOfOperation}
                onChange={({ value }) => handleFieldChange('radiusOfOperation', value)}
                size="fillParent"
              />
              <DxcTextInput
                label="Cargo Type"
                value={extractedData.cargoType}
                onChange={({ value }) => handleFieldChange('cargoType', value)}
                size="fillParent"
              />
            </DxcFlex>
          </DxcFlex>
        </div>

        {/* Loss History */}
        <div className="form-section">
          <DxcHeading level={5} text="Loss History" />
          <DxcFlex direction="column" gap="var(--spacing-gap-m)">
            <DxcFlex gap="var(--spacing-gap-m)">
              <div style={{ position: 'relative', width: '100%' }}>
                {lowConfidenceFields.includes('priorCarrier') && (
                  <span className="field-indicator warning" title="Low AI Confidence">
                    <span className="confidence-dot"></span>
                  </span>
                )}
                <DxcTextInput
                  label="Prior Carrier"
                  value={extractedData.priorCarrier}
                  onChange={({ value }) => handleFieldChange('priorCarrier', value)}
                  size="fillParent"
                />
              </div>
              <DxcTextInput
                label="Prior Policy Number"
                value={extractedData.priorPolicyNumber}
                onChange={({ value }) => handleFieldChange('priorPolicyNumber', value)}
                size="fillParent"
              />
            </DxcFlex>
            <DxcFlex gap="var(--spacing-gap-m)">
              <DxcTextInput
                label="Claims in Last 3 Years"
                value={extractedData.claimsLast3Years}
                onChange={({ value }) => handleFieldChange('claimsLast3Years', value)}
                size="fillParent"
              />
              <DxcTextInput
                label="Total Loss Amount"
                value={extractedData.totalLossAmount}
                onChange={({ value }) => handleFieldChange('totalLossAmount', value)}
                size="fillParent"
              />
            </DxcFlex>
          </DxcFlex>
        </div>
          </div>

          {/* Document Viewer - shown when View Source is active */}
          {showViewSource && (
            <div className="document-viewer">
              <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                <DxcHeading level={5} text={`Source Document - ${uploadedForms.length > 0 ? uploadedForms[0].documentType : 'ACORD 125'}`} />
                <div className="document-preview">
                  {uploadedForms.length > 0 && uploadedForms[0].fileUrl ? (
                    // Display actual uploaded document
                    uploadedForms[0].fileType === 'application/pdf' ? (
                      // PDF viewer using react-pdf
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-gap-s)', width: '100%' }}>
                        {/* Zoom Controls */}
                        <DxcFlex alignItems="center" justifyContent="center" gap="var(--spacing-gap-s)" style={{ padding: 'var(--spacing-padding-xs)', backgroundColor: 'var(--color-bg-neutral-lighter)', borderRadius: 'var(--border-radius-s)' }}>
                          <button
                            className="zoom-btn"
                            onClick={() => setScale(Math.max(0.5, scale - 0.25))}
                            disabled={scale <= 0.5}
                            title="Zoom Out"
                          >
                            <span className="material-icons" style={{ fontSize: '18px' }}>remove</span>
                          </button>
                          <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold">
                            {Math.round(scale * 100)}%
                          </DxcTypography>
                          <button
                            className="zoom-btn"
                            onClick={() => setScale(Math.min(2.0, scale + 0.25))}
                            disabled={scale >= 2.0}
                            title="Zoom In"
                          >
                            <span className="material-icons" style={{ fontSize: '18px' }}>add</span>
                          </button>
                          <button
                            className="zoom-btn"
                            onClick={() => setScale(1.0)}
                            title="Reset Zoom"
                          >
                            <span className="material-icons" style={{ fontSize: '18px' }}>refresh</span>
                          </button>
                        </DxcFlex>

                        {/* PDF Document */}
                        <div style={{ overflowY: 'auto', maxHeight: '700px', display: 'flex', justifyContent: 'center' }}>
                          <Document
                            file={uploadedForms[0].fileUrl}
                            onLoadSuccess={({ numPages }) => {
                              setNumPages(numPages);
                              setPageNumber(1);
                            }}
                            onLoadError={(error) => console.error('Error loading PDF:', error)}
                          >
                            <Page
                              pageNumber={pageNumber}
                              scale={scale}
                              renderTextLayer={true}
                              renderAnnotationLayer={true}
                            />
                          </Document>
                        </div>

                        {/* PDF Page Navigation Controls */}
                        {numPages && numPages > 1 && (
                          <DxcFlex alignItems="center" justifyContent="center" gap="var(--spacing-gap-m)" style={{ padding: 'var(--spacing-padding-s)', backgroundColor: 'var(--color-bg-neutral-lighter)', borderRadius: 'var(--border-radius-s)' }}>
                            <DxcButton
                              label="Previous"
                              mode="secondary"
                              size="small"
                              disabled={pageNumber <= 1}
                              onClick={() => setPageNumber(pageNumber - 1)}
                            />
                            <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
                              Page {pageNumber} of {numPages}
                            </DxcTypography>
                            <DxcButton
                              label="Next"
                              mode="secondary"
                              size="small"
                              disabled={pageNumber >= numPages}
                              onClick={() => setPageNumber(pageNumber + 1)}
                            />
                          </DxcFlex>
                        )}
                      </div>
                    ) : uploadedForms[0].fileType.startsWith('image/') ? (
                      // Image viewer
                      <img
                        src={uploadedForms[0].fileUrl}
                        alt={uploadedForms[0].name}
                        style={{
                          maxWidth: '100%',
                          height: 'auto',
                          objectFit: 'contain',
                        }}
                      />
                    ) : (
                      // Unsupported file type - show placeholder
                      <DxcFlex direction="column" alignItems="center" justifyContent="center" style={{ height: '100%', padding: 'var(--spacing-padding-xl)' }}>
                        <span className="material-icons" style={{ fontSize: '120px', color: 'var(--color-blue-600, #0095FF)', marginBottom: 'var(--spacing-gap-m)' }}>description</span>
                        <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="var(--color-fg-neutral-stronger)">
                          {uploadedForms[0].name}
                        </DxcTypography>
                        <DxcTypography fontSize="font-scale-02" color="var(--color-fg-neutral-medium)" style={{ marginTop: 'var(--spacing-gap-s)' }}>
                          Preview not available for this file type
                        </DxcTypography>
                      </DxcFlex>
                    )
                  ) : (
                    // No document uploaded - show placeholder
                    <DxcFlex direction="column" alignItems="center" justifyContent="center" style={{ height: '100%', padding: 'var(--spacing-padding-xl)' }}>
                      <span className="material-icons" style={{ fontSize: '120px', color: 'var(--color-blue-600, #0095FF)', marginBottom: 'var(--spacing-gap-m)' }}>description</span>
                      <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="var(--color-fg-neutral-stronger)">
                        ACORD 125 - Commercial Auto Application
                      </DxcTypography>
                      <DxcTypography fontSize="font-scale-02" color="var(--color-fg-neutral-medium)" style={{ marginTop: 'var(--spacing-gap-s)' }}>
                        No document uploaded yet
                      </DxcTypography>
                    </DxcFlex>
                  )}
                </div>
              </DxcFlex>
            </div>
          )}
        </div>

        {/* Ask to Edit Floating Toolbar - shown when errors or low confidence exist */}
        {(validationSummary.errorCount > 0 || validationSummary.lowConfCount > 0) && (
          <div className="ask-to-edit-toolbar">
            <DxcFlex alignItems="center" justifyContent="space-between" gap="var(--spacing-gap-m)">
              <DxcFlex alignItems="center" gap="var(--spacing-gap-m)">
                <span className="material-icons" style={{ color: '#0095FF' }}>edit</span>
                <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
                  Found {validationSummary.errorCount + validationSummary.lowConfCount} field{validationSummary.errorCount + validationSummary.lowConfCount !== 1 ? 's' : ''} needing review
                </DxcTypography>
              </DxcFlex>
              <DxcButton
                label="Ask to Edit"
                mode="primary"
                size="small"
                onClick={() => {}}
              />
            </DxcFlex>
          </div>
        )}
      </DxcFlex>
    </DxcInset>
  );

  const renderStep4 = () => (
    <DxcInset>
      <DxcFlex direction="column" gap="var(--spacing-gap-l)">
        <DxcHeading level={4} text="Review and Submit" />

        <DxcTypography fontSize="font-scale-02" color="var(--color-fg-neutral-stronger)">
          Please review all information before submitting. You can expand each section to edit if needed.
        </DxcTypography>

        <DxcAccordion label="Named Insured Information" padding="medium">
          <DxcFlex direction="column" gap="var(--spacing-gap-s)">
            <DxcFlex justifyContent="space-between">
              <DxcTypography color="var(--color-fg-neutral-stronger)">Named Insured:</DxcTypography>
              <DxcTypography>{extractedData.namedInsured}</DxcTypography>
            </DxcFlex>
            <DxcFlex justifyContent="space-between">
              <DxcTypography color="var(--color-fg-neutral-stronger)">Address:</DxcTypography>
              <DxcTypography>{extractedData.mailingAddress}, {extractedData.city}, {extractedData.state} {extractedData.zipCode}</DxcTypography>
            </DxcFlex>
            <DxcFlex justifyContent="space-between">
              <DxcTypography color="var(--color-fg-neutral-stronger)">Business Type:</DxcTypography>
              <DxcTypography>{extractedData.businessType}</DxcTypography>
            </DxcFlex>
            <DxcFlex justifyContent="space-between">
              <DxcTypography color="var(--color-fg-neutral-stronger)">Years in Business:</DxcTypography>
              <DxcTypography>{extractedData.yearsInBusiness}</DxcTypography>
            </DxcFlex>
          </DxcFlex>
        </DxcAccordion>

        <DxcAccordion label="Coverage Information" padding="medium">
          <DxcFlex direction="column" gap="var(--spacing-gap-s)">
            <DxcFlex justifyContent="space-between">
              <DxcTypography color="var(--color-fg-neutral-stronger)">Coverage Type:</DxcTypography>
              <DxcTypography>{extractedData.coverageType}</DxcTypography>
            </DxcFlex>
            <DxcFlex justifyContent="space-between">
              <DxcTypography color="var(--color-fg-neutral-stronger)">Effective Date:</DxcTypography>
              <DxcTypography>{extractedData.effectiveDate}</DxcTypography>
            </DxcFlex>
            <DxcFlex justifyContent="space-between">
              <DxcTypography color="var(--color-fg-neutral-stronger)">Expiration Date:</DxcTypography>
              <DxcTypography>{extractedData.expirationDate}</DxcTypography>
            </DxcFlex>
            <DxcFlex justifyContent="space-between">
              <DxcTypography color="var(--color-fg-neutral-stronger)">Limits of Liability:</DxcTypography>
              <DxcTypography>{extractedData.limitsOfLiability}</DxcTypography>
            </DxcFlex>
          </DxcFlex>
        </DxcAccordion>

        <DxcAccordion label="Fleet Information" padding="medium">
          <DxcFlex direction="column" gap="var(--spacing-gap-s)">
            <DxcFlex justifyContent="space-between">
              <DxcTypography color="var(--color-fg-neutral-stronger)">Fleet Size:</DxcTypography>
              <DxcTypography>{extractedData.fleetSize}</DxcTypography>
            </DxcFlex>
            <DxcFlex justifyContent="space-between">
              <DxcTypography color="var(--color-fg-neutral-stronger)">Number of Drivers:</DxcTypography>
              <DxcTypography>{extractedData.driversCount}</DxcTypography>
            </DxcFlex>
            <DxcFlex justifyContent="space-between">
              <DxcTypography color="var(--color-fg-neutral-stronger)">Vehicle Types:</DxcTypography>
              <DxcTypography>{extractedData.vehicleTypes}</DxcTypography>
            </DxcFlex>
            <DxcFlex justifyContent="space-between">
              <DxcTypography color="var(--color-fg-neutral-stronger)">Radius of Operation:</DxcTypography>
              <DxcTypography>{extractedData.radiusOfOperation}</DxcTypography>
            </DxcFlex>
            <DxcFlex justifyContent="space-between">
              <DxcTypography color="var(--color-fg-neutral-stronger)">Cargo Type:</DxcTypography>
              <DxcTypography>{extractedData.cargoType}</DxcTypography>
            </DxcFlex>
          </DxcFlex>
        </DxcAccordion>

        <DxcAccordion label="Loss History" padding="medium">
          <DxcFlex direction="column" gap="var(--spacing-gap-s)">
            <DxcFlex justifyContent="space-between">
              <DxcTypography color="var(--color-fg-neutral-stronger)">Prior Carrier:</DxcTypography>
              <DxcTypography>{extractedData.priorCarrier}</DxcTypography>
            </DxcFlex>
            <DxcFlex justifyContent="space-between">
              <DxcTypography color="var(--color-fg-neutral-stronger)">Prior Policy Number:</DxcTypography>
              <DxcTypography>{extractedData.priorPolicyNumber}</DxcTypography>
            </DxcFlex>
            <DxcFlex justifyContent="space-between">
              <DxcTypography color="var(--color-fg-neutral-stronger)">Claims in Last 3 Years:</DxcTypography>
              <DxcTypography>{extractedData.claimsLast3Years}</DxcTypography>
            </DxcFlex>
            <DxcFlex justifyContent="space-between">
              <DxcTypography color="var(--color-fg-neutral-stronger)">Total Loss Amount:</DxcTypography>
              <DxcTypography>{extractedData.totalLossAmount}</DxcTypography>
            </DxcFlex>
          </DxcFlex>
        </DxcAccordion>

        <DxcAccordion label="Uploaded Documents" padding="medium">
          <DxcFlex direction="column" gap="var(--spacing-gap-s)">
            <DxcTypography fontWeight="font-weight-semibold">Insurance Forms:</DxcTypography>
            {uploadedForms.map(file => (
              <DxcTypography key={file.id}>• {file.name}</DxcTypography>
            ))}
            <DxcTypography fontWeight="font-weight-semibold" style={{ marginTop: 'var(--spacing-gap-m)' }}>
              Supporting Documents:
            </DxcTypography>
            {supportDocs.map(file => (
              <DxcTypography key={file.id}>• {file.name}</DxcTypography>
            ))}
          </DxcFlex>
        </DxcAccordion>
      </DxcFlex>
    </DxcInset>
  );

  return (
    <div style={{ padding: 'var(--spacing-padding-l)' }}>
      <DxcFlex direction="column" gap="var(--spacing-gap-l)">
        {renderBreadcrumb()}

        <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
          <DxcHeading level={2} text="New Submission" />
          <DxcTypography fontSize="font-scale-02" color="var(--color-fg-neutral-stronger)">
            {submissionId} | Commercial Auto
          </DxcTypography>
        </DxcFlex>

        {renderProgressStepper()}

        <div style={{ marginTop: 'var(--spacing-gap-l)' }}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        <DxcFlex justifyContent="space-between" style={{ marginTop: 'var(--spacing-gap-l)' }}>
          <div>
            {currentStep > 1 && (
              <DxcButton
                label="Previous Step"
                mode="secondary"
                onClick={handlePreviousStep}
              />
            )}
          </div>
          <div>
            {currentStep < 4 ? (
              <DxcButton
                label="Next Step"
                mode="primary"
                onClick={handleNextStep}
              />
            ) : (
              <DxcButton
                label="Submit Submission"
                mode="primary"
                onClick={handleSubmit}
              />
            )}
          </div>
        </DxcFlex>
      </DxcFlex>

      {/* Success Modal */}
      {showSuccessModal && (
        <DxcDialog onCloseClick={() => setShowSuccessModal(false)}>
          <div style={{ padding: 'var(--spacing-padding-l)', minWidth: '400px' }}>
            <DxcFlex direction="column" gap="var(--spacing-gap-m)" alignItems="center">
              <DxcHeading level={3} text="Success!" style={{ color: '#24A148' }} />
              <DxcTypography fontSize="font-scale-02" style={{ textAlign: 'center' }}>
                Your submission has been successfully processed. Please reach out to the support team for any questions or concerns.
              </DxcTypography>
              <DxcButton
                label="Okay"
                mode="primary"
                onClick={() => setShowSuccessModal(false)}
              />
            </DxcFlex>
          </div>
        </DxcDialog>
      )}

      {/* Documents for Processing Modal */}
      {showDocProcessingModal && (
        <DxcDialog onCloseClick={() => setShowDocProcessingModal(false)}>
          <div style={{ padding: 'var(--spacing-padding-l)', minWidth: '500px' }}>
            <DxcFlex direction="column" gap="var(--spacing-gap-l)">
              <DxcFlex alignItems="flex-start" gap="var(--spacing-gap-m)">
                <span className="material-icons" style={{ color: '#0095FF', fontSize: '32px' }}>info</span>
                <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                  <DxcHeading level={3} text="Documents for Processing" />
                  <DxcTypography fontSize="font-scale-02" color="var(--color-fg-neutral-stronger)">
                    The documents you uploaded are currently being processed by our AI extraction engine. This typically takes 2-5 minutes depending on document complexity.
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-02" color="var(--color-fg-neutral-stronger)" style={{ marginTop: 'var(--spacing-gap-s)' }}>
                    You can proceed to the next step to review the extracted data. The system will notify you if any fields require attention due to validation errors or low AI confidence.
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
                  <DxcTypography fontSize="font-scale-02">
                    Do not show this message again
                  </DxcTypography>
                </label>
              </div>

              <DxcFlex justifyContent="flex-end" gap="var(--spacing-gap-m)">
                <DxcButton
                  label="Cancel"
                  mode="secondary"
                  onClick={() => setShowDocProcessingModal(false)}
                />
                <DxcButton
                  label="Continue"
                  mode="primary"
                  onClick={handleContinueToStep3}
                />
              </DxcFlex>
            </DxcFlex>
          </div>
        </DxcDialog>
      )}
    </div>
  );
};

export default SubmissionIntake;
