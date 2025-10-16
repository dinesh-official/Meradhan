/**
 * Request Schema for POST /rest/v1/unreg
 * JSON → JSON
 */
export interface UnregisteredParticipantRequest {
    /** Unique unregistered participant code */
    loginId: string; // String(100), Mandatory

    /** Name of participant */
    firstName: string; // String(11), Mandatory

    /** PAN of participant, or "PAN_EXEMPT" if exempt */
    panNo: string; // String(30), Mandatory

    /** Custodian code if any */
    custodian?: string; // String(30), Optional

    /** Name of contact person */
    contactPerson: string; // String(250), Mandatory

    /** Array of mobile numbers (1–3 items) */
    mobileList: string[]; // Array of String(15), Mandatory

    /** Array of email IDs (1–3 items) */
    emailList: string[]; // Array of String(50), Mandatory

    /** Telephone number */
    telephone?: string; // String(10), Optional

    /** Fax number */
    fax?: string; // String(250), Optional

    /** Address lines */
    address: string; // String(250), Mandatory
    address2?: string; // String(62), Optional
    address3?: string; // String(100), Optional

    /** Domicile / Registered State Code */
    stateCode: string; // String(2), Mandatory

    /** Registered Office / Domicile Address */
    regAddress: string; // String(100), Mandatory

    /** LEI Code (if applicable) */
    leiCode?: string; // String(20), Optional

    /** LEI expiry date (if LEI is provided) */
    expiryDate?: string; // Date (YYYY-MM-DD), Optional

    /** List of bank accounts */
    bankAccountList: BankAccount[]; // Mandatory

    /** List of DP accounts */
    dpAccountList: DPAccount[]; // Mandatory
}

/** Bank Account Structure */
interface BankAccount {
    /** Name of the bank */
    bankName: string; // String(100), Mandatory

    /** IFSC Code */
    bankIFSC: string; // String(11), Mandatory

    /** Bank Account Number */
    bankAccountNo: string; // String(30), Optional

    /**
     * Indicates if this bank account is default for payouts
     * Y = Yes, N = No
     */
    isDefault: "Y" | "N"; // String(1), Mandatory
}

/** DP Account Structure */
interface DPAccount {
    /** Depository Type → NSDL or CDSL */
    dpType: "NSDL" | "CDSL"; // String(4), Mandatory

    /** DP ID → mandatory only for NSDL */
    dpId?: string; // String(8), Optional

    /** Beneficiary / Client ID */
    benId: string; // String(16 for CDSL, 8 for NSDL), Mandatory

    /**
     * Indicates if this DP account is default for payouts
     * Y = Yes, N = No
     */
    isDefault: "Y" | "N"; // String(1), Mandatory
}






/**
 * Response schema for POST /rest/v1/unreg
 * Represents an Unregistered Participant response
 */
export interface UnregisteredParticipantResponse {
    /** Unique system-generated ID for the unregistered participant */
    id: number;

    /** Always 4 → indicates "unregistered participant" */
    type: number;

    /**
     * Approval status of request
     * 100 - Pending With Checker
     * 16  - Returned by Checker
     * 15  - Rejected by Checker
     * 0   - Pending with Exchange
     * 10  - Pending with Exchange
     * 1   - Approved
     * 5   - Rejected
     * 6   - Returned
     */
    actualStatus: number;

    /** Workflow status number (same as actualStatus in some cases) */
    workflowStatusNumber: number;

    // --- Fields echoed from request ---
    loginId: string;
    firstName: string;
    panNo: string;
    custodian?: string | null;
    contactPerson: string;
    mobileList: string[];
    emailList: string[];
    telephone?: string | null;
    fax?: string | null;
    address: string;
    address2?: string | null;
    address3?: string | null;
    stateCode: string;
    regAddress: string;
    leiCode?: string | null;
    expiryDate?: string | null;

    /** Remarks from exchange/checker */
    remarks?: string | null;

    /** PAN verification status codes (same structure as actualStatus) */
    panVerStatus?: number | null;

    /** PAN verification remarks */
    panVerRemarks?: string | null;

    /** List of associated bank accounts */
    bankAccountList: BankAccountResponse[];

    /** List of associated DP accounts */
    dpAccountList: DPAccountResponse[];
}

/**
 * Bank Account structure in response
 */
interface BankAccountResponse {
    /** Name of the bank */
    bankName: string;

    /** IFSC code */
    bankIFSC: string;

    /** Account number */
    bankAccountNo?: string;

    /** Default payout indicator (Y/N) */
    isDefault: "Y" | "N";

    /**
     * Account Status
     * A = Active
     * S = Suspended
     * D = Deleted
     */
    statusType: "A" | "S" | "D";

    /**
     * Approval status of this bank account
     * 100 - Pending With Checker
     * 16  - Returned by Checker
     * 15  - Rejected by Checker
     * 0   - Pending with Exchange
     * 10  - Pending with Exchange
     * 1   - Approved
     * 5   - Rejected
     * 6   - Returned
     */
    workflowStatusNumber: number;

    /** Remarks for this account */
    remarks?: string | null;
}

/**
 * DP Account structure in response
 */
interface DPAccountResponse {
    /** Depository type → NSDL or CDSL */
    dpType: "NSDL" | "CDSL";

    /** DP ID (mandatory only for NSDL) */
    dpId?: string | null;

    /** Beneficiary / Client ID */
    benId: string;

    /** Default payout indicator (Y/N) */
    isDefault: "Y" | "N";

    /**
     * Account Status
     * A = Active
     * S = Suspended
     * D = Deleted
     */
    statusType: "A" | "S" | "D";

    /**
     * Approval status of this DP account
     * 100 - Pending With Checker
     * 16  - Returned by Checker
     * 15  - Rejected by Checker
     * 0   - Pending with Exchange
     * 10  - Pending with Exchange
     * 1   - Approved
     * 5   - Rejected
     * 6   - Returned
     */
    workflowStatusNumber: number;

    /** Remarks for this DP account */
    remarks?: string | null;
}
