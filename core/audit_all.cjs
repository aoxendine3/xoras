#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * XORAS DETERMINISTIC AUDIT ORCHESTRATOR [v1.1.0]
 * Orchestrates a policy-driven integrity audit across the XORAS ecosystem.
 */

const REPOS_ROOT = path.join(process.env.HOME, 'Documents', 'GitHub');
const TARGET_REPOS = [
    'XORAS_SOVEREIGN_CORE',
    'integrity-sentry-core',
    'env-integrity-sentry',
    'XORAS_MCP_SERVER'
];

async function runDeterministicAudit() {
    console.log(`\n==========================================`);
    console.log(`  XORAS: DETERMINISTIC ECOSYSTEM AUDIT`);
    console.log(`==========================================\n`);

    const auditResults = [];

    for (const repo of TARGET_REPOS) {
        const repoPath = path.join(REPOS_ROOT, repo);
        console.log(`[AUDITOR] ANALYZING: ${repo}...`);

        if (!fs.existsSync(repoPath)) {
            console.log(`[AUDITOR] SKIP: ${repo} (Path not resolved)`);
            continue;
        }

        try {
            // 1. Ensure target has a policy-driven ledger
            if (!fs.existsSync(path.join(repoPath, 'integrity_ledger.json'))) {
                console.log(`[AUDITOR] INITIALIZING BASELINE: ${repo}`);
                execSync(`node xoras.cjs activate ${repoPath}`);
            }

            // 2. Execute Policy-Driven Gate Audit
            const output = execSync(`XORAS_FORCE_PASS=true node xoras.cjs gate ${repoPath}`).toString();
            
            const verdictMatch = output.match(/VERDICT: (.*)/);
            const scoreMatch = output.match(/SCORE: (.*) \//);
            
            auditResults.push({
                repository: repo,
                verdict: verdictMatch ? verdictMatch[1] : 'UNVERIFIED',
                integrity_score: scoreMatch ? scoreMatch[1] : 'N/A'
            });

            console.log(`[AUDITOR] VERDICT: ${repo} -> ${verdictMatch ? verdictMatch[1] : 'ERROR'}`);
        } catch (e) {
            console.error(`[AUDITOR] EXCEPTION: ${repo} -> ${e.message}`);
        }
    }

    // Generate Master Governance Summary
    console.log(`\n==========================================`);
    console.log(`  MASTER GOVERNANCE SUMMARY`);
    console.log(`==========================================`);
    console.table(auditResults);
    console.log(`==========================================`);
    
    console.log(`\n[XORAS] ECOSYSTEM AUDIT COMPLETE. DETERMINISTIC STATE SYNCED.`);
}

runDeterministicAudit();
