/**
 * XORAS Local Edge Auditor (Tier 2 - Entropy Analysis)
 * Finality Standard: v2026.2
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. Technical Patterns
const SECRETS_REGEX = /(?:key|secret|token|password|auth|api|id)['"]?\s*[:=]\s*['"]([a-zA-Z0-9_\-\.]{20,})['"]/gi;

/**
 * Calculates Shannon Entropy of a string.
 * High entropy (> 4.5) often indicates a cryptographic key or token.
 */
function calculateEntropy(str) {
    const len = str.length;
    const freq = {};
    for (let i = 0; i < len; i++) {
        freq[str[i]] = (freq[str[i]] || 0) + 1;
    }
    let entropy = 0;
    for (const char in freq) {
        const p = freq[char] / len;
        entropy -= p * Math.log2(p);
    }
    return entropy;
}

function runLocalAudit() {
    console.log("🔒 XORAS: Initiating Entropy-Aware Audit...");
    
    const changedFiles = getChangedFiles();
    let violations = 0;

    changedFiles.forEach(file => {
        if (file.includes('node_modules') || file.includes('.git') || file.includes('dist') || file.includes('docs/')) return;

        if (fs.existsSync(file) && fs.lstatSync(file).isFile()) {
            const content = fs.readFileSync(file, 'utf8');
            
            // A. Regex Pattern Matching
            const secretMatches = content.matchAll(SECRETS_REGEX);
            for (const match of secretMatches) {
                if (file.includes('scripts/') || file.includes('action/src/')) continue;
                console.error(`❌ ERROR: Pattern-based secret detected in ${file}`);
                violations++;
            }

            // B. Entropy-Based Detection (Heuristic)
            // We look for high-entropy strings that might be obfuscated secrets
            const words = content.split(/[\s'"=:,;]+/);
            words.forEach(word => {
                if (word.length > 30) {
                    const entropy = calculateEntropy(word);
                    if (entropy > 4.5) {
                        // Avoid flagging internal hashes or long words
                        if (!file.includes('package-lock.json')) {
                            console.warn(`⚠️  WARNING: High-entropy string detected in ${file} (Entropy: ${entropy.toFixed(2)}). Possible obfuscated secret.`);
                            // We don't block on entropy alone to avoid false positives, but we alert.
                        }
                    }
                }
            });
        }
    });

    if (violations > 0) {
        console.error(`\n⚠️ Local Audit Failed: ${violations} violation(s) found.`);
        process.exit(1);
    }

    console.log("\n✅ XORAS: Structural & Entropy Audit Verified.");
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
