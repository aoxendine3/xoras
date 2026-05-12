/**
 * XORAS Local Edge Auditor (Tier 1 - 3B Logic)
 * Purpose: Pre-commit security and syntax gate.
 */

const fs = require('fs');
const { execSync } = require('child_process');

function runLocalAudit() {
    console.log("🔒 XORAS Local Edge Audit Initialized...");
    
    // 1. Refined Secret Detection Patterns
    const secretPatterns = [
        /api[_-]?key/i, /secret/i, /password/i, /token/i,
        /A3T[A-Z0-9]{16}/, // AWS
        /sk-[a-zA-Z0-9]{48}/ // OpenAI
    ];

    const changedFiles = getChangedFiles();
    let violations = 0;
    
    changedFiles.forEach(file => {
        // Exclude node_modules, .git, and dist directories
        if (file.includes('node_modules') || file.includes('.git') || file.includes('dist')) return;

        if (fs.existsSync(file) && fs.lstatSync(file).isFile()) {
            const content = fs.readFileSync(file, 'utf8');
            secretPatterns.forEach(pattern => {
                if (pattern.test(content)) {
                    // Exclude the auditor itself to prevent self-detection of regex patterns
                    if (file.includes('scripts/local_audit.js')) return;
                    
                    console.error(`❌ ERROR: Potential secret detected in ${file}`);
                    violations++;
                }
            });
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
        const staged = execSync('git diff --cached --name-only').toString().trim().split('\n');
        const unstaged = execSync('git diff --name-only').toString().trim().split('\n');
        return [...new Set([...staged, ...unstaged])].filter(f => f);
    } catch (e) {
        return [];
    }
}

runLocalAudit();
