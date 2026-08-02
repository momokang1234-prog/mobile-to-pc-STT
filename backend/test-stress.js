const { execFile } = require('child_process');
const path = require('path');

const KEY_SIM_PATH = path.join(__dirname, 'KeySim.exe');
const TEST_TEXT = '빠른 타이핑 테스트';
const ITERATIONS = 50;

console.log(`==================================================`);
console.log(`Starting Stress Test for KeySim.exe`);
console.log(`Text to type: "${TEST_TEXT}"`);
console.log(`Spawning ${ITERATIONS} processes in rapid succession...`);
console.log(`==================================================\n`);

const startTime = Date.now();
let completedCount = 0;
let successCount = 0;
let errorCount = 0;

const promises = [];

for (let i = 1; i <= ITERATIONS; i++) {
  const p = new Promise((resolve) => {
    // Rapidly spawn KeySim.exe child processes
    execFile(KEY_SIM_PATH, ['type', TEST_TEXT], (error, stdout, stderr) => {
      completedCount++;
      if (error) {
        errorCount++;
        console.error(`[${completedCount}/${ITERATIONS}] Execution #${i} FAILED:`, error.message);
      } else {
        successCount++;
      }
      resolve();
    });
  });
  promises.push(p);
}

Promise.all(promises).then(() => {
  const totalTimeMs = Date.now() - startTime;
  const avgMsPerCall = (totalTimeMs / ITERATIONS).toFixed(2);

  console.log(`\n==================================================`);
  console.log(`STRESS TEST SUMMARY`);
  console.log(`==================================================`);
  console.log(`Total Invocations  : ${ITERATIONS}`);
  console.log(`Successful Calls   : ${successCount}`);
  console.log(`Failed Calls       : ${errorCount}`);
  console.log(`Total Time Elapsed : ${totalTimeMs} ms`);
  console.log(`Avg Time / Call    : ${avgMsPerCall} ms`);
  console.log(`Status             : ${errorCount === 0 ? 'PASSED (0 Errors)' : 'FAILED (Errors detected)'}`);
  console.log(`==================================================`);
});
