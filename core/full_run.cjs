#!/usr/bin/env node
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * XORAS FULL RUN ORCHESTRATOR [v1.11.0]
 * Standard Practice: Validating XORAS across local, sandbox, staging, and public targets.
 * Logic: Context-Aware Gating | Synthetic Regression Detection
 */

const TARGETS = [
    { name: 'LOCAL_CORE', path: '.', type: 'LOCAL' },
    { name: 'SANDBOX_VULNERABLE', path: './sandbox', type: 'SANDBOX' }
];

async function runFullProtocol() {
    console.log(`\n==========================================`);
    console.log(`  XORAS FULL RUN PROTOCOL: INITIALIZED`);
    console.log(`==========================================\n`);

    try {
        for (const target of TARGETS) {
            console.log(`\n--- EXECUTING GOVERNANCE: ${target.name} ---`);
            
            // 1. Activate Trial (Baseline)
            console.log(`[ORCHESTRATOR] BASELINING TARGET...`);
            execSync(`node xoras.cjs activate ${target.path}`);

            // 2. Execute Gate
            console.log(`[ORCHESTRATOR] CHECKING GATE...`);
            try {
                const output = execSync(`node xoras.cjs gate ${target.path}`).toString();
                console.log(output);
            } catch (e) {
                console.log(`\n[GOVERNANCE RESULT] ${target.name}: ❌ BLOCKED (Integrity Violation Detected)`);
                console.log(e.stdout.toString());
            }
        }
    } catch (err) {
        console.error(`[ORCHESTRATOR] FATAL ERROR: ${err.message}`);
    }

    console.log(`\n==========================================`);
    console.log(`  FULL RUN PROTOCOL: COMPLETE`);
    console.log(`==========================================`);
}

runFullProtocol();
