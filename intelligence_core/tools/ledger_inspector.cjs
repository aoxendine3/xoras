const path = require('path');
const memoryLedger = require('../memory_ledger.cjs');

const GITHUB_API_BASE = (process.env.GITHUB_API_BASE_URL || 'https://api.github.com').replace(/\/$/, '');

class LedgerInspector {
    async inspect() {
        console.log("[inspector] executing relational state audit (live vs simulation data segregation)");

        const activeThreads = await memoryLedger.getAllActiveThreads();

        const realThreads = activeThreads.filter(t => t.execution_mode === 'REAL');
        const simThreads = activeThreads.filter(t => t.execution_mode !== 'REAL');

        const countByStatus = (threads) => {
            const counts = { STAGED: 0, QUALIFIED: 0, SUBMITTED: 0, MERGED: 0, CLOSED_WON: 0, WAITING_FOR_APPROVAL: 0 };
            threads.forEach(t => { if (t.status in counts) counts[t.status]++; });
            return counts;
        };

        const realCounts = countByStatus(realThreads);
        const simCounts = countByStatus(simThreads);

        console.log("\n======================================================================");
        console.log("             📊 XORAS // VERIFIED OPERATIONAL LEDGER                 ");
        console.log("======================================================================");
        console.log(`  ├── active PR threads tracked  : ${realCounts.SUBMITTED}`);
        console.log(`  ├── verified upstream merges   : ${realCounts.MERGED}`);
        console.log(`  ├── commercial proposals won   : ${realCounts.CLOSED_WON}`);
        console.log(`  ├── throttled holding queue    : ${realCounts.WAITING_FOR_APPROVAL}`);
        console.log(`  └── staged leads in queue      : ${realCounts.STAGED + realCounts.QUALIFIED}`);

        if (realThreads.length > 0) {
            console.log("\n[verified active threads dump]:");
            realThreads.forEach(t => {
                const cleanQuery = (t.query || '').replace('AUDIT_REPO: https://github.com/', '');
                let outcomeStr = t.outcome;
                try {
                    if (t.outcome && t.outcome.startsWith('{')) {
                        const parsed = JSON.parse(t.outcome);
                        if (parsed.status_log) outcomeStr = parsed.status_log;
                        else if (parsed.engagement_status) outcomeStr = parsed.engagement_status;
                        else if (parsed.pr_title) outcomeStr = parsed.pr_title;
                        else if (parsed.html_url) outcomeStr = parsed.html_url;
                        else if (parsed.status) outcomeStr = parsed.status;
                    }
                } catch (e) {}
                console.log(`  ├── [${t.status.toLowerCase()}] ${cleanQuery} -> ${outcomeStr}`);
            });
        } else {
            console.log("  └── zero verified records staged in database.");
        }

        console.log("\n======================================================================");
        console.log("              🛠️ XORAS // SIMULATED VALIDATION SANDBOX               ");
        console.log("======================================================================");
        console.log(`  ├── simulated commercial won   : ${simCounts.CLOSED_WON}`);
        console.log(`  ├── simulated pr submissions   : ${simCounts.SUBMITTED}`);
        console.log(`  └── simulated staged in queue  : ${simCounts.STAGED + simCounts.QUALIFIED}`);

        console.log("\n[inspector] state audit complete: exit 0");
    }

    async verifyLive(count) {
        console.log(`[inspector] external verification across top ${count} entries (${GITHUB_API_BASE})`);
        const activeThreads = await memoryLedger.getAllActiveThreads();
        const targets = activeThreads.filter(t => t.status === 'SUBMITTED' && t.execution_mode === 'REAL').slice(0, count);

        if (targets.length === 0) {
            console.log("  └── zero active PR submissions found to verify.");
            return;
        }

        for (const t of targets) {
            const repoClean = (t.query || '').replace('AUDIT_REPO: https://github.com/', '').trim();
            try {
                const url = `${GITHUB_API_BASE}/repos/${repoClean}`;
                const res = await fetch(url, { headers: { 'User-Agent': 'XORAS-Core/1.0' } });
                if (res.status === 404) {
                    console.log(`  ├── [error 404] ${repoClean}: repository not found`);
                } else if (res.status === 200) {
                    const data = await res.json();
                    console.log(`  ├── [verified 200] ${repoClean}: active (stars: ${data.stargazers_count})`);
                } else if (res.status === 403) {
                    console.log(`  ├── [error 403] ${repoClean}: rate limit reached`);
                } else {
                    console.log(`  ├── [http ${res.status}] ${repoClean}: network response`);
                }
            } catch (e) {
                console.log(`  ├── [error] ${repoClean}: connection failed (${e.message})`);
            }
        }
        console.log("[inspector] verification complete: exit 0");
    }

    async releaseQueue() {
        console.log("[inspector] releasing throttled candidate holding queue...");
        const res = memoryLedger.releaseHoldingQueue();
        console.log(`  └── [released] ${res.releasedCount || 0} candidate leads un-gated back to STAGED status.`);
        console.log("[inspector] queue release complete: exit 0");
    }
}

module.exports = new LedgerInspector();

if (require.main === module) {
    const args = process.argv.slice(2);
    const verifyIndex = args.indexOf('--verify');
    const releaseIndex = args.indexOf('--release');

    if (verifyIndex !== -1) {
        const count = parseInt(args[verifyIndex + 1], 10) || 5;
        const inspector = new LedgerInspector();
        inspector.verifyLive(count);
    } else if (releaseIndex !== -1) {
        const inspector = new LedgerInspector();
        inspector.releaseQueue();
    } else {
        const inspector = new LedgerInspector();
        inspector.inspect();
    }
}
