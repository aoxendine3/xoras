class DynamicPersona {
    constructor() {
        this.lockedCategories = {
            SYSTEMS_ENGINEERING: "Rule: Use only direct, factual, minimal systems engineering terms.",
            TRIAGE_STATUS: "Rule: Output flat status records.",
            CRITICAL_ALERT: "Rule: State exact failure condition, exit code, and immediate recovery action.",
            DEAL_ENGAGEMENT: "Rule: Maintain professional regional alignment matching recipient business hours.",
            DIAGNOSTIC_RECOVERY: "Rule: State exact bedrock metrics (IPC, WAL) and structural AST adaptation."
        };
    }

    modulateContext(samplePrompt, baseRole = "XORAS Core") {
        return `${baseRole}\n${this.lockedCategories.SYSTEMS_ENGINEERING}`;
    }
}

module.exports = new DynamicPersona();
