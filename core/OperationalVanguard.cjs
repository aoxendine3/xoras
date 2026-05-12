/**
 * XORAS OPERATIONAL VANGUARD [v1.23.0]
 * Orchestrating the Institutional Transition.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Reference the actual XorasControl class if we wanted, but for a script, CLI is safer for audit trail.
const XORAS_BIN = 'node xoras.cjs';

async function vanguard() {
    console.log(`\n==========================================`);
    console.log(`  XORAS OPERATIONAL VANGUARD: START`);
    console.log(`==========================================`);

    try {
        // 1. Initial Baselining (Institutional Scale)
        console.log(`\n[STEP 1] BASELINING ECOSYSTEM...`);
        execSync(`${XORAS_BIN} init`, { stdio: 'inherit' });

        // 2. High-Pressure Simulation (Performance Regression)
        console.log(`\n[STEP 2] SIMULATING HIGH-PRESSURE PERFORMANCE DRIFT...`);
        try {
            execSync(`${XORAS_BIN} simulate OVERLOAD`, { stdio: 'inherit' });
        } catch (e) {
            console.log(`[VANGUARD] Gate correctly blocked regression.`);
        }

        // 3. Automated Exception Workflow
        console.log(`\n[STEP 3] INITIATING AUTOMATED EXCEPTION WORKFLOW...`);
        
        // We'll read the ledger to find the last GATE_BLOCK event or just request a new one
        console.log(`[VANGUARD] Requesting Governance Exception...`);
        const reqOutput = execSync(`${XORAS_BIN} request-exception PERF "Critical Institutional Pilot: Simulating Overload Bypass"`, { encoding: 'utf8' });
        const requestId = reqOutput.match(/REQUEST ID: (REQ-[A-Z0-9]+)/)[1];
        
        console.log(`[VANGUARD] Found Request ID: ${requestId}`);

        // 4. Identity & Access Approval (using AUTH-ADMIN-001)
        console.log(`\n[STEP 4] SIGNING APPROVAL VIA TRUST ANCHOR [AUTH-ADMIN-001]...`);
        execSync(`${XORAS_BIN} approve ${requestId} AUTH-ADMIN-001`, { stdio: 'inherit' });

        // 5. Final Verification (The "Green Gate")
        console.log(`\n[STEP 5] FINAL GATE VERIFICATION (POST-APPROVAL)...`);
        execSync(`${XORAS_BIN} simulate OVERLOAD`, { stdio: 'inherit' });

        // 6. Generate Global Artifacts
        console.log(`\n[STEP 6] GENERATING INSTITUTIONAL AUDIT REPORTS...`);
        execSync(`${XORAS_BIN} report`, { stdio: 'inherit' });

        console.log(`\n==========================================`);
        console.log(`  VANGUARD SEQUENCE COMPLETE: RIGI ACTIVE`);
        console.log(`==========================================`);

    } catch (error) {
        console.error(`\n[VANGUARD_FATAL] Operational Sequence Failed: ${error.message}`);
        process.exit(1);
    }
}

vanguard();
