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

    async verifyLive(count) {
        console.log(`[LEDGER_VERIFY] Executing Live External API Verification across top ${count} entries...\n`);
        const activeThreads = await memoryLedger.getAllActiveThreads();
        const targets = activeThreads.filter(t => t.status === 'SUBMITTED').slice(0, count);

        console.log("=== LIVE EXTERNAL GITHUB VERIFICATION ===");
        for (const t of targets) {
            const repoClean = (t.query || '').replace('AUDIT_REPO: https://github.com/', '').trim();
            console.log(`[VERIFYING] ${repoClean}`);
            try {
                const url = `https://api.github.com/repos/${repoClean}`;
                const res = await fetch(url, { headers: { 'User-Agent': 'XORAS_SOVEREIGN_NODE' } });
                if (res.status === 404) {
                    console.log(`  ➔ [MISMATCH_404] Repository or endpoint not found on live GitHub network.`);
                } else if (res.status === 200) {
                    const data = await res.json();
                    console.log(`  ➔ [LIVE_VERIFIED] Repository active (Stars: ${data.stargazers_count}). Local simulated patch staged.`);
                } else if (res.status === 403) {
                    console.log(`  ➔ [LIVE_RATE_LIMIT] External GitHub API rate limit reached.`);
                } else {
                    console.log(`  ➔ [HTTP_${res.status}] External network response.`);
                }
            } catch (e) {
                console.log(`  ➔ [ERROR] Network connection failed: ${e.message}`);
            }
        }
        console.log("=========================================");
    }
}

module.exports = new LedgerInspector();

if (require.main === module) {
    const args = process.argv.slice(2);
    const verifyIndex = args.indexOf('--verify');
    if (verifyIndex !== -1) {
        const count = parseInt(args[verifyIndex + 1], 10) || 5;
        const inspector = new LedgerInspector();
        inspector.verifyLive(count);
    } else {
        const inspector = new LedgerInspector();
        inspector.inspect();
    }
}
