/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

export type Root = {
  step_1: {
    pan: {
      isFatca: boolean;
      lastName: string;
      response: {
        id: string;
        type: string;
        status: string;
        details: {
          pan: {
            dob: string;
            name: string;
            gender: string;
            file_url: string;
            id_number: string;
            document_type: string;
            id_proof_type: string;
          };
          aadhaar: {
            dob: string;
            name: string;
            image: string;
            gender: string;
            file_url: string;
            id_number: string;
            document_type: string;
            id_proof_type: string;
            current_address: string;
            last_refresh_date: string;
            permanent_address: string;
            current_address_details: {
              state: string;
              address: string;
              pincode: string;
              district_or_city: string;
              locality_or_post_office: string;
            };
            permanent_address_details: {
              state: string;
              address: string;
              pincode: string;
              district_or_city: string;
              locality_or_post_office: string;
            };
          };
        };
        rules_data: {
          approval_rule: Array<any>;
        };
        retry_count: number;
        completed_at: string;
        processing_done: boolean;
        face_match_status: string;
        validation_result: any;
        face_match_obj_type: string;
        obj_analysis_status: string;
        execution_request_id: string;
      };
      firstName: string;
      panCardNo: string;
      middleName: string;
      checkTerms1: boolean;
      checkTerms2: boolean;
      dateOfBirth: string;
      checkKycKraConsent: boolean;
      fetchedTimestamp: string;
      confirmPanTimestamp: string;
      confirmAadhaarTimestamp: string;
    };
    face: {
      url: string;
      response: {
        id: string;
        status: string;
        actions: Array<{
          id: string;
          type: string;
          method: string;
          status: string;
          file_id: string;
          action_ref: string;
          retry_count: number;
          sub_actions: Array<{
            id: string;
            type: string;
            status: string;
            details: {
              address: string;
              accuracy: number;
              latitude: number;
              longitude: number;
              latitude_from_input_address: number;
              longitude_from_input_address: number;
              distance_from_input_address_in_kilo_metres: number;
            };
            actioner: string;
            optional: boolean;
            input_data: string;
            completed_at: string;
            sub_action_ref: string;
            face_match_status: string;
            face_match_obj_type: string;
            obj_analysis_status: string;
          }>;
          completed_at: string;
          processing_done: boolean;
          face_match_status: string;
          validation_result: any;
          face_match_obj_type: string;
          obj_analysis_status: string;
        }>;
        file_url: string;
        created_at: string;
        updated_at: string;
        template_id: string;
        reference_id: string;
        auto_approved: boolean;
        customer_name: string;
        workflow_name: string;
        expire_in_days: number;
        transaction_id: string;
        customer_identifier: string;
        reminder_registered: boolean;
      };
      timestamp: string;
    };
    sign: {
      url: string;
      response: {
        id: string;
        status: string;
        actions: Array<{
          id: string;
          type: string;
          status: string;
          file_id: string;
          action_ref: string;
          rules_data: {
            strict_validation_types: Array<string>;
          };
          retry_count: number;
          completed_at: string;
          processing_done: boolean;
          face_match_status: string;
          validation_result: any;
          face_match_obj_type: string;
          obj_analysis_status: string;
        }>;
        file_url: string;
        created_at: string;
        updated_at: string;
        template_id: string;
        reference_id: string;
        auto_approved: boolean;
        customer_name: string;
        workflow_name: string;
        expire_in_days: number;
        transaction_id: string;
        customer_identifier: string;
        reminder_registered: boolean;
      };
      timestamp: string;
    };
  };
  step_2: {
    fatSpuName: string;
    motherName: string;
    nationality: string;
    maritalStatus: string;
    qualification: string;
    occupationType: string;
    reelWithPerson: string;
    annualGrossIncome: string;
    residentialStatus: string;
  };
  step_3: Array<{
    bankName: string;
    ifscCode: string;
    response: {
      id: string;
      verified: boolean;
      verified_at: string;
      validation_mode: string;
      fuzzy_match_score: number;
      fuzzy_match_result: boolean;
      beneficiary_name_with_bank: string;
    };
    isDefault: boolean;
    branchName: string;
    checkTerms: boolean;
    isVerified: boolean;
    accountNumber: string;
    bankAccountType: string;
    beneficiary_name: string;
  }>;
  step_4: Array<{
    dpId: string;
    response: {
      data: {
        rrn: number;
        dpId: string;
        status: string;
        clientId: string;
        fstHoldrPan: string;
        transactionId: string;
      };
      idNo: string;
      status: string;
      isVerified: boolean;
      fstHoldrPan: string;
    };
    isDefault: boolean;
    panNumber: Array<string>;
    checkTerms: boolean;
    isVerified: boolean;
    accountType: string;
    depositoryName: string;
    accountHolderName: string;
    beneficiaryClientId: string;
    depositoryParticipantName: string;
  }>;
  step_5: Array<{
    ans: string;
    opt: Array<string>;
    qus: string;
    index: number;
  }>;
  step_6: {
    terms: boolean;
    response: {
      fileUrl: string;
    };
  };
  stepIndex: number;
};

function CheckedCompances({ data }: { data?: Root }) {
  return (
    <div className="scroll-mt-16" id="compliance">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            SEBI & Compliance Information
          </CardTitle>
        </CardHeader>

        <CardContent className="text-sm flex flex-col gap-1">
          <CardTitle className="text-sm">
            Compliance and Consent Confirmations
          </CardTitle>
          <p className="flex justify-start items-center gap-3 mt-3">
            <Checkbox checked={data?.step_1?.pan?.checkTerms1 || false} /> I
            hereby confirm that I am not a Politically Exposed Person (PEP) nor
            related to any PEP
          </p>
          <p className="flex justify-start items-center gap-3 mt-2">
            <Checkbox checked={data?.step_1?.pan?.checkTerms2 || false} /> I
            hereby confirm that I am not a person and/or entity debarred from
            accessing the securities market or dealing in securities, as per
            directions or orders issued by SEBI
          </p>
          <p className="flex justify-start items-center gap-3 mt-2">
            <Checkbox checked={data?.step_1?.pan?.isFatca || false} /> I confirm
            that I am an Indian citizen and solely a tax resident of India, not
            of any other country (FATCA)
          </p>

          <p className="flex justify-start items-center gap-3 mt-2">
            <Checkbox
              checked={data?.step_1?.pan?.checkKycKraConsent || false}
            />{" "}
            By clicking Continue to Verify, I hereby agree to and provide
            consent for the following:
          </p>

          <div>
            <ul className="text-sm list-disc ml-10  flex flex-col gap-2 mt-2">
              <li>
                I hereby declare that I am a resident individual as per the
                applicable laws of India and not a Non-Resident Indian (NRI).
              </li>
              <li>
                I hereby confirm to authorize MeraDhan to access and retrieve my
                PAN and Aadhaar card details from DigiLocker for the purpose of
                conducting SEBI-compliant KYC verification. I understand that
                this information will be used solely for regulatory compliance
                and will be securely stored in accordance with applicable laws
                and SEBI guidelines.
              </li>
              <li>
                I hereby provide my consent to MeraDhan to collect, use, store,
                and process my personal data for Know Your Customer (KYC)
                purposes in compliance with SEBI regulations. This includes
                retrieval of KYC records from KYC Registration Agencies (KRAs),
                as may be required, and share my details with KYC registration
                agencies.
              </li>
            </ul>
          </div>

          <p className="flex justify-start items-center gap-3 mt-2">
            <Checkbox checked={data?.step_3?.[0]?.checkTerms || false} /> I
            hereby authorise MeraDhan to verify the bank account details
            provided by initiating a nominal amount transfer (₹1) to my account
            for verification purposes
          </p>

          <p className="flex justify-start items-center gap-3 mt-2">
            <Checkbox checked={data?.step_4?.[0]?.checkTerms || false} />I
            hereby authorize MeraDhan to verify my Demat account details
            provided herein for the purpose of completing KYC and investment
            onboarding, in accordance with applicable regulatory guidelines.
          </p>

          <p className="flex justify-start items-start gap-3 mt-2">
            <Checkbox checked={data?.step_6?.terms || false} className="mt-1" />
            <div>
              <p> By continue, I agree to the following terms:</p>
              <ul className="text-sm list-disc ml-3 mt-2 flex flex-col gap-2">
                <li>
                  I hereby authorize MeraDhan to use my Aadhaar / Virtual ID
                  details (as applicable) solely for the purpose of e-Signing my
                  KYC / Re-KYC registration.
                </li>
                <li>
                  I hereby authorize MeraDhan to share my information with NSE /
                  BSE for the facilitation of bond trading.
                </li>
              </ul>
            </div>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default CheckedCompances;
