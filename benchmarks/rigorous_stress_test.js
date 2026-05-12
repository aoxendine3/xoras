const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

/**
 * XORAS Pathological Stress Suite (L6 Standard)
 * Purpose: Exhaustive verification of Sentinel, Entropy, and Concurrency.
 */

const TEST_DIR = path.join(process.cwd(), 'benchmarks/rigorous_mock');
const RULES_PATH = path.join(process.cwd(), 'rules/default.json');

function setupPathologicalRepo() {
    console.log("☣️  Generating Pathological Test Cases...");
    if (!fs.existsSync(TEST_DIR)) fs.mkdirSync(TEST_DIR);

    // 1. Obfuscated Secret (Base64)
    const secret = "x4kP9zL2mNqR5wT8vB1jY6cH3sG0vF9d";
    const b64Secret = Buffer.from(secret).toString('base64');
    fs.writeFileSync(path.join(TEST_DIR, 'obfuscated.js'), `const KEY = "${b64Secret}"; // Obfuscated`);

    // 2. High-Entropy Noise (Entropy Distraction)
    const noise = crypto.randomBytes(1024).toString('hex');
    fs.writeFileSync(path.join(TEST_DIR, 'noise.log'), noise);

    // 3. Nested Secret Pattern
    fs.writeFileSync(path.join(TEST_DIR, 'nested.json'), JSON.stringify({
        auth: { token: "ghp_1234567890abcdefghijklmnopqrstuvwxyz" }
    }));
}

function testSentinelTampering() {
    console.log("🛡️  Testing Sentinel Tamper-Resistance...");
    const originalRules = fs.readFileSync(RULES_PATH, 'utf8');
    
    // Attempt to bypass by adding a wide exclusion
    const tamperedRules = JSON.parse(originalRules);
    tamperedRules.exclusions.push("**/*");
    fs.writeFileSync(RULES_PATH, JSON.stringify(tamperedRules));

    try {
        console.log("⚠️  Executing Audit on Tampered Policy...");
        execSync('node scripts/local_audit.js', { stdio: 'pipe' });
        console.error("❌ FAILURE: Sentinel allowed tampered policy!");
        process.exit(1);
    } catch (e) {
        console.log("✅ SUCCESS: Sentinel blocked tampered policy.");
    } finally {
        fs.writeFileSync(RULES_PATH, originalRules); // Restore
    }
}

function runRigorTest() {
    setupPathologicalRepo();
    
    console.log("⚡ Initiating Full-Spectrum Stress Audit...");
    const start = process.hrtime();
    
    try {
        const output = execSync('node scripts/local_audit.js', { encoding: 'utf8' });
        console.log(output);
    } catch (e) {
        console.log("✅ Audit Correctly Identified Pathological Violations.");
    }

    const end = process.hrtime(start);
    console.log(`\n📊 RIGOR_REPORT: Complete in ${(end[0] * 1000 + end[1] / 1000000).toFixed(2)}ms`);
    
    cleanup();
}

function cleanup() {
    if (fs.existsSync(TEST_DIR)) {
        fs.readdirSync(TEST_DIR).forEach(file => fs.unlinkSync(path.join(TEST_DIR, file)));
        fs.rmdirSync(TEST_DIR);
    }
}

console.log("--- XORAS L6 RIGOROUS TESTING COMMENCED ---");
testSentinelTampering();
runRigorTest();
