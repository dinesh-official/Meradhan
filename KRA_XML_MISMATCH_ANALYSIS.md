# KRA XML Template vs Sample Mismatch Analysis

## Summary
Comparing the XML template in `KraXMLBuilder.ts` (Untitled-4) with the sample XML (Untitled-3) to identify missing fields.

## Missing Fields in Sample XML (Untitled-3)

The following fields are present in the template but **MISSING** in the sample XML:

### 1. Header Fields (Critical - Required for KRA API)
- ❌ `APP_IOP_FLG` - IOP Flag (Inquiry/Issue/Modify flag)
- ❌ `APP_POS_CODE` - POS Code (Point of Service Code)
- ❌ `APP_MOBILE_NO` - Mobile Number

### Impact
These three fields are typically **required** by the KRA API and are present in all other sample requests found in the codebase. Their absence in the sample could cause API failures.

## Field Comparison

### ✅ All Other Fields Match

All other 79 fields are present in both:
- Personal Information (APP_TYPE, APP_NO, APP_DATE, APP_PAN_NO, etc.)
- Address Fields (APP_COR_ADD1-3, APP_PER_ADD1-3, etc.)
- Contact Fields (APP_OFF_NO, APP_RES_NO, APP_MOB_NO, APP_FAX_NO, APP_EMAIL)
- Income & Occupation (APP_INCOME, APP_OCC, APP_OTH_OCC)
- FATCA Fields (APP_FATCA_APPLICABLE_FLAG, APP_FATCA_BIRTH_PLACE, etc.)
- Status Fields (APP_STATUS, APP_STATUSDT, APP_ERROR_DESC - empty in both)
- Other metadata fields

## Recommendations

1. **Add Missing Fields to Sample XML:**
   ```xml
   <APP_IOP_FLG>II</APP_IOP_FLG>  <!-- II = Inquiry/Issue, IE = Inquiry/Existing -->
   <APP_POS_CODE>A1249</APP_POS_CODE>  <!-- Your POS Code -->
   <APP_MOBILE_NO>9299999999</APP_MOBILE_NO>  <!-- 10-digit mobile number -->
   ```

2. **Verify Field Values:**
   - `APP_IOP_FLG`: Should be "II" for new registration or "IE" for existing
   - `APP_POS_CODE`: Should match your registered KRA POS code
   - `APP_MOBILE_NO`: Should be a valid 10-digit Indian mobile number

3. **Check Other Sample Files:**
   Based on grep results, other sample files in the codebase include these fields:
   - `KYC Modification Request with Fatca Yes.xml` - Has all three fields
   - `Registration API Request with Fatca No.xml` - Has APP_IOP_FLG and APP_POS_CODE
   - `Registration API Request with Fatca Yes.xml` - Has APP_IOP_FLG and APP_POS_CODE

## Code Location
- Template: `packages/kyc-providers/src/kra/KraXMLBuilder.ts` (lines 347-437)
- Sample files: `packages/kyc-providers/src/kra/_docs/api/Sample Request and Response/`


