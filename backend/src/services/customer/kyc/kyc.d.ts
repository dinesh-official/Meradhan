/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-object-type */
export type KraResponseInKyc = {
  appPanNo: string | null
  appName: string | null
  appDobDt: string | null
  appGen: string | null
  appCorAdd1: string | null
  appCorAdd2: string | null
  appCorAdd3: string | null
  appCorCity: string | null
  appCorPincd: string | null
  appCorState: string | null
  appCorCtry: string | null
  appPerAdd1: string | null
  appPerAdd2: string | null
  appPerAdd3: string | null
  appPerCity: string | null
  appPerPincd: string | null
  appPerState: string | null
  appPerCtry: string | null
}

export type KycDataStorage = {
  step_1: {
    usedExistingKra?: boolean
    kraResponse?: KraResponseInKyc | null
    aadhar?: string
    gender?: string
    pan: {
      isFatca: boolean
      lastName: string
      response: {
        id: string
        type: string
        status: string
        details: {
          pan: {
            dob: string
            name: string
            gender: string
            file_url: string
            id_number: string
            document_type: string
            id_proof_type: string
          }
          aadhaar: {
            dob: string
            name: string
            image: string
            gender: string
            file_url: string
            id_number: string
            father_name: string
            document_type: string
            id_proof_type: string
            current_address: string
            last_refresh_date: string
            permanent_address: string
            current_address_details: {
              state: string
              address: string
              pincode: string
              district_or_city: string
              locality_or_post_office: string
            }
            permanent_address_details: {
              state: string
              address: string
              pincode: string
              district_or_city: string
              locality_or_post_office: string
            }
          }
        }
        rules_data: {
          approval_rule: Array<any>
        }
        retry_count: number
        completed_at: string
        processing_done: boolean
        face_match_status: string
        validation_result: {}
        face_match_obj_type: string
        obj_analysis_status: string
        execution_request_id: string
      }
      firstName: string
      panCardNo: string
      middleName: string
      checkTerms1: boolean
      checkTerms2: boolean
      dateOfBirth: string
      confirmPanTimestamp: string
      confirmAadhaarTimestamp: string
      fetchedTimestamp: string
    }
    face: {
      url: string
      response: {
        id: string
        status: string
        actions: Array<{
          id: string
          type: string
          method: string
          status: string
          file_id: string
          action_ref: string
          retry_count: number
          sub_actions: Array<{
            id: string
            type: string
            status: string
            details: {
              address: string
              accuracy: number
              latitude: number
              longitude: number
              latitude_from_input_address: number
              longitude_from_input_address: number
              distance_from_input_address_in_kilo_metres: number
            }
            actioner: string
            optional: boolean
            input_data: string
            completed_at: string
            sub_action_ref: string
            face_match_status: string
            face_match_obj_type: string
            obj_analysis_status: string
          }>
          completed_at: string
          processing_done: boolean
          face_match_status: string
          validation_result: {}
          face_match_obj_type: string
          obj_analysis_status: string
        }>
        file_url: string
        created_at: string
        updated_at: string
        template_id: string
        reference_id: string
        auto_approved: boolean
        customer_name: string
        workflow_name: string
        expire_in_days: number
        transaction_id: string
        customer_identifier: string
        reminder_registered: boolean
      }
      timestamp: string
    }
    sign: {
      url: string
      response: {
        id: string
        status: string
        actions: Array<{
          id: string
          type: string
          status: string
          file_id: string
          action_ref: string
          rules_data: {
            strict_validation_types: Array<string>
          }
          retry_count: number
          completed_at: string
          processing_done: boolean
          face_match_status: string
          validation_result: {}
          face_match_obj_type: string
          obj_analysis_status: string
        }>
        file_url: string
        created_at: string
        updated_at: string
        template_id: string
        reference_id: string
        auto_approved: boolean
        customer_name: string
        workflow_name: string
        expire_in_days: number
        transaction_id: string
        customer_identifier: string
        reminder_registered: boolean
      }
      timestamp: string
    }
  }
  step_2: {
    fatSpuName: string
    motherName: string
    nationality: string
    maritalStatus: string
    qualification: string
    occupationType: string
    reelWithPerson: string
    annualGrossIncome: string
    residentialStatus: string
    confirmPersonalInfoTimestamp: string
    otherOccupationName?: string
  }
  step_3: Array<{
    bankName: string
    ifscCode: string
    response: {
      id: string
      verified: boolean
      verified_at: string
      validation_mode: string
      fuzzy_match_score: number
      fuzzy_match_result: boolean
      beneficiary_name_with_bank: string
    }
    isDefault: boolean
    branchName: string
    checkTerms: boolean
    isVerified: boolean
    accountNumber: string
    bankAccountType: string
    verifyTimestamp: string
    beneficiary_name: string
    confirmBankTimestamp: string
  }>
  step_4: Array<{
    dpId: string
    response: {
      data: {
        rrn: number
        dpId: string
        status: string
        clientId: string
        fstHoldrPan: string
        transactionId: string
      }
      idNo: string
      status: string
      isVerified: boolean
      fstHoldrPan: string
    }
    isDefault: boolean
    panNumber: Array<string>
    checkTerms: boolean
    isVerified: boolean
    accountType: string
    depositoryName: string
    verifyTimestamp: string
    accountHolderName: string
    beneficiaryClientId: string
    confirmDematTimestamp: string
    depositoryParticipantName: string
  }>
  step_5: Array<{
    ans: string
    opt: Array<string>
    qus: string
    index: number
  }>
  step_6: {
    terms: boolean
    response: {
      fileUrl: string
    }
  }
  stepIndex: number
  /** PDF Application Type: Re-KYC → UPDATE, first-time → NEW */
  kycApplicationType?: "NEW" | "UPDATE"
}
