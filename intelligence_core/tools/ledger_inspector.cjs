const path = require('path');
const memoryLedger = require('../memory_ledger.cjs');

class LedgerInspector {
    async inspect() {
        console.log("[inspector] executing in-memory relational state audit");

        const breakdown = await memoryLedger.getStatsSummary();
        const activeThreads = await memoryLedger.getAllActiveThreads();

        console.log("[inspector] pipeline aggregate stats:");
        console.log(`  ├── staged leads in queue : ${breakdown.STAGED || 0}`);
        console.log(`  ├── active pr submissions : ${breakdown.SUBMITTED || 0}`);
        console.log(`  ├── merged pr threads     : ${breakdown.MERGED || 0}`);
        console.log(`  └── closed / pitched won  : ${breakdown.CLOSED_WON || 0}`);

        console.log("[inspector] active threads dump:");
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
            console.log(`  ├── [${t.status.toLowerCase()}] ${cleanQuery} -> ${outcomeStr}`);
        });
        console.log("[inspector] state audit complete: exit 0");
    }

    async verifyLive(count) {
        console.log(`[inspector] live external verification across top ${count} entries`);
        const activeThreads = await memoryLedger.getAllActiveThreads();
        const targets = activeThreads.filter(t => t.status === 'SUBMITTED').slice(0, count);

        for (const t of targets) {
            const repoClean = (t.query || '').replace('AUDIT_REPO: https://github.com/', '').trim();
            try {
                const url = `https://api.github.com/repos/${repoClean}`;
                const res = await fetch(url, { headers: { 'User-Agent': 'XORAS_SOVEREIGN_NODE' } });
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
        console.log("[inspector] live verification complete: exit 0");
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
