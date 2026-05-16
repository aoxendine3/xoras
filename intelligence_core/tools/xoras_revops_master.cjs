/**
 * XORAS CORE: Master RevOps Orchestration Loop
 * Purpose: Consolidates the entire 5-stage B2B enterprise prospecting pipeline 
 * (Snipe -> Triage -> Monitor -> Close -> Inspect) into a single autonomous command.
 */

const { execSync } = require('child_process');
const path = require('path');

class RevOpsMaster {
    async executeFullLoop() {
        console.log("==================================================================");
        console.log("🔥 XORAS REVOPS ENGINE: INITIATING FULL AUTONOMOUS MASTER LOOP 🔥");
        console.log("==================================================================\n");

        try {
            // Stage 1: The Sniper (Hunt for active Next.js/Node build bugs)
            console.log(">>> STAGE 1: EXECUTE AUTONOMOUS PR SNIPER <<<");
            this._runChildNode('pr_sniper.cjs');

            // Stage 2: Triage Engine (Semantic scoring into Tiers 1, 2, 3)
            console.log("\n>>> STAGE 2: EXECUTE SEMANTIC TRIAGE ENGINE <<<");
            this._runChildNode('queue_prioritizer.cjs');

            // Stage 3: Autonomous PR Dispatcher (Parallel AST Patch Generation)
            console.log("\n>>> STAGE 3: EXECUTE AUTONOMOUS PR DISPATCHER <<<");
            this._runChildNode('pr_dispatcher.cjs');

            // Stage 4: Surveillance Daemon (Poll GitHub REST API for submitted PR status)
            console.log("\n>>> STAGE 4: EXECUTE SURVEILLANCE MONITOR <<<");
            this._runChildNode('pr_monitor.cjs');

            // Stage 5: Post-Merge Closer (Instantly post closing enterprise pitch to merged PRs)
            console.log("\n>>> STAGE 5: EXECUTE POST-MERGE CLOSER <<<");
            this._runChildNode('pr_closer.cjs');

            // Stage 6: Executive Dashboard Summary
            console.log("\n>>> STAGE 6: EXECUTIVE LEDGER AUDIT <<<");
            this._runChildNode('ledger_inspector.cjs');

            console.log("\n==================================================================");
            console.log("✅ MASTER REVOPS CYCLE COMPLETE: All systems synchronized and secured.");
            console.log("==================================================================");
        } catch (error) {
            console.error("\n❌ [REVOPS_FATAL] Master loop aborted due to child node failure:", error.message);
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
