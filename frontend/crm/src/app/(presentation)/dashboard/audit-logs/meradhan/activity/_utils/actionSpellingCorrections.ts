/**
 * Corrects common spelling mistakes in action labels
 * This ensures consistent display of action labels in the UI and exports
 */
export const correctActionSpelling = (action: string): string => {
  if (!action) return action;
  
  // Common spelling corrections
  const corrections: Record<string, string> = {
    DEMATE: "DEMAT",
    "DEMATE_": "DEMAT_",
    "_DEMATE": "_DEMAT",
    "DEMATE_ACCOUNT": "DEMAT_ACCOUNT",
    "DEMATE_VERIFICATION": "DEMAT_VERIFICATION",
    "START_DEMATE": "START_DEMAT",
    "DEMATE_ACCOUNT_VERIFICATION": "DEMAT_ACCOUNT_VERIFICATION",
    "DEMATE_ACCOUNT_VERIFICATION_FAILED": "DEMAT_ACCOUNT_VERIFICATION_FAILED",
  };

  let corrected = action;
  
  // Apply corrections (case-insensitive)
  Object.entries(corrections).forEach(([wrong, correct]) => {
    const regex = new RegExp(wrong, "gi");
    corrected = corrected.replace(regex, correct);
  });

  return corrected;
};

