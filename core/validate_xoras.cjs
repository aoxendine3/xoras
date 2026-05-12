#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * XORAS SELF-VALIDATION RUNNER [v1.0.0]
 * "XORAS validates XORAS"
 * This script verifies that the governance engine correctly identifies 
 * synthetic regressions defined in the benchmark profiles.
 */

const PROFILES_PATH = path.join(__dirname, 'sandbox', 'profiles.json');

async function runSelfValidation() {
    console.log(`\n==========================================`);
    console.log(`  XORAS SELF-VALIDATION: "ENGINE INTEGRITY"`);
    console.log(`==========================================\n`);

    if (!fs.existsSync(PROFILES_PATH)) {
        console.error(`[VALIDATOR] FATAL: profiles.json not found in sandbox.`);
        process.exit(1);
    }

    const manifest = JSON.parse(fs.readFileSync(PROFILES_PATH, 'utf8'));
    const profiles = Object.keys(manifest.profiles);

    // 1. BASELINE LOCAL
    console.log(`[VALIDATOR] STEP 1: BASELINING LOCAL ENGINE...`);
    execSync('node xoras.cjs activate .');

    let passed = 0;
    let failed = 0;

    // 2. ITERATE PROFILES
    for (const profileName of profiles) {
        console.log(`\n[VALIDATOR] TEST: ${profileName}`);
        try {
            // We use XORAS_FORCE_PASS=true to avoid process exit on block during validation
            const output = execSync(`XORAS_FORCE_PASS=true node xoras.cjs simulate ${profileName}`).toString();
            
            const profile = manifest.profiles[profileName];
            const expectedEmoji = profile.expected_verdict === 'BLOCK' ? '❌ BLOCKED' : (profile.expected_verdict === 'WARN' ? '⚠️ WARNING' : '✅ PASSED');
            const verdictMatch = output.includes(`INTEGRITY VERDICT: ${expectedEmoji}`);
            
            if (verdictMatch) {
                console.log(`[VALIDATOR] RESULT: ✅ PASSED (Detected as expected)`);
                passed++;
            } else {
                console.log(`[VALIDATOR] RESULT: ❌ FAILED (Mismatch in expected verdict)`);
                failed++;
            }
        } catch (e) {
            console.error(`[VALIDATOR] ERROR: Execution failed for ${profileName}`);
            failed++;
        }
    }

    console.log(`\n==========================================`);
    console.log(`  VALIDATION COMPLETE: ${passed} PASSED | ${failed} FAILED`);
    console.log(`==========================================`);

    if (failed > 0) process.exit(1);
}

runSelfValidation();
