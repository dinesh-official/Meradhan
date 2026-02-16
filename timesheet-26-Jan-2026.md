# Developer Timesheet

**Developer Name:** Sourav  
**Project Name:** MeraDhan Client Side.
**Date:** 26 - Jan - 2026

| Start Time | End Time | Task | Task Description | Challenges |
|------------|----------|------|------------------|------------|
| 10:00 am | 11:00 am | KRA Status Fix - Analysis | Analyzed KRA status checking logic and identified three critical fixes needed in CheckKraStatus.ts | Understanding complex status combinations and edge cases |
| 11:00 am | 12:00 pm | KRA Fix 1 - MODIFY Rejection | Implemented fix to prevent CBRICS Register when MODIFY request is rejected (APP_STATUS="Validated at..." AND APP_UPDT_STATUS="KYC Rejted at...") | Handling status validation logic without breaking existing flow |
| 12:00 pm | 1:00 pm | KRA Fix 2 - 3rd Party Validation | Implemented logic to handle 3rd party validation in process - Download first if KYC validated/rejected by 3rd party before our download | Determining correct workflow sequence for 3rd party scenarios |
| 1:00 pm | 2:00 pm | Break | Lunch Break | |
| 2:00 pm | 3:00 pm | KRA Fix 3 - Validation Pending | Implemented validation pending with CAMS, CVL, KARVY, NSE, BSE KRA status handling | Ensuring all KRA provider patterns are correctly matched |
| 3:00 pm | 4:00 pm | Code Review & Testing | Reviewed code changes, tested status combinations, and verified logic flow | Ensuring backward compatibility with existing statuses |
| 4:00 pm | 5:00 pm | Documentation | Updated code comments and documentation for the three fixes | |
| 5:00 pm | 6:00 pm | | | |
| 6:00 pm | 7:00 pm | | | |
| 7:00 pm | 8:00 pm | | | |
| 8:00 pm | 9:00 pm | | | |

