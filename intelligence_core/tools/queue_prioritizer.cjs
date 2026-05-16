/**
 * XORAS CORE: Autonomous Lead Triage & Queue Prioritizer
 * Purpose: Scans all STAGED records in aether_brain.sqlite, evaluates repository semantics 
 * and organizational naming signals, and categorizes leads into 3 distinct execution tiers.
 */

const path = require('path');
const db = require('better-sqlite3')(path.join(__dirname, '../../AETHER_KNOWLEDGE_BASE/aether_brain.sqlite'));

class QueuePrioritizer {
    prioritize() {
        console.log("⚡ [QUEUE_PRIORITIZER] Executing Semantic Triage across 30 Staged Leads...\n");

        const stagedLeads = db.prepare(`
            SELECT id, query, manifest, timestamp 
            FROM episodic_logs 
            WHERE status = 'STAGED'
            ORDER BY id DESC
        `).all();

        const tiers = {
            TIER_1_TROPHY: [],
            TIER_2_COMMERCIAL: [],
            TIER_3_LOW_SIGNAL: []
        };

        // Scoring rules
        const trophySignals = ['auth', 'protocol', 'cloud', 'engine', 'sentry', 'security', 'infrastructure', 'gravix'];
        const lowSignals = ['portfolio', 'portifolio', 'test', 'demo', 'sandbox', 'learning', '_r1'];

        stagedLeads.forEach(lead => {
            const cleanHandle = lead.query.replace('AUDIT_REPO: https://github.com/', '').toLowerCase();
            
            if (trophySignals.some(sig => cleanHandle.includes(sig))) {
                tiers.TIER_1_TROPHY.push(lead.query.replace('AUDIT_REPO: ', ''));
            } else if (lowSignals.some(sig => cleanHandle.includes(sig))) {
                tiers.TIER_3_LOW_SIGNAL.push(lead.query.replace('AUDIT_REPO: ', ''));
            } else {
                tiers.TIER_2_COMMERCIAL.push(lead.query.replace('AUDIT_REPO: ', ''));
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
    }
}

module.exports = new QueuePrioritizer();

if (require.main === module) {
    const prioritizer = new QueuePrioritizer();
    prioritizer.prioritize();
}
