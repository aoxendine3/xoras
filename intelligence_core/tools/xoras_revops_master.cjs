const { fork } = require('child_process');
const path = require('path');
const memoryLedger = require('../memory_ledger.cjs');
const PromptGuard = require('../security/prompt_guard.cjs');
const TimeZoneScheduler = require('./tz_scheduler.cjs');

class RevOpsMaster {
    constructor() {
        this.workers = {};
        this.workerRetryMap = {};
        this.activeLeads = new Set();
        this.stats = { staged: 0, qualified: 0, dispatched: 0, monitored: 0, won: 0, respawns: 0 };
        this.harvestComplete = false;
        this.drainInterval = null;
    }

    async startOrchestration() {
        const activeRegion = TimeZoneScheduler.getCurrentActiveRegion();
        console.log(`initializing multi-agent workflow hub (mode: live-fire)`);
        console.log(`active global tranche: ${activeRegion.region} (${activeRegion.label})`);

        this.spawnWorker('sniper', 'pr_sniper.cjs');
        this.spawnWorker('prioritizer', 'queue_prioritizer.cjs');
        this.spawnWorker('dispatcher', 'pr_dispatcher.cjs');
        this.spawnWorker('monitor', 'pr_monitor.cjs');
        this.spawnWorker('closer', 'pr_closer.cjs');

        if (this.workers['sniper']) {
            this.workers['sniper'].send({ event: 'START_HARVEST' });
        }
    }

    spawnWorker(name, scriptBasename, retryCount = 0) {
        const workerPath = path.join(__dirname, scriptBasename);
        const args = ['--ipc', '--real', ...(retryCount > 0 ? ['--recovery-mode'] : [])];
        const worker = fork(workerPath, args, { stdio: 'inherit' });

        worker.on('message', (msg) => this.handleIPCMessage(name, msg));
        worker.on('error', (err) => console.error(`worker error (${name}): ${err.message}`));
        worker.on('exit', (code) => {
            delete this.workers[name];
            if (code !== 0 && code !== null) {
                console.log(`error detected: worker '${name}' exited with code ${code}. initiating self-healing recovery.`);
                this.stats.respawns++;
                
                try {
                    if (memoryLedger.logSecurityEvent) {
                        memoryLedger.logSecurityEvent('WORKER_CRASH_RECOVERY', `${name}_crash_${code}`, `Respawning worker ${name} after exit ${code}`, 1);
                    }
                } catch (e) {}

                const nextRetry = retryCount + 1;
                if (nextRetry <= 5) {
                    const backoffMs = Math.pow(2, nextRetry) * 1000;
                    console.log(`learning loop: exponential backoff scheduled. respawning '${name}' in ${backoffMs}ms (attempt ${nextRetry}/5)`);
                    setTimeout(() => {
                        this.spawnWorker(name, scriptBasename, nextRetry);
                    }, backoffMs);
                } else {
                    console.error(`fatal: worker '${name}' exceeded max recovery limits. terminating.`);
                    this.terminateAllWorkers(1);
                }
            }
        });

        this.workers[name] = worker;
        this.workerRetryMap[name] = retryCount;
        return worker;
    }

    handleIPCMessage(sourceName, msg) {
        if (!msg || !msg.event) return;

        if (msg.payload && typeof msg.payload.issueTitle === 'string') {
            const auditRes = PromptGuard.audit(msg.payload.issueTitle);
            if (!auditRes.safe) {
                console.log(`prompt guard blocked malformed IPC payload from '${sourceName}'`);
                return;
            }
            msg.payload.issueTitle = auditRes.sanitized;
        }

        switch (msg.event) {
            case 'LEAD_STAGED':
                this.stats.staged++;
                this.activeLeads.add(msg.payload.repoUrl);
                if (this.workers['prioritizer']) {
                    this.workers['prioritizer'].send({ event: 'TRIAGE_LEAD', payload: msg.payload });
                }
                break;

            case 'LEAD_QUALIFIED':
                this.stats.qualified++;
                if (this.workers['dispatcher']) {
                    this.workers['dispatcher'].send({ event: 'DISPATCH_LEAD', payload: msg.payload });
                }
                break;

            case 'LEAD_DISQUALIFIED':
                this.activeLeads.delete(msg.payload.repoUrl);
                break;

            case 'DISPATCH_SUCCESS':
                this.stats.dispatched++;
                if (this.workers['monitor']) {
                    this.workers['monitor'].send({ event: 'MONITOR_LEAD', payload: msg.payload });
                }
                break;

            case 'PR_MERGED':
                this.stats.monitored++;
                if (this.workers['closer']) {
                    this.workers['closer'].send({ event: 'ENGAGE_DEAL', payload: msg.payload });
                }
                break;

            case 'OUTREACH_STAGED':
                this.stats.won++;
                this.activeLeads.delete(msg.payload.repoUrl);
                break;

            case 'HARVEST_SWEEP_COMPLETE':
                this.harvestComplete = true;
                this.startDrainMonitor();
                break;

            case 'FATAL_AUTH_ERROR':
                console.error(`fatal auth rejection received from dispatcher: ${msg.payload.error}`);
                console.error(`aborting active workflow. user intervention required in .env`);
                this.terminateAllWorkers(1);
                break;
        }
    }

    startDrainMonitor() {
        let stableCycles = 0;
        let lastDispatched = -1;

        this.drainInterval = setInterval(() => {
            if (this.stats.dispatched === lastDispatched && this.stats.dispatched > 0) {
                stableCycles++;
            } else {
                stableCycles = 0;
                lastDispatched = this.stats.dispatched;
            }

            if (stableCycles >= 3 || (this.stats.qualified > 0 && this.stats.dispatched >= this.stats.qualified)) {
                clearInterval(this.drainInterval);
                this.reportAggregateMetricsAndExit();
            }
        }, 1000);
    }

    reportAggregateMetricsAndExit() {
        console.log(`workflow execution aggregate metrics:`);
        console.log(`  leads staged: ${this.stats.staged}`);
        console.log(`  leads qualified: ${this.stats.qualified}`);
        console.log(`  leads dispatched: ${this.stats.dispatched}`);
        console.log(`  pr threads tracked: ${this.stats.monitored}`);
        console.log(`  proposals staged: ${this.stats.won}`);
        console.log(`  recovery respawns: ${this.stats.respawns}`);
        console.log(`multi-agent workflow loop complete: exit 0`);
        this.terminateAllWorkers(0);
    }

    terminateAllWorkers(code = 0) {
        if (this.drainInterval) clearInterval(this.drainInterval);
        for (const name in this.workers) {
            try {
                this.workers[name].kill();
            } catch (e) {}
        }
        process.exit(code);
    }
}

module.exports = new RevOpsMaster();

if (require.main === module) {
    const master = new RevOpsMaster();
    master.startOrchestration();
}
