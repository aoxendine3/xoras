const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * XORAS Sentinel Synchronizer (L7 Orchestration)
 * Purpose: Unified deployment of L6 Hardening across the ecosystem.
 */

const SOURCE_REPO = '/Users/ajoxendine68/Documents/GitHub/xoras';
const TARGET_REPOS = [
    '/Users/ajoxendine68/Documents/GitHub/integrity-sentry-core',
    '/Users/ajoxendine68/Documents/GitHub/env-integrity-sentry',
    '/Users/ajoxendine68/Documents/GitHub/xoras-action',
    '/Users/ajoxendine68/Documents/GitHub/env-sanitizer',
    '/Users/ajoxendine68/Documents/GitHub/next-route-audit'
];

const ASSETS = [
    'rules/default.json',
    'scripts/local_audit.js',
    'action/src/lib/signer.js',
    'action/src/lib/oidc_signer.js',
    'action/src/index.js'
];

function syncSentinel() {
    console.log("🚀 XORAS: Initiating Ecosystem-Wide Sentinel Synchronization...");

    TARGET_REPOS.forEach(repo => {
        if (!fs.existsSync(repo)) {
            console.warn(`⚠️  Target repository not found: ${repo}`);
            return;
        }

        console.log(`\n📦 Hardening Repository: ${path.basename(repo)}`);
        
        // 1. Inject Infrastructure
        ASSETS.forEach(asset => {
            const src = path.join(SOURCE_REPO, asset);
            const dest = path.join(repo, asset);
            
            if (!fs.existsSync(path.dirname(dest))) {
                fs.mkdirSync(path.dirname(dest), { recursive: true });
            }
            
            fs.copyFileSync(src, dest);
            console.log(`  ✅ Injected: ${asset}`);
        });

        // 2. Perform Mandatory Audit
        console.log(`🔍 Auditing ${path.basename(repo)}...`);
        try {
            execSync(`node ${path.join(repo, 'scripts/local_audit.js')}`, { 
                cwd: repo,
                stdio: 'inherit',
                env: { ...process.env, GITHUB_REPOSITORY: path.basename(repo) }
            });
            console.log(`✨ ${path.basename(repo)}: Hardening Verified.`);
        } catch (error) {
            console.error(`❌ ${path.basename(repo)}: Integrity Violations Detected. Rectification Required.`);
        }
    });

    console.log("\n✅ XORAS: Ecosystem Synchronization Complete.");
}

syncSentinel();
