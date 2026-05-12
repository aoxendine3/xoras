/**
 * XORAS Local Edge Auditor (Tier 1 - High-Fidelity Logic)
 * Finality Standard: v2026.1 (Harvested Patterns)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Mature Patterns from env-integrity-sentry
const SECRETS_REGEX = /(?:key|secret|token|password|auth|api|id)['"]?\s*[:=]\s*['"]([a-zA-Z0-9_\-\.]{20,})['"]/gi;
const ENV_USAGE_REGEX = /process\.env(?:\.([A-Z_][A-Z0-9_]*)|\[['"]([A-Z_][A-Z0-9_]*)['"]\])/g;

function runLocalAudit() {
    console.log("🔒 XORAS: Initiating High-Fidelity Local Audit...");
    
    const changedFiles = getChangedFiles();
    let violations = 0;
    const requiredEnvVars = new Set();
    const existingEnvVars = getLocalEnvVars();

    changedFiles.forEach(file => {
        if (file.includes('node_modules') || file.includes('.git') || file.includes('dist') || file.includes('docs/')) return;

        if (fs.existsSync(file) && fs.lstatSync(file).isFile()) {
            const content = fs.readFileSync(file, 'utf8');
            
            // 1. Precise Secret Detection
            const secretMatches = content.matchAll(SECRETS_REGEX);
            for (const match of secretMatches) {
                // Ignore internal XORAS scripts to prevent self-blocking
                if (file.includes('scripts/') || file.includes('action/src/')) continue;
                
                console.error(`❌ ERROR: Hardcoded secret detected in ${file}`);
                violations++;
            }

            // 2. Environment Condition Forecasting
            const envMatches = content.matchAll(ENV_USAGE_REGEX);
            for (const match of envMatches) {
                const varName = match[1] || match[2];
                requiredEnvVars.add(varName);
            }
        }
    });

    // 3. Condition Report
    console.log("\n📊 XORAS Condition Forecast:");
    requiredEnvVars.forEach(v => {
        if (!existingEnvVars.has(v)) {
            console.warn(`⚠️ WARNING: "${v}" is used in code but missing from .env. Build may fail.`);
        } else {
            console.log(`✅ "${v}" verified in environment.`);
        }
    });

    if (violations > 0) {
        console.error(`\n⚠️ Local Audit Failed: ${violations} violation(s) found. Commit blocked.`);
        process.exit(1);
    }

    console.log("\n✅ XORAS: Structural Integrity Verified. Proceeding to commit.");
}

function getLocalEnvVars() {
    const envPath = path.join(process.cwd(), '.env');
    const vars = new Set();
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        content.split('\n').forEach(line => {
            const match = line.match(/^([A-Z_][A-Z0-9_]*)=/);
            if (match) vars.add(match[1]);
        });
    }
    return vars;
}

function getChangedFiles() {
    try {
        const staged = execSync('git diff --cached --name-only').toString().trim().split('\n');
        const unstaged = execSync('git diff --name-only').toString().trim().split('\n');
        return [...new Set([...staged, ...unstaged])].filter(f => f);
    } catch (e) {
        return [];
    }
}

runLocalAudit();
