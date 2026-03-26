export type Address3Lines = {
  line1: string | undefined;
  line2: string | undefined;
  line3: string | undefined;
  lengths: [number, number, number];
  tokens: string[];
};

// Remove the last `count` comma-separated chunks from an address string.
export function removeLastCommaChunks(input: string, count = 3): string {

  const removeForAddress = [
    "!",
    "$",
    "#",
    "%",
    "=",
    ":",
    ";",
    '"',
    "{",
    "}",
    "[",
    "]",
    "*",
  ]

  for (const char of removeForAddress) {
    input = input.replaceAll(char, "");
  }

  const parts = input.split(",");
  if (parts.length <= count) return "";
  parts.splice(-count);
  return parts.join(",");
}

/**
 * Splits an address into 3 balanced lines (<= maxLen each),
 * WITHOUT breaking any comma-separated chunk.
 *
 * - Uses commas as atomic boundaries: "between commas" is never split.
 * - Also treats newlines as separators (converted to commas).
 * - Chooses the most "equal-looking" split by minimizing line-length spread,
 *   then minimizing total distance from ideal (total/3).
 *
 * If it's impossible to fit within maxLen (e.g., a single token > maxLen),
 * it falls back to greedy packing into 3 lines (still not breaking tokens).
 */
export function splitAddressInto3BalancedLines(
  input: string,
  maxLen = 120,
): Address3Lines {
  const normalize = (s: string) =>
    s
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]+/g, " ")
      .replace(/\s*,\s*/g, ",") // tighten commas
      .replace(/\n+/g, "\n")
      .trim();

  const tokenize = (s: string) => {
    const flat = normalize(s).replace(/\n/g, ","); // treat newline as comma boundary
    return flat
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  };

  const join = (arr: string[]) => arr.join(", ");

  const tokens = tokenize(input);

  if (tokens.length === 0) {
    return { line1: "", line2: "", line3: "", lengths: [0, 0, 0], tokens };
  }

  // Hard constraint check: if any token exceeds maxLen, strict satisfaction is impossible.
  const anyTokenTooLong = tokens.some((t) => t.length > maxLen);

  // Try exhaustive best split (strict) if feasible
  if (!anyTokenTooLong && tokens.length >= 3) {
    const n = tokens.length;
    const totalStr = join(tokens);
    const target = Math.ceil(totalStr.length / 3);

    let bestScore = Infinity;
    let best: { l1: string; l2: string; l3: string } | null = null;

    for (let i = 1; i <= n - 2; i++) {
      const l1 = join(tokens.slice(0, i));
      if (l1.length > maxLen) continue;

      for (let j = i + 1; j <= n - 1; j++) {
        const l2 = join(tokens.slice(i, j));
        const l3 = join(tokens.slice(j));
        if (l2.length > maxLen || l3.length > maxLen) continue;

        const a = l1.length,
          b = l2.length,
          c = l3.length;

        const spread = Math.max(a, b, c) - Math.min(a, b, c);
        const dist =
          Math.abs(a - target) + Math.abs(b - target) + Math.abs(c - target);

        // "Most equal" prioritizes spread heavily; dist breaks ties
        const score = spread * 1000 + dist;

        if (score < bestScore) {
          bestScore = score;
          best = { l1, l2, l3 };
        }
      }
    }

    if (best) {
      return {
        line1: best.l1,
        line2: best.l2,
        line3: best.l3,
        lengths: [best.l1.length, best.l2.length, best.l3.length],
        tokens,
      };
    }
  }

  // Fallback: greedy pack into 3 lines (still never breaks tokens).
  // This may overflow line3 if the input fundamentally can't fit into 3 lines of maxLen.
  const lines = ["", "", ""];
  let li = 0;

  for (const t of tokens) {
    // Build candidate with comma separation only when line already has content
    const candidate = lines[li] ? `${lines[li]}, ${t}` : t;

    if (candidate.length <= maxLen || li === 2) {
      lines[li] = candidate;
    } else {
      li++;
      if (li > 2) {
        // append to last line (may overflow, but preserves comma-chunks)
        lines[2] = lines[2] ? `${lines[2]}, ${t}` : t;
      } else {
        lines[li] = t;
      }
    }
  }

  return {
    line1: lines[0],
    line2: lines[1],
    line3: lines[2],
    lengths: [
      lines[0]?.length || 0,
      lines[1]?.length || 0,
      lines[2]?.length || 0,
    ],
    tokens,
  };
}
