/**
 * XORAS CORE: Autonomous Lead Triage & Queue Prioritizer
 * Purpose: Evaluates repository semantics and organizational naming signals from high-speed in-memory hydration cache,
 * and categorizes leads into 3 distinct execution tiers with zero disk I/O latency.
 */

const memoryLedger = require('../memory_ledger.cjs');

class QueuePrioritizer {
    async prioritize() {
        const startMs = performance.now();
        const stagedLeads = await memoryLedger.getStagedLeads();
        const durationMs = (performance.now() - startMs).toFixed(3);

        console.log(`⚡ [QUEUE_PRIORITIZER] Triage executed across ${stagedLeads.length} Staged Leads via $O(1)$ memory cache (Hydration latency: ${durationMs}ms)\n`);

        const tiers = {
            TIER_1_TROPHY: [],
            TIER_2_COMMERCIAL: [],
            TIER_3_LOW_SIGNAL: []
        };

        const trophySignals = ['auth', 'protocol', 'cloud', 'engine', 'sentry', 'security', 'infrastructure', 'gravix', 'namuh-eng'];
        const lowSignals = ['portfolio', 'portifolio', 'test', 'demo', 'sandbox', 'learning', '_r1'];

        stagedLeads.forEach(lead => {
            const cleanHandle = (lead.query || '').replace('AUDIT_REPO: https://github.com/', '').toLowerCase();
            const rawRepo = (lead.query || '').replace('AUDIT_REPO: ', '');
            
            if (trophySignals.some(sig => cleanHandle.includes(sig))) {
                tiers.TIER_1_TROPHY.push(rawRepo);
            } else if (lowSignals.some(sig => cleanHandle.includes(sig))) {
                tiers.TIER_3_LOW_SIGNAL.push(rawRepo);
            } else {
                tiers.TIER_2_COMMERCIAL.push(rawRepo);
            }
        });

        console.log("🏆 === TIER 1: TROPHY & INFRASTRUCTURE LEADS (High Margin / Protocol Grade) ===");
        [...new Set(tiers.TIER_1_TROPHY)].slice(0, 5).forEach((target, i) => {
            console.log(`[PRIORITY ${i+1}] ${target}`);
        });
        console.log("========================================================================\n");

        console.log("📈 === TIER 2: COMMERCIAL SAAS & GROWTH ACCOUNTS ===");
        [...new Set(tiers.TIER_2_COMMERCIAL)].slice(0, 5).forEach((target, i) => {
            console.log(`[COMMERCIAL ${i+1}] ${target}`);
        });
        console.log("===================================================\n");

        console.log("⚠️ === TIER 3: LOW SIGNAL / SOLO PORTFOLIOS (Bypass) ===");
        [...new Set(tiers.TIER_3_LOW_SIGNAL)].slice(0, 3).forEach((target) => {
            console.log(`[DISQUALIFIED] ${target}`);
        });
        console.log("======================================================");

        return tiers;
    }
}

module.exports = new QueuePrioritizer();

if (require.main === module) {
    const prioritizer = new QueuePrioritizer();
    prioritizer.prioritize();
}
