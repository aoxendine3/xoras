/**
 * XORAS Local Edge Auditor (Deterministic Scope v1.0)
 * Purpose: Repeatable, structurally-aware audit of environment usage.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Deterministic Patterns (Harvested from integrity-sentry-core)
const ENV_PATTERNS = [
    /process\.env\.([A-Z_][A-Z0-9_]*)/g,                    // Direct Access
    /process\.env\[['"]([A-Z_][A-Z0-9_]*)['"]\]/g,          // Computed Access
    /const \{ ([A-Z_][A-Z0-9_,\s]*) \} = process\.env/g     // Destructuring
];

const SECRET_PATTERNS = [
    /(?:key|secret|token|password|auth|api|id)['"]?\s*[:=]\s*['"]([a-zA-Z0-9_\-\.]{20,})['"]/gi
];

function runLocalAudit() {
    console.log("🔒 XORAS: Initiating Deterministic Scoped-Audit...");
    
    const changedFiles = getChangedFiles();
    let violations = 0;
    const requiredEnvVars = new Set();
    const existingEnvVars = getLocalEnvVars();

    changedFiles.forEach(file => {
        if (file.includes('node_modules') || file.includes('.git') || file.includes('dist') || file.includes('docs/')) return;

        if (fs.existsSync(file) && fs.lstatSync(file).isFile()) {
            const content = fs.readFileSync(file, 'utf8');
            
            // 1. Deterministic Env Detection
            ENV_PATTERNS.forEach(pattern => {
                const matches = content.matchAll(pattern);
                for (const match of matches) {
                    // Handle destructuring (split by comma)
                    if (match[0].includes('{')) {
                        match[1].split(',').forEach(v => requiredEnvVars.add(v.trim()));
                    } else {
                        requiredEnvVars.add(match[1]);
                    }
                }
            });

            // 2. Secret Pattern Matching
            SECRET_PATTERNS.forEach(pattern => {
                const matches = content.matchAll(pattern);
                for (const match of matches) {
                    if (file.includes('scripts/') || file.includes('action/src/')) continue;
                    console.error(`❌ ERROR: Deterministic secret detected in ${file}`);
                    violations++;
                }
            });
        }
    });

    // 3. Environment Parity Report
    console.log("\n📊 Environment Condition Report:");
    requiredEnvVars.forEach(v => {
        if (!existingEnvVars.has(v)) {
            console.warn(`⚠️  MISSING_DEPENDENCY: "${v}" referenced in code but missing from .env.`);
        } else {
            console.log(`✅ "${v}" verified in environment.`);
        }
    });

    if (violations > 0) {
        console.error(`\n⚠️  Audit Failed: ${violations} deterministic violation(s) found.`);
        process.exit(1);
    }

    console.log("\n✅ XORAS: Scoped Integrity Verified.");
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
        return execSync('git diff --cached --name-only').toString().trim().split('\n').filter(f => f);
    } catch (e) {
        return [];
    }
}

runLocalAudit();
