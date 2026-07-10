export type ManualKycFormData = {
  // Step 1: Basic Identity
  step1: {
    firstName: string;
    lastName: string;
    gender: string;
    emailAddress: string;
    username: string;
  };

  // Step 2: Personal Information
  step2: {
    dateOfBirth: string;
    fatherOrSpouseName: string;
    mothersName: string;
    maritalStatus: string;
    nationality: string;
    residentialStatus: string;
    occupationType: string;
    annualGrossIncome: string;
    politicallyExposedPerson: "yes" | "no";
    confirmPersonalInfoTimestamp: string;
  };

  // Step 3: Address Details
  step3: {
    currentAddress: {
      addressLine1: string;
      postOffice: string;
      cityOrDistrict: string;
      state: string;
      pinCode: string;
      country: string;
      fullAddress: string;
    };
    permanentAddress: {
      sameAsCurrent: "yes" | "no";
      addressLine1?: string;
      postOffice?: string;
      cityOrDistrict?: string;
      state?: string;
      pinCode?: string;
      country?: string;
      fullAddress?: string;
    };
  };

  // Step 4: Aadhaar KYC
  step4: {
    aadhaarNumber: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    documentFileUrl: string;
    aadhaarConsent: boolean;
    confirmAadhaarTimestamp: string;
  };

  // Step 5: PAN KYC
  step5: {
    panNumber: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    documentFileUrl: string;
    panConsent: boolean;
    confirmPanTimestamp: string;
  };

  // Step 6: Bank Account
  step6: {
    bankAccounts: Array<{
      accountHolderName: string;
      bankName: string;
      accountNumber: string;
      ifscCode: string;
      accountType: string;
      isPrimary: boolean;
      bankAccountConsent: boolean;
      confirmBankTimestamp: string;
    }>;
  };

  // Step 7: Risk Profile
  step7: {
    riskQuestionnaireResponses: Array<{
      qus: string;
      ans: string;
      index: number;
      opt: string[];
    }>;
  };

  // Step 8: Compliance Declarations
  step8: {
    fatcaDeclaration: "yes" | "no";
    pepDeclaration: "yes" | "no";
    sebiTermsAcceptance: boolean;
  };

  // Step 9: Final Submission
  step9: {
    confirmAccuracy: boolean;
    kycSubmissionDate: string;
    kycStatus: "UNDER_REVIEW";
  };

  // Step 10: File Attachments
  step10: {
    eSignDocument: string;
    attachments: Array<{
      fileName: string;
      fileUrl: string;
      fileType: string;
      description?: string;
    }>;
  };
};

export type ManualKycStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

