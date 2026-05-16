const { execSync } = require('child_process');
const path = require('path');

class RevOpsMaster {
    async executeFullLoop(isReal = false) {
        console.log(`[revops] init master loop (mode: ${isReal ? 'real' : 'simulated'})`);

        try {
            console.log("[revops] stage 1/6: pr_sniper");
            this._runChildNode('pr_sniper.cjs');

            console.log("[revops] stage 2/6: queue_prioritizer");
            this._runChildNode('queue_prioritizer.cjs');

            console.log("[revops] stage 3/6: pr_dispatcher");
            const dispatchFlag = isReal ? '--real' : '';
            this._runChildNode(`pr_dispatcher.cjs ${dispatchFlag}`);

            console.log("[revops] stage 4/6: pr_monitor");
            this._runChildNode('pr_monitor.cjs');

            console.log("[revops] stage 5/6: pr_closer");
            this._runChildNode('pr_closer.cjs');

            console.log("[revops] stage 6/6: ledger_inspector");
            this._runChildNode('ledger_inspector.cjs');

            console.log("[revops] master loop complete: exit 0");
        } catch (error) {
            console.error(`[revops] fatal error: ${error.message}`);
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
            throw new Error(`child execution failed (${basename})`);
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
