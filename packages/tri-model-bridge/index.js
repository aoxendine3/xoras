class TriModelBridge {
    constructor() {
        this.STRICT_RULE = "Rule: Never use markdown borders or promotional adjectives. Output minimal facts.";
    }

    async fastRoute(query, experts) {
        if (!experts || experts.length === 0) return 'default_expert';
        return experts[0];
    }

    async deepReason(prompt, context) {
        return `Reasoned solution for: ${prompt.substring(0, 50)}... Context: ${context}`;
    }
}

module.exports = new TriModelBridge();
