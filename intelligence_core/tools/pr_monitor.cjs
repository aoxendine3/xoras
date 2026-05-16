const path = require('path');
const memoryLedger = require('../memory_ledger.cjs');

const GITHUB_API_BASE = (process.env.GITHUB_API_BASE_URL || 'https://api.github.com').replace(/\/$/, '');

class PRMonitorWorker {
    constructor() {
        this.isIPC = process.argv.includes('--ipc');
        this.isReal = process.argv.includes('--real');
        this.token = process.env.GITHUB_TOKEN || '';

        if (this.isIPC) {
            process.on('message', async (msg) => {
                if (msg && msg.event === 'MONITOR_LEAD') {
                    await this.monitorSingleLead(msg.payload);
                }
            });
        }
    }

    async monitorSingleLead(payload) {
        const { id, repoUrl, repoHandle } = payload;

        if (this.isReal) {
            console.log(`  ├── [monitor] checking live GitHub pull request status: ${repoHandle}`);
            if (!this.token) {
                console.log(`  ├── [pr_active] ${repoHandle}: awaiting authorization credentials`);
                return;
            }

            try {
                const prsUrl = `${GITHUB_API_BASE}/repos/${repoHandle}/pulls?state=all`;
                const res = await fetch(prsUrl, {
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'User-Agent': 'XORAS_SOVEREIGN_NODE'
                    }
                });

                if (res.status === 200) {
                    const prs = await res.json();
                    const ourPr = prs.find(p => p.head && p.head.label && p.head.label.includes('aoxendine3'));
                    if (ourPr) {
                        if (ourPr.merged_at) {
                            console.log(`  ├── [pr_merged] ${repoHandle} (live pr #${ourPr.number})`);
                            const updatedOutcome = JSON.stringify({
                                merged_at: ourPr.merged_at,
                                pr_number: ourPr.number,
                                status_log: `merged (pr #${ourPr.number}) [LIVE]`
                            });
                            memoryLedger.tagOutcome(id, updatedOutcome, 'MERGED');
                            if (process.send) process.send({ event: 'PR_MERGED', payload: { id, repoUrl, repoHandle, prNumber: ourPr.number } });
                        } else {
                            console.log(`  ├── [pr_active] ${repoHandle} (live pr #${ourPr.number} state: ${ourPr.state})`);
                        }
                    } else {
                        console.log(`  ├── [pr_active] ${repoHandle} (live pr branch tracking pending upstream sync)`);
                    }
                } else {
                    console.log(`  ├── [pr_active] ${repoHandle} (http ${res.status})`);
                }
            } catch (e) {
                console.log(`  ├── [pr_active] ${repoHandle} (network check error: ${e.message})`);
            }
        } else {
            let prNumber = Math.floor(Math.random() * 50) + 1;
            if (repoHandle.includes('sea-lion-sentry')) prNumber = 24;
            if (repoHandle.includes('exponential')) prNumber = 8;

            if (repoHandle.includes('sea-lion-sentry') || repoHandle.includes('exponential') || Math.random() > 0.5) {
                console.log(`  ├── [pr_merged] ${repoHandle} (simulated pr #${prNumber})`);
                const updatedOutcome = JSON.stringify({
                    merged_at: new Date().toISOString(),
                    pr_number: prNumber,
                    status_log: `merged (pr #${prNumber}) [SIMULATED]`
                });
                memoryLedger.tagOutcome(id, updatedOutcome, 'MERGED');
                if (process.send) process.send({ event: 'PR_MERGED', payload: { id, repoUrl, repoHandle, prNumber } });
            } else {
                console.log(`  ├── [pr_active] ${repoHandle} (simulated pr #${prNumber})`);
            }
        }
    }

    async monitorActiveSubmissions() {
        console.log(`[monitor] sweeping active pr submissions in cache (mode: ${this.isReal ? 'REAL' : 'SIMULATED'})`);

        const activeSubmissions = await memoryLedger.getSubmittedLeads();

        if (activeSubmissions.length === 0) {
            console.log("[monitor] zero active pending submissions");
            return { status: 'IDLE', checked: 0 };
        }

        for (const sub of activeSubmissions) {
            const repoUrl = (sub.query || '').replace('AUDIT_REPO: ', '').trim();
            const repoHandle = repoUrl.replace(/^https?:\/\/github\.com\//i, '').replace(/\/$/, '').trim();
            await this.monitorSingleLead({ id: sub.id, repoUrl, repoHandle });
        }

        console.log("[monitor] surveillance cycle complete: exit 0");
        return { status: 'MONITOR_CYCLE_COMPLETE', tracked: activeSubmissions.length };
    }
}

module.exports = new PRMonitorWorker();

if (require.main === module && !process.argv.includes('--ipc')) {
    const monitor = new PRMonitorWorker();
    monitor.monitorActiveSubmissions();
}
