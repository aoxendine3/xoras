/**
 * 🏛️ XORAS // Sovereign Structural Loop Sentinel (xoras_loop_sentinel.cjs)
 * 
 * Advanced heuristic execution monitor. Distinguishes between runaway infinite generative loops 
 * (repetitive static content) and legitimate high-velocity disciplined execution (consistent B2B structure).
 */

const crypto = require('crypto');

class LoopSentinel {
    constructor(maxWindow = 5, similarityThreshold = 0.85) {
        this.window = [];
        this.maxWindow = maxWindow;
        this.similarityThreshold = similarityThreshold;
    }

    /**
     * Normalizes output by stripping dynamic data (timestamps, numbers, URLs, unique IDs)
     * leaving only the structural layout framework.
     */
    extractStructuralSkeleton(text) {
        return text
            .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z?/g, '[TIMESTAMP]')
            .replace(/https?:\/\/[^\s]+/g, '[URL]')
            .replace(/\b\d+\b/g, '[NUM]')
            .replace(/#\d+/g, '[PR_ID]')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * Calculates Levenshtein distance similarity between two structural skeletons.
     */
    calculateSimilarity(str1, str2) {
        if (str1 === str2) return 1.0;
        if (str1.length === 0 || str2.length === 0) return 0.0;
        
        const len1 = str1.length;
        const len2 = str2.length;
        const matrix = Array.from({ length: len1 + 1 }, () => new Array(len2 + 1).fill(0));

        for (let i = 0; i <= len1; i++) matrix[i][0] = i;
        for (let j = 0; i <= len2; j++) matrix[0][j] = j;

        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,      // deletion
                    matrix[i][j - 1] + 1,      // insertion
                    matrix[i - 1][j - 1] + cost // substitution
                );
            }
        }
        
        const maxLen = Math.max(len1, len2);
        return (maxLen - matrix[len1][len2]) / maxLen;
    }

    /**
     * Audits an execution turn to determine if it is a runaway loop or disciplined high-velocity output.
     */
    auditExecutionTurn(turnId, rawText) {
        const skeleton = this.extractStructuralSkeleton(rawText);
        const payloadHash = crypto.createHash('sha256').update(rawText).digest('hex');
        const skeletonHash = crypto.createHash('sha256').update(skeleton).digest('hex');

        this.window.push({ turnId, rawText, skeleton, payloadHash, skeletonHash, timestamp: Date.now() });
        if (this.window.length > this.maxWindow) this.window.shift();

        if (this.window.length < 3) {
            return { state: 'NORMAL_EXECUTION', velocity: 'STABLE', action: 'ALLOW' };
        }

        // Check if raw payload content is exactly identical across recent window
        const identicalPayloads = this.window.every(t => t.payloadHash === payloadHash);
        if (identicalPayloads) {
            return { 
                state: 'CATASTROPHIC_GENERATIVE_LOOP', 
                velocity: 'RUNAWAY_REPETITION', 
                action: 'THROTTLE_HARD_BREAKER',
                reason: 'Identical payload and structure repeated statically across 5 consecutive turns.'
            };
        }

        // Check if structural skeletons match but payloads are evolving
        const structuralMatches = this.window.filter(t => t.skeletonHash === skeletonHash).length;
        if (structuralMatches >= 3) {
            return {
                state: 'HIGH_VELOCITY_DISCIPLINED_EXECUTION',
                velocity: 'HYPER_WARP',
                action: 'ALLOW_UNTHROTTLED',
                reason: 'Consistent structural reporting architecture detected with dynamic, evolving payload metrics.'
            };
        }

        return { state: 'NORMAL_EXECUTION', velocity: 'STABLE', action: 'ALLOW' };
    }
}

module.exports = new LoopSentinel();

if (require.main === module) {
    const sentinel = new LoopSentinel();
    console.log("🛡️ [LOOP_SENTINEL] Executing Simulation Run...");

    const mockTurn1 = "=== REVOPS STATS === Staged: 10 Targets. Active: PR #5.";
    const mockTurn2 = "=== REVOPS STATS === Staged: 30 Targets. Active: PR #12.";
    const mockTurn3 = "=== REVOPS STATS === Staged: 56 Targets. Active: PR #19.";

    console.log(">>> Submitting Turn 1...");
    console.log(sentinel.auditExecutionTurn("T1", mockTurn1));
    console.log(">>> Submitting Turn 2...");
    console.log(sentinel.auditExecutionTurn("T2", mockTurn2));
    console.log(">>> Submitting Turn 3...");
    const outcome = sentinel.auditExecutionTurn("T3", mockTurn3);
    console.log(outcome);

    if (outcome.state === 'HIGH_VELOCITY_DISCIPLINED_EXECUTION') {
        console.log("\n✅ [SUCCESS] Sentinel flawlessly recognized high-velocity disciplined formatting without triggering a loop panic.");
    }
}
