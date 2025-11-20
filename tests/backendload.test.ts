// loadtest.ts
const TARGET_URL = "http://localhost:4000/api/session";
// const TARGET_URL = "http://localhost:4000/api/session";

const COOKIE =
  "role=ADMIN; token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Ikp1YW5hX1NjaHVsdHo0MUBob3RtYWlsLmNvbSIsImlkIjoxNiwiaWF0IjoxNzYwNTU4ODU4LCJleHAiOjE3NjA2NDUyNTh9.PhGhtvK95PhS4n5Ev4Imi6eS07cxKmHRxGVi2TSN-DM; userId=16";

// 👇 configuration
const TOTAL_REQUESTS = 200000;
const CONCURRENCY = 20000;

let successCount = 0;
let failCount = 0;
let totalTime = 0;

async function makeRequest() {
  const start = performance.now();

  try {
    const res = await fetch(TARGET_URL, {
      headers: { Cookie: COOKIE },
    });

    const duration = performance.now() - start;
    totalTime += duration;

    if (res.ok) successCount++;
    else failCount++;
  } catch {
    failCount++;
  }
}

// Run batches of concurrent requests
async function runLoadTest() {
  console.log(
    `🚀 Starting load test: ${TOTAL_REQUESTS} requests @ concurrency ${CONCURRENCY}\n`
  );

  const tasks: Promise<void>[] = [];
  for (let i = 0; i < TOTAL_REQUESTS; i++) {
    tasks.push(makeRequest());
    if (tasks.length >= CONCURRENCY) {
      await Promise.all(tasks.splice(0, tasks.length)); // wait for batch
    }
  }

  // Wait for any remaining requests
  await Promise.all(tasks);

  const avgTime = (totalTime / successCount).toFixed(2);

  console.log("✅ Done!");
  console.log("Total Requests:", TOTAL_REQUESTS);
  console.log("Successful:", successCount);
  console.log("Failed:", failCount);
  console.log("Average Response Time (ms):", avgTime);
}

runLoadTest();
