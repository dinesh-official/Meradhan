import { db } from "@core/database/database";


const customerId = 3;

const data = {
  "names": {
    "fullNameAsPerPan": "",
    "fullNameAsPerBank": "",
    "fullNameAsPerAadhar": ""
  },
  "step_1": {
    "pan": {
      "isFatca": true,
      "lastName": "KUKREJA",
      "response": {
        "type": "digilocker",
        "status": "success",
        "details": {
          "pan": {
            "dob": "30/05/1983",
            "name": "VIKAS KUKREJA",
            "id_number": "AVEPK6139M",
            "document_type": "pan",
            "id_proof_type": "ID_PROOF"
          },
          "aadhaar": {
            "dob": "30/05/1983",
            "name": "Vikas Kukreja",
            "image": "/2026/MD1HRXWON/kyc/1771510533596-profile.png",
            "gender": "M",
            "file_url": "/2026/MD1HRXWON/kyc/1771510533522-in.gov.uidai-ADHAR-DDI260219194525970FRB6RZT57D23K9.pdf.pdf",
            "id_number": "xxxxxxxx5868",
            "document_type": "aadhaar",
            "id_proof_type": "ID_AND_ADDRESS_PROOF",
            "current_address": "C/O Surender Pal Kukreja,House N0 4/7,Oppositr Old Water Tank Shiv Mandir Ward Gadarpur,Post Office Gadarpur Tehsil,Gadarpur,Gadarpura,Udham Singh Nagar,Uttarakhand,263152",
            "last_refresh_date": "2026-02-19 19:45:02",
            "permanent_address": "C/O Surender Pal Kukreja,House N0 4/7,Oppositr Old Water Tank Shiv Mandir Ward Gadarpur,Post Office Gadarpur Tehsil,Gadarpur,Gadarpura,Udham Singh Nagar,Uttarakhand,263152",
            "current_address_details": {
              "state": "Uttarakhand",
              "address": "C/O Surender Pal Kukreja,House N0 4/7,Oppositr Old Water Tank Shiv Mandir Ward Gadarpur,Post Office Gadarpur Tehsil,Gadarpur,Gadarpura,Udham Singh Nagar,Uttarakhand,263152",
              "pincode": "263152",
              "district_or_city": "Udham Singh Nagar",
              "locality_or_post_office": "Gadarpura"
            },
            "permanent_address_details": {
              "state": "Uttarakhand",
              "address": "C/O Surender Pal Kukreja,House N0 4/7,Oppositr Old Water Tank Shiv Mandir Ward Gadarpur,Post Office Gadarpur Tehsil,Gadarpur,Gadarpura,Udham Singh Nagar,Uttarakhand,263152",
              "pincode": "263152",
              "district_or_city": "Udham Singh Nagar",
              "locality_or_post_office": "Gadarpura"
            }
          },
          "panInfo": {
            "pan": "AVEPK6139M",
            "status": "valid",
            "category": "individual",
            "date_of_birth_match": true,
            "name_as_per_pan_match": true,
            "aadhaar_seeding_status": "y"
          }
        }
      },
      "firstName": "VIKAS",
      "panCardNo": "AVEPK6139M",
      "middleName": "",
      "checkTerms1": true,
      "checkTerms2": true,
      "dateOfBirth": "1983-05-30",
      "panRetryCount": 1,
      "fetchedTimestamp": "2026-02-19T14:15:28.000Z",
      "checkKycKraConsent": true,
      "confirmPanTimestamp": "2026-02-19T14:12:47.239Z",
      "confirmAadhaarTimestamp": "2026-02-19T14:16:19.321Z"
    },
    "face": {
      "url": "/2026/MD1HRXWON/kyc/1771510611038-selfie.jpeg",
      "response": {
        "id": "KID260219194622056GY1Z2A2HIRGO8F",
        "status": "approval_pending",
        "actions": [
          {
            "id": "KIA2602191946220578SVESN77I5PF6V",
            "type": "selfie",
            "method": "otp_none",
            "status": "success",
            "file_id": "FIL260219194645732SITSFSU62QOCSL",
            "action_ref": "selfie-1",
            "rules_data": {
              "approval_rule": []
            },
            "retry_count": 1,
            "sub_actions": [
              {
                "id": "KSA260219194622057DIDQEBFCH6CW57",
                "type": "GEO_TAGGING",
                "status": "success",
                "details": {
                  "address": "1467, Govindpuri Road, Govindpuri, New Delhi, South East Delhi, Delhi Division, Delhi, India, 110019",
                  "accuracy": 51,
                  "latitude": 28.532389,
                  "longitude": 77.262794,
                  "latitude_from_input_address": 0,
                  "longitude_from_input_address": 0,
                  "distance_from_input_address_in_kilo_metres": 0
                },
                "actioner": "USER",
                "optional": false,
                "input_data": "{\"latitude\":28.532389,\"longitude\":77.262794,\"accuracy\":51.0,\"address\":\"1467, Govindpuri Road, Govindpuri, New Delhi, South East Delhi, Delhi Division, Delhi, India, 110019\",\"latitude_from_input_address\":0.0,\"longitude_from_input_address\":0.0,\"distance_from_input_address_in_kilo_metres\":0.0}",
                "completed_at": "2026-02-19 19:46:46",
                "sub_action_ref": "geo_tagging-1",
                "face_match_status": "na",
                "face_match_obj_type": "none",
                "obj_analysis_status": "na"
              }
            ],
            "completed_at": "2026-02-19 19:46:46",
            "processing_done": true,
            "face_match_status": "done",
            "validation_result": {},
            "face_match_obj_type": "source",
            "obj_analysis_status": "na"
          }
        ],
        "file_url": "/2026/MD1HRXWON/kyc/1771510611038-selfie.jpeg",
        "created_at": "2026-02-19 19:46:22",
        "updated_at": "2026-02-19 19:46:50",
        "template_id": "KTP251113184217678DNOG25ACQJF2JV",
        "reference_id": "MD1HRXWON",
        "auto_approved": false,
        "customer_name": "VIKAS KUKREJA",
        "workflow_name": "SELFIEDATA",
        "expire_in_days": 10,
        "transaction_id": "1cf8ef19-5084-4a22-8847-bedf78784ede",
        "customer_identifier": "vikas.kukreja83@gmail.com",
        "reminder_registered": false
      },
      "timestamp": "2026-02-19T14:16:57.331Z"
    },
    "sign": {
      "url": "/2026/MD1HRXWON/kyc/sign/1771510628786-sign.jpeg",
      "response": {
        "id": "KID260219194659255V2L3ETQHEV95N8",
        "status": "approval_pending",
        "actions": [
          {
            "id": "KIA260219194659256NQ3U8GXIR3BYMG",
            "type": "image",
            "status": "success",
            "file_id": "FIL260219194704269ZH49AHGHQTIQNO",
            "action_ref": "signature-1",
            "rules_data": {
              "strict_validation_types": [
                "signature"
              ]
            },
            "retry_count": 1,
            "completed_at": "2026-02-19 19:47:05",
            "processing_done": false,
            "face_match_status": "na",
            "validation_result": {},
            "face_match_obj_type": "none",
            "obj_analysis_status": "na"
          }
        ],
        "file_url": "/2026/MD1HRXWON/kyc/sign/1771510628786-sign.jpeg",
        "created_at": "2026-02-19 19:46:59",
        "updated_at": "2026-02-19 19:47:05",
        "template_id": "KTP2508231039406283179UXES8RTCLJ",
        "reference_id": "MD1HRXWON",
        "auto_approved": false,
        "customer_name": "VIKAS KUKREJA",
        "workflow_name": "SIGNATURE",
        "expire_in_days": 10,
        "transaction_id": "470c9145-6d1e-4d65-9488-05234832b3c0",
        "customer_identifier": "vikas.kukreja83@gmail.com",
        "reminder_registered": false
      },
      "timestamp": "2026-02-19T14:17:09.924Z"
    },
    "aadhar": "",
    "gender": "M",
    "nameMismatchDeclaration": {
      "score": 100,
      "decision": "MATCH_FULL",
      "mismatch": true,
      "retryCount": 0,
      "isConfirmed": false,
      "isDownloaded": false
    }
  },
  "step_2": {
    "fatSpuName": "Surender Pal Kukreja",
    "motherName": "Vimla Rani",
    "nationality": "IN - Indian",
    "maritalStatus": "MARRIED",
    "qualification": "GRADUATE",
    "occupationType": "Private Sector",
    "reelWithPerson": "FATHER",
    "annualGrossIncome": "0-1L",
    "residentialStatus": "Resident Individual",
    "otherOccupationName": "",
    "confirmPersonalInfoTimestamp": "2026-02-19T14:17:30.016Z"
  },
  "step_3": [
    {
      "bankName": "ICICI Bank",
      "ifscCode": "ICIC0004081",
      "response": {
        "id": "3WHL88LRXA155LJ",
        "verified": true,
        "verified_at": "2026-02-19 19:47:41",
        "validation_mode": "PENNY_DROP",
        "fuzzy_match_score": 27,
        "fuzzy_match_result": false,
        "beneficiary_name_with_bank": "Dummy Customer Name"
      },
      "isDefault": true,
      "branchName": "GADARPUR",
      "checkTerms": true,
      "isVerified": true,
      "accountNumber": "000701632678",
      "bankAccountType": "savings",
      "verifyTimestamp": "2026-02-19T14:17:41.744Z",
      "beneficiary_name": "Dummy Customer Name",
      "confirmBankTimestamp": "2026-02-19T14:17:48.208Z"
    }
  ],
  "step_4": [
    {
      "dpId": "",
      "isDefault": true,
      "panNumber": [
        "AVEPK6139M"
      ],
      "checkTerms": true,
      "isVerified": true,
      "accountType": "SOLO",
      "depositoryName": "CDSL",
      "accountHolderName": "VIKAS KUKREJA",
      "beneficiaryClientId": "1208160187436525",
      "depositoryParticipantName": "ZERODHA BROKING LIMITED"
    }
  ],
  "step_5": [
    {
      "ans": "",
      "opt": [
        "None",
        "Up to 1 year",
        "1 – 5 years",
        "More than 5 years"
      ],
      "qus": "How many years of investment experience do you have?",
      "index": 0
    },
    {
      "ans": "",
      "opt": [
        "Steady Income",
        "Capital Gains",
        "Short-term Parking",
        "Risk Diversification"
      ],
      "qus": "What is your investment goal?",
      "index": 1
    },
    {
      "ans": "",
      "opt": [
        "Low Risk & Low Returns",
        "Moderate Risk & Moderate Returns",
        "High Risk & High Returns"
      ],
      "qus": "What is your risk appetite?",
      "index": 2
    },
    {
      "ans": "",
      "opt": [
        "Up to 1 year",
        "1 – 3 years",
        "3 – 5 years",
        "More than 5 years"
      ],
      "qus": "What is your investment time horizon?",
      "index": 3
    }
  ],
  "step_6": {
    "terms": false
  },
  "stepIndex": 0
}


const test = async (): Promise<void> => {

  await db.dataBase.kYC_FLOW.updateMany({
    where: {
      userID: customerId,
      markExpired: false
    },
    data: {
      kycUserId: customerId,
      data: data,
      step: 5,
    },
  });
  console.log("done");
};

test().then(() => {
  console.log("done");
}).catch((error) => {
  console.log(error);
});