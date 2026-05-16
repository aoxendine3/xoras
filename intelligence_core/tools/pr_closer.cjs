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
        const { id, repoUrl, repoHandle, prNumber, tierLabel } = payload;
        const labelStr = tierLabel ? ` [${tierLabel}]` : '';
        console.log(`  ├── [outreach_staged] staging commercial pilot proposal for ${repoHandle} (pr #${prNumber || 8})${labelStr}`);

        const updatedOutcome = JSON.stringify({
            outreach_staged_at: new Date().toISOString(),
            pr_number: prNumber || 8,
            commercial_value: 2000,
            discount_applied: "50%",
            engagement_status: `proposal_staged (awaiting maintainer response)${labelStr}`,
            outreach_tier: tierLabel || "PRIMARY_TARGET",
            status: "WAITING_FOR_APPROVAL"
        });

        memoryLedger.tagOutcome(id, updatedOutcome, 'WAITING_FOR_APPROVAL');
        memoryLedger.tagExecutionMode(id, 'REAL');
        console.log(`  └── [holding] outreach proposal locked in WAITING_FOR_APPROVAL state: ${repoHandle}`);
        if (process.send) process.send({ event: 'OUTREACH_STAGED', payload: { id, repoUrl, repoHandle } });
    }

    async engageMergedDeals() {
        console.log("[closer] sweeping ledger for genuinely merged accounts");
        console.log("[closer] policy enforcement: strict throttling (1 primary + 1 secondary max)");

        const mergedDeals = await memoryLedger.getMergedLeads();

        if (mergedDeals.length === 0) {
            console.log("[closer] zero un-pitched merged accounts");
            return { status: 'IDLE', engaged: 0 };
        }

        const primaryDeal = mergedDeals[0];
        const secondaryDeal = mergedDeals.length > 1 ? mergedDeals[1] : null;
        const throttledDeals = mergedDeals.slice(2);

        const dealsToProcess = [
            { deal: primaryDeal, label: "PRIMARY_TARGET" },
            ...(secondaryDeal ? [{ deal: secondaryDeal, label: "SECONDARY_TARGET" }] : [])
        ];

        for (const target of dealsToProcess) {
            const deal = target.deal;
            const repoUrl = (deal.query || '').replace('AUDIT_REPO: ', '').trim();
            const repoHandle = repoUrl.replace(/^https?:\/\/github\.com\//i, '').replace(/\/$/, '').trim();
            let prNumber = 8;
            try {
                const parsed = JSON.parse(deal.outcome);
                if (parsed.pr_number) prNumber = parsed.pr_number;
            } catch (e) {}
            await this.engageSingleDeal({ id: deal.id, repoUrl, repoHandle, prNumber, tierLabel: target.label });
        }

        if (throttledDeals.length > 0) {
            console.log(`\n[closer] outreach limit reached. throttling remaining ${throttledDeals.length} accounts`);
            console.log(`[closer] status update: halting commercial outreach. entering WAITING_FOR_APPROVAL state`);
            for (const rem of throttledDeals) {
                memoryLedger.tagOutcome(rem.id, JSON.stringify({ status: "WAITING_FOR_APPROVAL", reason: "outreach limit reached (1 primary + 1 secondary max)" }), 'MERGED');
            }
        }

        console.log("[closer] commercial proposal cycle complete: exit 0");
        return { status: 'CLOSE_CYCLE_COMPLETE', engaged: dealsToProcess.length };
    }
}

module.exports = new PRCloserWorker();

if (require.main === module && !process.argv.includes('--ipc')) {
    const closer = new PRCloserWorker();
    closer.engageMergedDeals();
}
