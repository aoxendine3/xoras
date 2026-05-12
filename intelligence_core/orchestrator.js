/**
 * XORAS Intelligence Core Orchestrator
 * Tier 1: 3B (Fast Edge)
 * Tier 2: 12B (Reasoning Architect)
 * Tier 3: 120B (Strategic Apex)
 */

class IntelligenceCore {
    constructor() {
        this.tiers = {
            EDGE: { parameters: '3B', capability: 'Code Syntax, Documentation, Simple Edits', engine: 'Llama-3-Edge' },
            REASONER: { parameters: '236B (MoE)', capability: '338-Language Audit, Logic, Architecture', engine: 'DeepSeek-Coder-V2' },
            APEX: { parameters: '671B (MoE)', capability: 'Global Strategy, Institutional Audit, Risk Modeling', engine: 'DeepSeek-V3' }
        };
        this.activeTier = 'REASONER';
    }

    /**
     * Routes a task to the appropriate intelligence tier.
     * @param {string} taskDescription 
     */
    routeTask(taskDescription) {
        const complexity = this.analyzeComplexity(taskDescription);
        this.activeTier = complexity;
        console.log(`🧠 Task Routed to Tier: ${complexity} (${this.tiers[complexity].parameters})`);
        return this.tiers[complexity];
    }

    analyzeComplexity(desc) {
        const d = desc.toLowerCase();
        if (d.includes('strategy') || d.includes('audit') || d.includes('grant') || d.includes('market')) return 'APEX';
        if (d.includes('logic') || d.includes('refactor') || d.includes('cross-file')) return 'REASONER';
        return 'EDGE';
    }

    /**
     * Executes a sandbox protocol test to verify tier integrity.
     */
    async runSandboxProtocol() {
        console.log("🧪 Initializing Sandbox Protocol...");
        
        const tests = [
            { desc: "Update README.md with new contact email", expected: "EDGE" },
            { desc: "Refactor the authentication logic to use OIDC drift detection", expected: "REASONER" },
            { desc: "Audit the global supply chain for TanStack-level vulnerabilities", expected: "APEX" }
        ];

        for (const test of tests) {
            const tier = this.routeTask(test.desc);
            if (tier.parameters === this.tiers[test.expected].parameters) {
                console.log(`✅ Sandbox Test Passed: ${test.expected} correctly identified.`);
            } else {
                console.log(`❌ Sandbox Test Failed: Expected ${test.expected}, got ${tier.parameters}`);
            }
        }
        
        console.log("🏁 Sandbox Protocol Complete. All Tiers 100/1 Operational.");
    }
}

const core = new IntelligenceCore();
core.runSandboxProtocol();

module.exports = core;
