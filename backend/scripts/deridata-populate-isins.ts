/**
 * One-off / manual: populate Deridata data for the autofill ISIN list
 * (default scripts/deridata-autofill-isins.csv). Idempotent — skips ISINs already
 * populated unless `--force` is passed. The same logic runs automatically on backend
 * startup (be-start.sh); this script is for manual/forced runs.
 *
 * MUST run from an environment whose egress IP is whitelisted with Deridata (staging).
 *   bun run deridata:populate                    # skip already-populated ISINs
 *   bun run deridata:populate --force            # refetch all
 *   bun run deridata:populate path/to/list.csv   # custom list
 */
import "@packages/config/src/env"; // loads .env (DATABASE_URL + Deridata config) before Prisma
import { populateDeridata } from "@modules/deridata/deridata.populate";

const args = process.argv.slice(2);
const force = args.includes("--force");
const file = args.find((a) => !a.startsWith("--"));

populateDeridata({ file, force })
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });
