const { execSync } = require('child_process');
const path = require('path');

class RevOpsMaster {
    async executeFullLoop() {
        console.log("XORAS REVOPS ENGINE: INITIATING MASTER LOOP\n");

        try {
            console.log(">>> STAGE 1: PR SNIPER <<<");
            this._runChildNode('pr_sniper.cjs');

            console.log("\n>>> STAGE 2: TRIAGE ENGINE <<<");
            this._runChildNode('queue_prioritizer.cjs');

            console.log("\n>>> STAGE 3: PR DISPATCHER <<<");
            this._runChildNode('pr_dispatcher.cjs');

            console.log("\n>>> STAGE 4: SURVEILLANCE MONITOR <<<");
            this._runChildNode('pr_monitor.cjs');

            console.log("\n>>> STAGE 5: POST-MERGE CLOSER <<<");
            this._runChildNode('pr_closer.cjs');

            console.log("\n>>> STAGE 6: LEDGER AUDIT <<<");
            this._runChildNode('ledger_inspector.cjs');

            console.log("\nMASTER REVOPS CYCLE COMPLETE: All systems synchronized.");
        } catch (error) {
            console.error("\n[REVOPS_FATAL] Master loop aborted due to child node failure:", error.message);
        }
    }

    _runChildNode(scriptBasename) {
        const fullPath = path.join(__dirname, scriptBasename);
        try {
            execSync(`node "${fullPath}"`, { stdio: 'inherit' });
        } catch (e) {
            throw new Error(`Child execution failed on ${scriptBasename}`);
        }
    }
}

module.exports = new RevOpsMaster();

if (require.main === module) {
    const master = new RevOpsMaster();
    master.executeFullLoop();
}
