const memoryLedger = require('../memory_ledger.cjs');

class QueuePrioritizer {
    constructor() {
        this.isIPC = process.argv.includes('--ipc');
        if (this.isIPC) {
            process.on('message', async (msg) => {
                if (msg && msg.event === 'TRIAGE_LEAD') {
                    await this.triageSingleLead(msg.payload);
                }
            });
        }
    }

    async triageSingleLead(payload) {
        const { id, repoUrl, issueTitle } = payload;
        const cleanHandle = repoUrl.toLowerCase();
        
        const trophySignals = ['auth', 'protocol', 'cloud', 'engine', 'sentry', 'security', 'infrastructure', 'gravix', 'namuh-eng'];
        const lowSignals = ['portfolio', 'portifolio', 'test', 'demo', 'sandbox', 'learning', '_r1'];

        let tier = 'COMMERCIAL';
        if (trophySignals.some(sig => cleanHandle.includes(sig))) tier = 'TROPHY';
        else if (lowSignals.some(sig => cleanHandle.includes(sig))) tier = 'DISQUALIFIED';

        if (tier === 'DISQUALIFIED') {
            process.send({ event: 'LEAD_DISQUALIFIED', payload: { id, repoUrl } });
        } else {
            process.send({ event: 'LEAD_QUALIFIED', payload: { id, repoUrl, issueTitle, tier } });
        }
    }

    async prioritize() {
        const startMs = performance.now();
        const stagedLeads = await memoryLedger.getStagedLeads();
        const durationMs = (performance.now() - startMs).toFixed(3);

        console.log(`[triage] cache lookup complete (${stagedLeads.length} leads in ${durationMs}ms)`);

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

        console.log("[triage] tier 1: core protocol targets");
        [...new Set(tiers.TIER_1_TROPHY)].slice(0, 5).forEach((target, i) => {
            console.log(`  ├── [p${i+1}] ${target}`);
        });

        console.log("[triage] tier 2: commercial saas accounts");
        [...new Set(tiers.TIER_2_COMMERCIAL)].slice(0, 5).forEach((target, i) => {
            console.log(`  ├── [c${i+1}] ${target}`);
        });

        console.log("[triage] tier 3: disqualified portfolio repos");
        [...new Set(tiers.TIER_3_LOW_SIGNAL)].slice(0, 3).forEach((target) => {
            console.log(`  └── [bypass] ${target}`);
        });

        return tiers;
    }
}

module.exports = new QueuePrioritizer();

if (require.main === module && !process.argv.includes('--ipc')) {
    const prioritizer = new QueuePrioritizer();
    prioritizer.prioritize();
}
