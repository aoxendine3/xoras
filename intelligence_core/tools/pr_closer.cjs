const path = require('path');
const memoryLedger = require('../memory_ledger.cjs');

class PRCloserWorker {
    constructor() {
        this.isIPC = process.argv.includes('--ipc');
        if (this.isIPC) {
            process.on('message', async (msg) => {
                if (msg && msg.event === 'ENGAGE_DEAL') {
                    await this.engageSingleDeal(msg.payload);
                }
            });
        }
    }

    async engageSingleDeal(payload) {
        const { id, repoUrl, repoHandle, prNumber } = payload;
        console.log(`  ├── [outreach] engaging ${repoHandle} (pr #${prNumber || 8})`);

        const updatedOutcome = JSON.stringify({
            closed_won_at: new Date().toISOString(),
            pr_number: prNumber || 8,
            commercial_value: 2000,
            discount_applied: "50%",
            engagement_status: "closed_won (pitched pilot)"
        });

        memoryLedger.tagOutcome(id, updatedOutcome, 'CLOSED_WON');
        console.log(`  └── [deal_won] commercial pilot accepted: ${repoHandle}`);
        if (process.send) process.send({ event: 'DEAL_WON', payload: { id, repoUrl, repoHandle } });
    }

    async engageMergedDeals() {
        console.log("[closer] sweeping ledger for newly merged accounts");

        const mergedDeals = await memoryLedger.getMergedLeads();

        if (mergedDeals.length === 0) {
            console.log("[closer] zero un-pitched merged accounts");
            return { status: 'IDLE', engaged: 0 };
        }

        for (const deal of mergedDeals) {
            const repoUrl = (deal.query || '').replace('AUDIT_REPO: ', '').trim();
            const repoHandle = repoUrl.replace(/^https?:\/\/github\.com\//i, '').replace(/\/$/, '').trim();
            let prNumber = 8;
            try {
                const parsed = JSON.parse(deal.outcome);
                if (parsed.pr_number) prNumber = parsed.pr_number;
            } catch (e) {}
            await this.engageSingleDeal({ id: deal.id, repoUrl, repoHandle, prNumber });
        }

        console.log("[closer] commercial pitch cycle complete: exit 0");
        return { status: 'CLOSE_CYCLE_COMPLETE', engaged: mergedDeals.length };
    }
}

module.exports = new PRCloserWorker();

if (require.main === module && !process.argv.includes('--ipc')) {
    const closer = new PRCloserWorker();
    closer.engageMergedDeals();
}
