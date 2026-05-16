const { fork } = require('child_process');
const path = require('path');

class RevOpsSingularityMaster {
    constructor() {
        this.workers = {};
        this.activeLeads = new Set();
        this.stats = { staged: 0, qualified: 0, dispatched: 0, monitored: 0, won: 0 };
        this.harvestComplete = false;
        this.drainInterval = null;
    }

    async startSingularity(isReal = false) {
        console.log(`[singularity] initializing simultaneous multi-agent ipc hub (mode: ${isReal ? 'real' : 'simulated'})`);
        if (isReal) {
            console.log(`[singularity] strict segregation: preventing simulated data from co-mingling in live ledger`);
        }

        const spawnWorker = (name, scriptBasename, flags = []) => {
            const workerPath = path.join(__dirname, scriptBasename);
            const worker = fork(workerPath, ['--ipc', ...flags], { stdio: 'inherit' });
            worker.on('message', (msg) => this.handleIPCMessage(name, msg));
            worker.on('error', (err) => console.error(`[singularity] worker error (${name}): ${err.message}`));
            worker.on('exit', (code) => {
                delete this.workers[name];
            });
            this.workers[name] = worker;
            return worker;
        };

        spawnWorker('sniper', 'pr_sniper.cjs', isReal ? ['--real'] : []);
        spawnWorker('prioritizer', 'queue_prioritizer.cjs', isReal ? ['--real'] : []);
        spawnWorker('dispatcher', 'pr_dispatcher.cjs', isReal ? ['--real'] : ['--validate']);
        spawnWorker('monitor', 'pr_monitor.cjs', isReal ? ['--real'] : []);
        spawnWorker('closer', 'pr_closer.cjs', isReal ? ['--real'] : []);

        if (this.workers['sniper']) {
            this.workers['sniper'].send({ event: 'START_HARVEST' });
        }
    }

    handleIPCMessage(sourceName, msg) {
        if (!msg || !msg.event) return;

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

            case 'DEAL_WON':
                this.stats.won++;
                this.activeLeads.delete(msg.payload.repoUrl);
                break;

            case 'HARVEST_SWEEP_COMPLETE':
                this.harvestComplete = true;
                this.startDrainMonitor();
                break;

            case 'FATAL_AUTH_ERROR':
                console.error(`[singularity] fatal auth rejection received from dispatcher: ${msg.payload.error}`);
                console.error(`[singularity] aborting active pipeline. user intervention required in .env`);
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
        console.log(`\n[singularity] pipeline execution aggregate metrics:`);
        console.log(`  ├── leads staged     : ${this.stats.staged}`);
        console.log(`  ├── leads qualified  : ${this.stats.qualified}`);
        console.log(`  ├── leads dispatched : ${this.stats.dispatched}`);
        console.log(`  ├── prs merged       : ${this.stats.monitored}`);
        console.log(`  └── deals closed won : ${this.stats.won}`);
        console.log("[singularity] simultaneous multi-agent loop complete: exit 0");
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

module.exports = new RevOpsSingularityMaster();

if (require.main === module) {
    const args = process.argv.slice(2);
    const isReal = args.includes('--real');
    const master = new RevOpsSingularityMaster();
    master.startSingularity(isReal);
}
