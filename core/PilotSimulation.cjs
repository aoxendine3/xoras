const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log(`\n==========================================`);
console.log(`  XORAS PILOT SIMULATION: ADVISORY MODE`);
console.log(`==========================================`);

// Ensure we are in Advisory Mode
process.env.XORAS_MODE = 'ADVISORY';

try {
    // 1. Initial State
    console.log(`\n[STEP 1] Re-baselining Governance...`);
    execSync('node xoras.cjs init', { stdio: 'inherit' });

    // 2. Introduce a "Risk" (Simulated PR Drift)
    console.log(`\n[STEP 2] Simulating High-Risk PR (Perf Drift & Security Leak)...`);
    execSync('node xoras.cjs simulate PERF_DRIFT_01', { stdio: 'inherit' });
    execSync('node xoras.cjs simulate SECRET_LEAK_01', { stdio: 'inherit' });
    
    console.log(`\n[STEP 2.1] Running Gate in Advisory Mode...`);
    execSync('node xoras.cjs gate', { stdio: 'inherit' });

    // 3. Verify ROI Ledger
    console.log(`\n[STEP 3] Verifying ROI (Prevented Incidents) Ledger...`);
    const incidents = JSON.parse(fs.readFileSync('prevented_incidents.json', 'utf8'));
    console.log(`[ROI] Incidents Tracked: ${incidents.length}`);
    console.log(`[ROI] Latest Risk: ${incidents[incidents.length - 1].violations.join(', ')}`);

    // 4. Demonstrate "Suppression" for known debt
    console.log(`\n[STEP 4] Suppressing 'ARCH' findings for legacy debt...`);
    // Need a valid anchor ID from AuthorityRegistry.json
    const ledger = JSON.parse(fs.readFileSync('integrity_ledger.json', 'utf8'));
    const archAnchor = { id: 'AUTH-ENG-003' }; 
    
    execSync(`node xoras.cjs suppress ARCH AUTH-ENG-003`, { stdio: 'inherit' });

    // 5. Transitioning to ENFORCEMENT MODE
    console.log(`\n[STEP 5] Transitioning to ENFORCEMENT MODE...`);
    process.env.XORAS_MODE = 'ENFORCEMENT';

    // 6. Demonstrate Block & Approval
    console.log(`\n[STEP 6] Simulating High-Risk PR in ENFORCEMENT MODE (Should BLOCK)...`);
    try {
        execSync('node xoras.cjs simulate SECRET_LEAK_01', { stdio: 'inherit' });
    } catch (e) {
        console.log(`[XORAS_PILOT] VERIFIED: Release was successfully BLOCKED by Governance.`);
    }

    // 7. Requesting Governance Exception
    console.log(`\n[STEP 7] Requesting Governance Exception...`);
    // Find the actual Request ID from the last GATE_BLOCK in the ledger
    const blockLedger = JSON.parse(fs.readFileSync('integrity_ledger.json', 'utf8'));
    const lastBlock = blockLedger.audit_log.slice().reverse().find(e => e.type === 'GATE_BLOCK');
    const actualReqId = lastBlock.details.requestId;

    execSync(`node xoras.cjs approve ${actualReqId} AUTH-SEC-002`, { stdio: 'inherit' });

    console.log(`\n[STEP 9] Re-running Simulation with Signed Approval (Should PASS)...`);
    execSync(`node xoras.cjs simulate SECRET_LEAK_01`, { stdio: 'inherit' });
    console.log(`[XORAS_PILOT] SUCCESS: Release integrity verified via Signed Exception.`);

    console.log(`\n==========================================`);
    console.log(`  PILOT SIMULATION COMPLETE`);
    console.log(`  DASHBOARD READY AT http://localhost:3000`);
    console.log(`==========================================`);
} catch (err) {
    console.error(`Simulation failed: ${err.message}`);
}
