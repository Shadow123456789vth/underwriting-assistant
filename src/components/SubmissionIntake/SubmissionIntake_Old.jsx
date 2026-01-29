import { useState } from 'react';
import {
  DxcHeading,
  DxcFlex,
  DxcContainer,
  DxcTypography,
  DxcButton,
  DxcTextInput,
  DxcSelect,
  DxcDateInput,
  DxcTextarea,
  DxcRadioGroup,
  DxcProgressBar,
  DxcAlert,
  DxcInset,
} from '@dxc-technology/halstack-react';
import './SubmissionIntake.css';

const SubmissionIntake = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    // Life & Annuity - Applicant Info
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    ssn: '',
    email: '',
    phone: '',

    // P&C - Business Info
    businessName: '',
    businessType: '',
    yearsInBusiness: '',
    contactEmail: '',
    contactPhone: '',

    // Coverage Info (Common)
    lineOfBusiness: '',
    coverageAmount: '',
    effectiveDate: '',

    // Life & Annuity - Medical Info
    hasMedicalConditions: '',
    medicalDetails: '',
    smoker: '',

    // Life & Annuity - Additional Info
    occupation: '',
    annualIncome: '',
    beneficiary: '',

    // P&C - Fleet Info
    fleetSize: '',
    vehicleTypes: '',
    driversCount: '',
    radiusOfOperation: '',
    cargoType: '',

    // P&C - Loss History
    lossHistory: '',
    claimsCount: '',
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    console.log('Submitting:', formData);
    setShowSuccess(true);
  };

  const handleCancel = () => {
    setFormData({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      ssn: '',
      email: '',
      phone: '',
      lineOfBusiness: '',
      coverageAmount: '',
      effectiveDate: '',
      hasMedicalConditions: '',
      medicalDetails: '',
      smoker: '',
      occupation: '',
      annualIncome: '',
      beneficiary: '',
    });
    setCurrentStep(1);
    setShowSuccess(false);
  };

  const lobOptions = [
    { label: 'Commercial Auto - Fleet', value: 'fleet' },
    { label: 'Commercial Auto - For-Hire', value: 'for-hire' },
    { label: 'Commercial Auto - Business Use', value: 'business-use' },
  ];

  const coverageOptions = [
    { label: '$250,000', value: '250000' },
    { label: '$500,000', value: '500000' },
    { label: '$750,000', value: '750000' },
    { label: '$1,000,000', value: '1000000' },
    { label: '$2,000,000', value: '2000000' },
  ];

  return (
    <div style={{ padding: '24px', width: '100%', backgroundColor: '#f5f5f5' }}>
      <DxcFlex direction="column" gap="var(--spacing-gap-m)">
        <DxcHeading level={1} text="New Underwriting Submission" />

        {showSuccess ? (
          <div style={{
            backgroundColor: "var(--color-bg-neutral-lightest)",
            borderRadius: "var(--border-radius-m)",
            boxShadow: "var(--shadow-mid-02)",
            padding: "var(--spacing-padding-l)"
          }}>
            <DxcFlex direction="column" gap="var(--spacing-gap-l)" alignItems="center">
              <DxcAlert
                type="success"
                mode="inline"
                children={
                  <DxcInset space="var(--spacing-padding-s)">
                    <DxcTypography fontSize="font-scale-03">
                      Submission successfully created! Reference number: UW-2026-{Math.floor(Math.random() * 1000)}
                    </DxcTypography>
                  </DxcInset>
                }
              />

              <div style={{ textAlign: 'center', maxWidth: '600px' }}>
                <DxcHeading level={3} text="What happens next?" />
                <DxcFlex direction="column" gap="var(--spacing-gap-m)" style={{ marginTop: 'var(--spacing-gap-m)' }}>
                  <div style={{
                    padding: 'var(--spacing-padding-m)',
                    backgroundColor: 'var(--color-bg-neutral-lighter)',
                    borderRadius: 'var(--border-radius-m)',
                    textAlign: 'left'
                  }}>
                    <DxcFlex gap="var(--spacing-gap-s)">
                      <span className="material-icons" style={{ color: '#0095FF' }}>assignment</span>
                      <div>
                        <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                          Assigned to Underwriter
                        </DxcTypography>
                        <DxcTypography fontSize="font-scale-02" color="var(--color-fg-neutral-dark)">
                          Your submission will be assigned to an underwriter within 24 hours.
                        </DxcTypography>
                      </div>
                    </DxcFlex>
                  </div>

                  <div style={{
                    padding: 'var(--spacing-padding-m)',
                    backgroundColor: 'var(--color-bg-neutral-lighter)',
                    borderRadius: 'var(--border-radius-m)',
                    textAlign: 'left'
                  }}>
                    <DxcFlex gap="var(--spacing-gap-s)">
                      <span className="material-icons" style={{ color: '#0095FF' }}>description</span>
                      <div>
                        <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                          Document Review
                        </DxcTypography>
                        <DxcTypography fontSize="font-scale-02" color="var(--color-fg-neutral-dark)">
                          The underwriter will review all submitted documents and may request additional information.
                        </DxcTypography>
                      </div>
                    </DxcFlex>
                  </div>

                  <div style={{
                    padding: 'var(--spacing-padding-m)',
                    backgroundColor: 'var(--color-bg-neutral-lighter)',
                    borderRadius: 'var(--border-radius-m)',
                    textAlign: 'left'
                  }}>
                    <DxcFlex gap="var(--spacing-gap-s)">
                      <span className="material-icons" style={{ color: '#0095FF' }}>check_circle</span>
                      <div>
                        <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                          Decision
                        </DxcTypography>
                        <DxcTypography fontSize="font-scale-02" color="var(--color-fg-neutral-dark)">
                          You will receive a decision within 5-7 business days.
                        </DxcTypography>
                      </div>
                    </DxcFlex>
                  </div>
                </DxcFlex>
              </div>

              <DxcButton
                label="Create Another Submission"
                onClick={handleCancel}
              />
            </DxcFlex>
          </div>
        ) : (
          <>
            {/* Progress Bar */}
            <div style={{
              backgroundColor: "var(--color-bg-neutral-lightest)",
              borderRadius: "var(--border-radius-m)",
              boxShadow: "var(--shadow-mid-02)",
              padding: "var(--spacing-padding-m)"
            }}>
              <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                <DxcFlex justifyContent="space-between" alignItems="center">
                  <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                    Step {currentStep} of {totalSteps}
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-03" color="#0095FF">
                    {Math.round(progress)}% Complete
                  </DxcTypography>
                </DxcFlex>
                <DxcProgressBar
                  value={progress}
                  showValue={false}
                />
              </DxcFlex>
            </div>

            {/* Form Content */}
            <div style={{
              backgroundColor: "var(--color-bg-neutral-lightest)",
              borderRadius: "var(--border-radius-m)",
              boxShadow: "var(--shadow-mid-02)",
              padding: "var(--spacing-padding-l)"
            }}>
              <DxcFlex direction="column" gap="var(--spacing-gap-l)">
                {currentStep === 1 && (
                  <div>
                    <DxcHeading level={3} text="Business Information" />
                    <DxcFlex direction="column" gap="var(--spacing-gap-m)" style={{ marginTop: 'var(--spacing-gap-m)' }}>
                      <DxcTextInput
                        label="Business Name"
                        placeholder="Enter business name"
                        value={formData.businessName}
                        onChange={({ value }) => handleInputChange('businessName', value)}
                      />
                      <DxcFlex gap="var(--spacing-gap-m)">
                        <DxcTextInput
                          label="Business Type"
                          placeholder="e.g., LLC, Corporation"
                          value={formData.businessType}
                          onChange={({ value }) => handleInputChange('businessType', value)}
                        />
                        <DxcTextInput
                          label="Years in Business"
                          placeholder="Enter years"
                          value={formData.yearsInBusiness}
                          onChange={({ value }) => handleInputChange('yearsInBusiness', value)}
                        />
                      </DxcFlex>
                      <DxcFlex gap="var(--spacing-gap-m)">
                        <DxcTextInput
                          label="Contact Email"
                          placeholder="Enter email address"
                          value={formData.contactEmail}
                          onChange={({ value }) => handleInputChange('contactEmail', value)}
                        />
                        <DxcTextInput
                          label="Contact Phone"
                          placeholder="(XXX) XXX-XXXX"
                          value={formData.contactPhone}
                          onChange={({ value }) => handleInputChange('contactPhone', value)}
                        />
                      </DxcFlex>
                    </DxcFlex>
                  </div>
                )}

                {currentStep === 2 && (
                  <div>
                    <DxcHeading level={3} text="Coverage Information" />
                    <DxcFlex direction="column" gap="var(--spacing-gap-m)" style={{ marginTop: 'var(--spacing-gap-m)' }}>
                      <DxcSelect
                        label="Line of Business"
                        placeholder="Select product type"
                        options={lobOptions}
                        value={formData.lineOfBusiness}
                        onChange={({ value }) => handleInputChange('lineOfBusiness', value)}
                      />
                      <DxcSelect
                        label="Coverage Amount"
                        placeholder="Select coverage amount"
                        options={coverageOptions}
                        value={formData.coverageAmount}
                        onChange={({ value }) => handleInputChange('coverageAmount', value)}
                      />
                      <DxcDateInput
                        label="Desired Effective Date"
                        placeholder="MM/DD/YYYY"
                        value={formData.effectiveDate}
                        onChange={({ value }) => handleInputChange('effectiveDate', value)}
                      />
                    </DxcFlex>
                  </div>
                )}

                {currentStep === 3 && (
                  <div>
                    <DxcHeading level={3} text="Fleet Information" />
                    <DxcFlex direction="column" gap="var(--spacing-gap-m)" style={{ marginTop: 'var(--spacing-gap-m)' }}>
                      <DxcFlex gap="var(--spacing-gap-m)">
                        <DxcTextInput
                          label="Fleet Size"
                          placeholder="Number of vehicles"
                          value={formData.fleetSize}
                          onChange={({ value }) => handleInputChange('fleetSize', value)}
                        />
                        <DxcTextInput
                          label="Number of Drivers"
                          placeholder="Enter driver count"
                          value={formData.driversCount}
                          onChange={({ value }) => handleInputChange('driversCount', value)}
                        />
                      </DxcFlex>
                      <DxcTextarea
                        label="Vehicle Types"
                        placeholder="e.g., 15 Tractors, 5 Box Trucks"
                        value={formData.vehicleTypes}
                        onChange={({ value }) => handleInputChange('vehicleTypes', value)}
                        rows={3}
                      />
                      <DxcSelect
                        label="Radius of Operation"
                        placeholder="Select radius"
                        options={[
                          { label: 'Local (under 50 miles)', value: 'local' },
                          { label: 'Regional (200-500 miles)', value: 'regional' },
                          { label: 'Long Haul (500+ miles)', value: 'long-haul' }
                        ]}
                        value={formData.radiusOfOperation}
                        onChange={({ value }) => handleInputChange('radiusOfOperation', value)}
                      />
                      <DxcTextInput
                        label="Cargo Type"
                        placeholder="e.g., General Freight, Hazardous Materials"
                        value={formData.cargoType}
                        onChange={({ value }) => handleInputChange('cargoType', value)}
                      />
                    </DxcFlex>
                  </div>
                )}

                {currentStep === 4 && (
                  <div>
                    <DxcHeading level={3} text="Loss History" />
                    <DxcFlex direction="column" gap="var(--spacing-gap-m)" style={{ marginTop: 'var(--spacing-gap-m)' }}>
                      <DxcTextInput
                        label="Number of Claims (Last 3 Years)"
                        placeholder="Enter number of claims"
                        value={formData.claimsCount}
                        onChange={({ value }) => handleInputChange('claimsCount', value)}
                      />
                      <DxcTextarea
                        label="Loss History Details"
                        placeholder="Describe any accidents, claims, or losses in the past 3 years"
                        value={formData.lossHistory}
                        onChange={({ value }) => handleInputChange('lossHistory', value)}
                        rows={4}
                      />
                    </DxcFlex>
                  </div>
                )}

                {/* Navigation Buttons */}
                <DxcFlex justifyContent="space-between" style={{ marginTop: 'var(--spacing-gap-m)' }}>
                  <DxcFlex gap="var(--spacing-gap-m)">
                    {currentStep > 1 && (
                      <DxcButton
                        label="Back"
                        mode="secondary"
                        onClick={handleBack}
                      />
                    )}
                    <DxcButton
                      label="Cancel"
                      mode="tertiary"
                      onClick={handleCancel}
                    />
                  </DxcFlex>
                  {currentStep < totalSteps ? (
                    <DxcButton
                      label="Next"
                      icon="arrow_forward"
                      iconPosition="after"
                      onClick={handleNext}
                    />
                  ) : (
                    <DxcButton
                      label="Submit"
                      icon="check"
                      onClick={handleSubmit}
                    />
                  )}
                </DxcFlex>
              </DxcFlex>
            </div>
          </>
        )}
      </DxcFlex>
    </div>
  );
};

export default SubmissionIntake;
