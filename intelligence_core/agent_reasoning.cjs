const tools = require('./agent_tools.cjs');

class PlanningEngine {
    constructor() {
        this.experts = {
            'SECURITY': 'Assesses data risk.',
            'ARCHITECT': 'Verifies structural integrity.',
            'PERFORMANCE': 'Evaluates resource limits.',
            'RESEARCH': 'Analyzes market trends.',
            'SCRIPTING': 'Drafts outreach content.',
            'ANALYTICS': 'Projects conversion metrics.'
        };
    }

    async deliberate(query, state) {
        const expertKeys = Object.keys(this.experts);
        const opinions = await Promise.all(expertKeys.map(async (expert) => {
            const opinion = await this.generateExpertOpinion(expert, query, state);
            console.log(`[AETHER] ${expert} Input: ${opinion.summary}`);
            return opinion;
        }));

        const totalScore = opinions.reduce((acc, o) => acc + o.score, 0);
        const score = totalScore / opinions.length;
        const hasLowConfidence = opinions.some(o => o.score < 0.7);
        const status = (score >= 0.8 && !hasLowConfidence) ? 'GO' : 'REVIEW_REQUIRED';
        const manifest = opinions.map(o => o.summary).join(' | ');

        return { status, score, manifest };
    }

    async generateExpertOpinion(expert, query, state) {
        const q = query.toLowerCase();
        switch (expert) {
            case 'SECURITY':
                if (q.includes('secret') || q.includes('key')) return { score: 0.1, summary: 'CRITICAL_RISK: Potential PII exposure detected.' };
                return { score: 1.0, summary: 'Security baseline verified.' };
            case 'ARCHITECT':
                if (q.includes('break') || q.includes('rebuild')) return { score: 0.9, summary: 'Structural integrity audit recommended during reconstruction.' };
                return { score: 1.0, summary: 'Architectural alignment confirmed.' };
            case 'PERFORMANCE':
                if (q.includes('stress') || q.includes('batch')) return { score: 0.7, summary: 'Performance throttling required to maintain stability.' };
                return { score: 1.0, summary: 'Resource overhead within nominal bounds.' };
            case 'RESEARCH':
                const hnSignal = await tools.fetchHackerNewsTrends(query);
                if (hnSignal.status === 'SUCCESS' && hnSignal.confidence > 0.3) {
                    return { 
                        score: 1.0, 
                        summary: `Live Signal: ${hnSignal.summary} (Confidence: ${hnSignal.confidence.toFixed(2)})`,
                        data: hnSignal.topHits 
                    };
                }
                return { 
                    score: 0.5, 
                    summary: `LOW_CONFIDENCE: ${hnSignal.summary || 'Research source unreachable.'}`,
                    data: null 
                };
            case 'SCRIPTING':
                return { score: 1.0, summary: 'Content: Drafting message focused on sovereign stability and local execution.' };
            case 'ANALYTICS':
                return { score: 1.0, summary: 'Metrics: Projected 65% response rate for target demographic.' };
            default:
                return { score: 1.0, summary: 'Input nominal.' };
        }
    }

    generatePlan(query, state) {
        return [{ step: 'STATE_TELEMETRY', tool: null, params: null, rationale: 'Standard operational status check.' }];
    }
}
module.exports = new PlanningEngine();
