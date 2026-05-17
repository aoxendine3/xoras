// intelligence_core/persona/dynamic_persona.cjs

class DynamicPersona {
    constructor() {
        this.lockedCategories = {
            SYSTEMS_ENGINEERING: "Rule: Use only direct, factual, minimal systems engineering terms. Zero promotional adjectives.",
            TRIAGE_STATUS: "Rule: Output flat status records. No conversational introductions or trailing summaries.",
            CRITICAL_ALERT: "Rule: State exact failure condition, exit code, and immediate recovery action.",
            DEAL_ENGAGEMENT: "Rule: Maintain professional regional alignment matching recipient business hours.",
            DIAGNOSTIC_RECOVERY: "Rule: State exact bedrock metrics (IPC, WAL) and structural AST adaptation."
        };

        this.toneMemory = {
            minimalistEnforcement: 1.0,
            recentToneModifiers: ['minimal', 'direct', 'factual', 'clean']
        };
    }

    detectCategory(prompt) {
        if (!prompt || typeof prompt !== 'string') return 'SYSTEMS_ENGINEERING';
        const p = prompt.toLowerCase();

        if (p.includes('crash') || p.includes('error') || p.includes('fail')) return 'CRITICAL_ALERT';
        if (p.includes('triage') || p.includes('staged') || p.includes('qualified')) return 'TRIAGE_STATUS';
        if (p.includes('proposal') || p.includes('outreach') || p.includes('deal')) return 'DEAL_ENGAGEMENT';
        if (p.includes('diagnostic') || p.includes('trauma') || p.includes('bedrock')) return 'DIAGNOSTIC_RECOVERY';

        return 'SYSTEMS_ENGINEERING';
    }

    detectToneModifiers(userMessage) {
        if (!userMessage || typeof userMessage !== 'string') return;
        const msg = userMessage.toLowerCase();

        const modifiers = ['short', 'minimal', 'clean', 'direct', 'factual', 'precise', 'no hype', 'no fluff'];
        modifiers.forEach(mod => {
            if (msg.includes(mod) && !this.toneMemory.recentToneModifiers.includes(mod)) {
                this.toneMemory.recentToneModifiers.push(mod);
                if (this.toneMemory.recentToneModifiers.length > 5) {
                    this.toneMemory.recentToneModifiers.shift();
                }
            }
        });
    }

    modulateContext(prompt, baseSystemContext = '') {
        const category = this.detectCategory(prompt);
        this.detectToneModifiers(prompt);

        const categoryRule = this.lockedCategories[category] || this.lockedCategories.SYSTEMS_ENGINEERING;
        const dynamicToneRule = `Tone constraints: ${this.toneMemory.recentToneModifiers.join(', ')}.`;

        return `${baseSystemContext}\n${categoryRule}\n${dynamicToneRule}`.trim();
    }

    evaluatePersonaState(samplePrompt) {
        console.log(`evaluating dynamic persona modulation state`);
        const modulated = this.modulateContext(samplePrompt, "Base Role: XORAS Core Engine.");
        console.log(`category detected: ${this.detectCategory(samplePrompt)}`);
        console.log(`enforced modulation context:\n${modulated}`);
        return modulated;
    }
}

module.exports = new DynamicPersona();

if (require.main === module) {
    const persona = new DynamicPersona();
    persona.evaluatePersonaState("Analyze IPC pipe failure during PR triage. Keep it minimal and clean.");
}
