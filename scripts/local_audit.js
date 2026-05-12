/**
 * XORAS Local Edge Auditor (L5 Production Standard)
 * Purpose: Modular, Signed, and Deterministic Release Integrity.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const PrincipalSigner = require('../action/src/lib/signer');

const RULES_PATH = path.join(process.cwd(), 'rules/default.json');
const rules = JSON.parse(fs.readFileSync(RULES_PATH, 'utf8'));
const signer = new PrincipalSigner();

function calculateEntropy(str) {
    const len = str.length;
    if (len === 0) return 0;
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

function runAudit() {
    console.log("🔒 XORAS: Initiating L5 Hardened Integrity Audit...");
    
    const changedFiles = getChangedFiles();
    const findings = [];
    const requiredEnvVars = new Set();
    const existingEnvVars = getLocalEnvVars();

    const secretProfile = rules.profiles.find(p => p.name === 'SECRET_EXPOSURE');
    const envProfile = rules.profiles.find(p => p.name === 'ENV_DRIFT');

    changedFiles.forEach(file => {
        // Institutional Exclusions
        if (rules.exclusions.some(pattern => file.includes(pattern.replace('/**', '')))) return;

        if (fs.existsSync(file) && fs.lstatSync(file).isFile()) {
            const content = fs.readFileSync(file, 'utf8');
            
            // 1. Env Drift Detection (Modular)
            envProfile.patterns.forEach(p => {
                const regex = new RegExp(p, 'g');
                const matches = content.matchAll(regex);
                for (const match of matches) {
                    if (match[0].includes('{')) {
                        match[1].split(',').forEach(v => requiredEnvVars.add(v.trim()));
                    } else {
                        requiredEnvVars.add(match[1]);
                    }
                }
            });

            // 2. Secret Detection + Context Scoring
            secretProfile.patterns.forEach(p => {
                const regex = new RegExp(p, 'gi');
                const matches = content.matchAll(regex);
                for (const match of matches) {
                    const secretCandidate = match[1];
                    const entropy = calculateEntropy(secretCandidate);
                    
                    if (entropy > secretProfile.min_entropy && secretCandidate.length >= secretProfile.min_length) {
                        findings.push({
                            type: 'SECRET_EXPOSURE',
                            file: file,
                            entropy: entropy,
                            severity: 'CRITICAL',
                            timestamp: new Date().toISOString()
                        });
                        console.error(`❌ CRITICAL: High-entropy secret in ${file} (Entropy: ${entropy.toFixed(2)})`);
                    }
                }
            });
        }
    });

    // 3. Environmental Validation
    requiredEnvVars.forEach(v => {
        if (!existingEnvVars.has(v)) {
            findings.push({ type: 'MISSING_DEPENDENCY', variable: v, severity: 'ADVISORY' });
            console.warn(`⚠️  ADVISORY: Missing dependency "${v}" referenced in code.`);
        }
    });

    // 4. Signed Finality Report
    const report = {
        metadata: {
            engine: "XORAS_L5",
            timestamp: new Date().toISOString(),
            repository: process.env.GITHUB_REPOSITORY || 'local-repo'
        },
        findings: findings,
        status: findings.some(f => f.severity === 'CRITICAL') ? 'FAILED' : 'PASSED'
    };

    const signedReport = signer.sign(report);
    fs.writeFileSync('AUDIT_FINALITY.jws', signedReport);
    console.log(`\n✅ Audit Complete. Signed finality recorded in AUDIT_FINALITY.jws`);

    if (report.status === 'FAILED') {
        process.exit(1);
    }
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
        return execSync('git diff --name-only HEAD').toString().trim().split('\n').filter(f => f);
    } catch (e) {
        return [];
    }
}

runAudit();
