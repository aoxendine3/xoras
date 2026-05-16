const { execSync } = require('child_process');
const path = require('path');

class RevOpsMaster {
    async executeFullLoop(isReal = false) {
        console.log("=========================================================================");
        console.log("🚀 XORAS AUTONOMOUS REVOPS MASTER LOOP // SOVEREIGN ORCHESTRATION");
        console.log(`   Mode: ${isReal ? 'AGGRESSIVE REAL-FIRE (Live Rest API)' : 'PARALLEL SIMULATED LEDGER TRIAGE'}`);
        console.log("=========================================================================\n");

        try {
            console.log(">>> STAGE 1: PR SNIPER <<<");
            this._runChildNode('pr_sniper.cjs');

            console.log("\n>>> STAGE 2: TRIAGE ENGINE <<<");
            this._runChildNode('queue_prioritizer.cjs');

            console.log("\n>>> STAGE 3: PR DISPATCHER <<<");
            const dispatchFlag = isReal ? '--real' : '';
            this._runChildNode(`pr_dispatcher.cjs ${dispatchFlag}`);

            console.log("\n>>> STAGE 4: SURVEILLANCE MONITOR <<<");
            this._runChildNode('pr_monitor.cjs');

            console.log("\n>>> STAGE 5: POST-MERGE CLOSER <<<");
            this._runChildNode('pr_closer.cjs');

            console.log("\n>>> STAGE 6: LEDGER AUDIT <<<");
            this._runChildNode('ledger_inspector.cjs');

            console.log("\nMASTER REVOPS CYCLE COMPLETE: All systems synchronized.");
        } catch (error) {
            console.error("\n[REVOPS_FATAL] Master loop aborted due to child node failure:", error.message);
            process.exit(1);
        }
    }

    _runChildNode(scriptArgs) {
        const parts = scriptArgs.split(' ');
        const basename = parts[0];
        const flags = parts.slice(1).join(' ');
        const fullPath = path.join(__dirname, basename);
        try {
            execSync(`node "${fullPath}" ${flags}`, { stdio: 'inherit' });
        } catch (e) {
            throw new Error(`Child execution failed on ${basename}`);
        }
    }
}

module.exports = new RevOpsMaster();

if (require.main === module) {
    const args = process.argv.slice(2);
    const isReal = args.includes('--real');
    const master = new RevOpsMaster();
    master.executeFullLoop(isReal);
}
