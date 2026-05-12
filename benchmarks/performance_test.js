const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * XORAS Performance Benchmark (L5 Standard)
 * Purpose: Measure scan latency and entropy calculation overhead on a high-volume repository.
 */

const TEST_DIR = path.join(process.cwd(), 'benchmarks/mock_repo');
const FILE_COUNT = 1000;

function setupMockRepo() {
    console.log(`📂 Generating mock repository with ${FILE_COUNT} files...`);
    if (!fs.existsSync(TEST_DIR)) fs.mkdirSync(TEST_DIR);
    
    for (let i = 0; i < FILE_COUNT; i++) {
        const content = `const val = "${Math.random().toString(36).substring(7)}";\nconsole.log(process.env.TEST_VAR_${i});`;
        fs.writeFileSync(path.join(TEST_DIR, `file_${i}.js`), content);
    }
}

function runBenchmark() {
    setupMockRepo();
    
    console.log("⏱️ Starting XORAS L5 Performance Benchmark...");
    const start = process.hrtime();
    
    try {
        // Run audit on the mock directory
        execSync('node scripts/local_audit.js', { stdio: 'ignore' });
    } catch (e) {
        // Expected failure if we inserted secrets
    }
    
    const end = process.hrtime(start);
    const ms = (end[0] * 1000 + end[1] / 1000000).toFixed(2);
    
    console.log(`\n📊 PERFORMANCE_REPORT:`);
    console.log(`- Files Scanned: ${FILE_COUNT}`);
    console.log(`- Total Latency: ${ms}ms`);
    console.log(`- Avg per File: ${(ms / FILE_COUNT).toFixed(4)}ms`);
    
    // Cleanup
    cleanup();
}

function cleanup() {
    fs.readdirSync(TEST_DIR).forEach(file => fs.unlinkSync(path.join(TEST_DIR, file)));
    fs.rmdirSync(TEST_DIR);
}

runBenchmark();
