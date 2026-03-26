/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
export type TDigioWithTemplateResponse = {
  id: string;
  created_at: string;
  status: string;
  customer_identifier: string;
  reference_id: string;
  transaction_id: string;
  customer_name: string;
  expire_in_days: number;
  reminder_registered: boolean;
  access_token: {
    entity_id: string;
    id: string;
    valid_till: string;
    created_at: string;
  };
  workflow_name: string;
  auto_approved: boolean;
  template_id: string;
  signing_parties?: Array<{
    name: string;
    status: string;
    type: string;
    signature_type: string;
    identifier: string;
    reason: string;
    expire_on: string;
  }>;
};

export type TVerifyBankAccountResponse = {
  id: string;
  verified: boolean;
  verified_at: string;
  beneficiary_name_with_bank: string;
  fuzzy_match_result: boolean;
  fuzzy_match_score: number;
  validation_mode: string;
};

export type DigioAadharPanData = {
  id: string;
  updated_at: string;
  created_at: string;
  status: string;
  customer_identifier: string;
  actions: Array<{
    id: string;
    type: string;
    status: string;
    execution_request_id: string;
    details: {
      aadhaar: {
        id_number: string;
        document_type: string;
        id_proof_type: string;
        gender: string;
        image: string;
        name: string;
        last_refresh_date: string;
        dob: string;
        current_address: string;
        permanent_address: string;
        file_url?: string;
        father_name?: string;
        current_address_details: {
          address: string;
          locality_or_post_office: string;
          district_or_city: string;
          state: string;
          pincode: string;
        };
        permanent_address_details: {
          address: string;
          locality_or_post_office: string;
          district_or_city: string;
          state: string;
          pincode: string;
        };
      };
      pan: {
        id_number: string;
        document_type: string;
        id_proof_type: string;
        gender: string;
        name: string;
        dob: string;
        file_url?: string;
      };
      panInfo: {
        aadhaar_seeding_status: string;
        name_as_per_pan_match: boolean;
        pan: string;
        category: string;
        status: string;
        date_of_birth_match: boolean;
      };
    };
    validation_result: {};
    completed_at: string;
    face_match_obj_type: string;
    face_match_status: string;
    obj_analysis_status: string;
    processing_done: boolean;
    retry_count: number;
    rules_data: {
      approval_rule: Array<any>;
    };
  }>;
  reference_id: string;
  transaction_id: string;
  customer_name: string;
  expire_in_days: number;
  reminder_registered: boolean;
  workflow_name: string;
  auto_approved: boolean;
  template_id: string;
};

export type DigioFaceDataResponse = {
  id: string;
  updated_at: string;
  created_at: string;
  status: string;
  customer_identifier: string;
  file_url?: string;
  actions: Array<{
    id: string;
    action_ref: string;
    type: string;
    status: string;
    file_id: string;
    sub_actions: Array<{
      id: string;
      type: string;
      status: string;
      details?: {
        longitude_from_input_address: number;
        latitude: number;
        accuracy: number;
        distance_from_input_address_in_kilo_metres: number;
        latitude_from_input_address: number;
        longitude: number;
      };
      sub_action_ref: string;
      optional: boolean;
      actioner: string;
      input_data?: string;
      obj_analysis_status: string;
      face_match_obj_type: string;
      face_match_status: string;
      completed_at: string;
      title?: string;
      description?: string;
    }>;
    validation_result: {};
    completed_at: string;
    face_match_obj_type: string;
    face_match_status: string;
    obj_analysis_status: string;
    method: string;
    processing_done: boolean;
    retry_count: number;
    rules_data: {
      approval_rule: Array<any>;
      next_action_rules: Array<{
        condition: Array<any>;
        terminate: boolean;
        terminate_type: string;
        skip_message: string;
        name: string;
        passed: boolean;
        unique_id: string;
      }>;
    };
  }>;
  reference_id: string;
  transaction_id: string;
  customer_name: string;
  expire_in_days: number;
  reminder_registered: boolean;
  workflow_name: string;
  auto_approved: boolean;
  template_id: string;
};

// Digio Signature Response Types
export interface DigioSignatureResponse {
  id: string;
  is_agreement: boolean;
  agreement_type: "inbound" | "outbound";
  agreement_status: "requested" | "completed" | "failed" | string;
  file_name: string;
  created_at: string; // ISO timestamp
  self_signed: boolean;
  self_sign_type: "aadhaar" | string;
  no_of_pages: number;
  signing_parties: SigningParty[];
  sign_request_details: SignRequestDetails;
  channel: "api" | "dashboard" | string;
  other_doc_details: Record<string, any>;
  access_token?: AccessToken;
  attached_estamp_details: Record<string, any>;
  file_url: string;
}

interface SigningParty {
  name: string;
  status: "requested" | "signed" | "pending" | string;
  type: "self" | "other" | string;
  signature_type: "aadhaar" | string;
  identifier: string;
  reason: string;
  expire_on: string; // ISO timestamp
}

interface SignRequestDetails {
  name: string;
  requested_on: string; // ISO timestamp
  expire_on: string; // ISO timestamp
  identifier: string;
  requester_type: "org" | "user" | string;
}

interface AccessToken {
  entity_id: string;
  id: string;
  valid_till: string; // ISO timestamp
  created_at: string; // ISO timestamp
}

export interface DigioBankVerifyResponse {
  id: string;
  verified: boolean;
  verified_at: string;
  beneficiary_name_with_bank: string;
  fuzzy_match_result: boolean;
  fuzzy_match_score: number;
  validation_mode: string;
}
