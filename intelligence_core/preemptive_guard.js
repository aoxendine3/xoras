const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml'); // Note: Need to install this

/**
 * XORAS Preemptive Guard (Tier 3 - Strategic Apex)
 * Purpose: Identifies high-fidelity supply chain vulnerabilities (OIDC extraction, cache poisoning).
 */

class PreemptiveGuard {
    constructor() {
        this.vulnerabilities = [];
    }

    /**
     * Audits GitHub Action workflow files for 2026-era supply chain patterns.
     * @param {string} workflowDir 
     */
    auditWorkflows(workflowDir) {
        console.log("🛡️ XORAS Preemptive Guard: Auditing GitHub Workflows...");
        
        if (!fs.existsSync(workflowDir)) {
            console.log("⚠️ No .github/workflows directory found. Skipping pipeline audit.");
            return;
        }

        const files = fs.readdirSync(workflowDir).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
        
        files.forEach(file => {
            const content = fs.readFileSync(path.join(workflowDir, file), 'utf8');
            try {
                const doc = yaml.load(content);
                this.checkPullRequestTarget(doc, file);
                this.checkUnpinnedActions(content, file);
                this.checkCacheSecurity(doc, file);
            } catch (e) {
                this.reportError(file, `Malformed YAML: ${e.message}`);
            }
        });

        return this.generateReport();
    }

    checkPullRequestTarget(doc, file) {
        const triggers = Object.keys(doc.on || {});
        if (triggers.includes('pull_request_target')) {
            this.vulnerabilities.push({
                file,
                type: 'HIGH_RISK_TRIGGER',
                message: 'Detected "pull_request_target". This trigger can allow attackers to steal OIDC tokens from your runner if untrusted code is checked out.',
                solution: 'Use "pull_request" instead, or ensure no untrusted code is executed in this workflow.'
            });
        }
    }

    checkUnpinnedActions(content, file) {
        const actionRegex = /uses: ([a-zA-Z0-9-]+\/[a-zA-Z0-9-]+)@(?![0-9a-f]{40})/g;
        let match;
        while ((match = actionRegex.exec(content)) !== null) {
            this.vulnerabilities.push({
                file,
                type: 'UNPINNED_ACTION',
                message: `Action "${match[1]}" is using a tag instead of a full SHA-1 hash.`,
                solution: `Replace the tag with the full commit SHA to prevent supply chain poisoning (e.g., uses: ${match[1]}@<full-sha>).`
            });
        }
    }

    checkCacheSecurity(doc, file) {
        // Logic to detect if cache is used in a way that crosses fork boundaries
        const content = JSON.stringify(doc);
        if (content.includes('actions/cache') && content.includes('pull_request_target')) {
            this.vulnerabilities.push({
                file,
                type: 'CACHE_POISONING_RISK',
                message: 'Workflow uses caching with "pull_request_target". This is a prime vector for the 2026 "Mini Shai-Hulud" cache poisoning attack.',
                solution: 'Isolate cache keys by branch or move release logic to a "push" event on main.'
            });
        }
    }

    reportError(file, msg) {
        this.vulnerabilities.push({ file, type: 'CORE_ERROR', message: msg, solution: 'Fix syntax and re-run audit.' });
    }

    generateReport() {
        return {
            timestamp: new Date().toISOString(),
            status: this.vulnerabilities.length > 0 ? 'CRITICAL' : 'SECURE',
            vulnerabilities: this.vulnerabilities,
            summary: `Audit complete. Identified ${this.vulnerabilities.length} structural risks.`
        };
    }
}

module.exports = new PreemptiveGuard();
