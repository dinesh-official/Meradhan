import { NextRequest, NextResponse } from "next/server";
import { compareNames, MatchResult } from "@/global/utils/match_name";

/**
 * API Route for KYC Name Matching
 * 
 * Compares two names (typically PAN name vs Aadhaar name) and returns
 * a match result with score, decision, and detailed breakdown.
 * 
 * @route POST /api/kyc/check-name
 * @body {
 *   name1: string - First name to compare (e.g., Aadhaar name)
 *   name2: string - Second name to compare (e.g., PAN name)
 *   dob1?: string | Date - Optional date of birth for first name
 *   dob2?: string | Date - Optional date of birth for second name
 *   debug?: boolean - Optional debug flag
 * }
 * @returns MatchResult with score, decision, and breakdown
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name1, name2, dob1, dob2, debug, isIgnoreDob } = body;

    // Validate required fields
    if (!name1 || !name2) {
      return NextResponse.json(
        { error: "Both name1 and name2 are required" },
        { status: 400 }
      );
    }

    // Validate that names are strings
    if (typeof name1 !== "string" || typeof name2 !== "string") {
      return NextResponse.json(
        { error: "name1 and name2 must be strings" },
        { status: 400 }
      );
    }

    // Compare names using the match_name utility
    const result: MatchResult = compareNames(
      name1,
      name2,
      isIgnoreDob ? "1" : dob1 || null,
      isIgnoreDob ? "1" : dob2 || null,

      { debug: debug || false, }
    );

    if (isIgnoreDob) {
      result.breakdown.dateOfBirthMatch = false;
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error in name matching API:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

