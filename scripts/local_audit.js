/**
 * XORAS Local Edge Auditor (Tier 1 - 3B Logic)
 * Purpose: Pre-commit security and syntax gate.
 */

const fs = require('fs');
const { execSync } = require('child_process');

function runLocalAudit() {
    console.log("🔒 XORAS Local Edge Audit Initialized...");
    
    // 1. Secret Detection (Simple Regex)
    const secretPattern = /(password|secret|key|token|api_key|client_secret)[\s:=]+['"][A-Za-z0-9\/+=]{16,}['"]/gi;
    const changedFiles = getChangedFiles();
    
    let violations = 0;
    
    changedFiles.forEach(file => {
        if (fs.existsSync(file) && fs.lstatSync(file).isFile()) {
            const content = fs.readFileSync(file, 'utf8');
            if (secretPattern.test(content)) {
                console.error(`❌ ERROR: Potential secret detected in ${file}`);
                violations++;
            }
        }
    });

    if (violations > 0) {
        console.error(`\n⚠️ Local Audit Failed: ${violations} violation(s) found. Commit blocked.`);
        process.exit(1);
    }

    console.log("✅ Local Edge Audit Passed. Proceeding to commit.");
}

function getChangedFiles() {
    try {
        return execSync('git diff --cached --name-only').toString().trim().split('\n').filter(f => f);
    } catch (e) {
        return [];
    }
}

runLocalAudit();
