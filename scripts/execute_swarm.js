#!/usr/bin/env node
const swarm = require('../intelligence_core/swarm_matrix.js');

const objective = process.argv.slice(2).join(' ') || "Verify institutional security posture and deploy sovereign MT4 Ingress matrix.";

async function main() {
    try {
        const finality = await swarm.runSwarmCycle(objective);
        console.log("\n[EXECUTIVE SUMMARY]:\n" + finality.agents.grant);
    } catch (e) {
        console.error("\n❌ [SWARM EXECUTION HALTED]: " + e.message);
        process.exit(1);
    }
}

main();
