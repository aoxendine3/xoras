const path = require('path');
const memoryLedger = require('../memory_ledger.cjs');

class LedgerInspector {
    async inspect() {
        console.log("[LEDGER_INSPECT] Executing Relational State Audit via V8 Memory Index...\n");

        const breakdown = await memoryLedger.getStatsSummary();
        const activeThreads = await memoryLedger.getAllActiveThreads();

        console.log("=== EXECUTIVE PIPELINE AGGREGATE ===");
        console.log(`📌 Staged Leads in Queue : ${breakdown.STAGED || 0}`);
        console.log(`⏳ Active PR Submissions : ${breakdown.SUBMITTED || 0}`);
        console.log(`📌 Merged PR Threads     : ${breakdown.MERGED || 0}`);
        console.log(`📌 Closed / Pitched Won  : ${breakdown.CLOSED_WON || 0}`);
        console.log("====================================\n");

        console.log("=== ACTIVE THREADS ===");
        activeThreads.forEach(t => {
            const cleanQuery = (t.query || '').replace('AUDIT_REPO: https://github.com/', '');
            let outcomeStr = t.outcome;
            try {
                if (t.outcome && t.outcome.startsWith('{')) {
                    const parsed = JSON.parse(t.outcome);
                    if (parsed.status_log) outcomeStr = parsed.status_log;
                    else if (parsed.engagement_status) outcomeStr = parsed.engagement_status;
                    else if (parsed.pr_title) outcomeStr = parsed.pr_title;
                }
            } catch (e) {}
            console.log(`[${t.status}] ${cleanQuery} -> ${outcomeStr}`);
        });
        console.log("======================");
    }
}

module.exports = new LedgerInspector();

if (require.main === module) {
    const inspector = new LedgerInspector();
    inspector.inspect();
}
