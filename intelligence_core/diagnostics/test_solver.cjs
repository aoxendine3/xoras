const solver = require('./solver_node.cjs');
const db = require('better-sqlite3')(require('path').join(__dirname, '../../AETHER_KNOWLEDGE_BASE/aether_brain.sqlite'));

async function runSolverTest() {
    console.log('--- AETHER ANTIFRAGILE SOLVER TEST ---');
    
    const fakeErrorContext = "Orchestrator Boot Failure: Failed to bind port 8080";
    const fakeStackTrace = `Error: EADDRINUSE: address already in use :::8080
    at Server.setupListenHandle [as _listen2] (node:net:1463:16)
    at listenInCluster (node:net:1511:12)
    at Server.listen (node:net:1599:7)
    at Object.<anonymous> (/Users/ajoxendine68/Documents/GitHub/xoras-core/server.js:45:8)`;

    console.log('[TEST] Simulating catastrophic system crash...');
    
    // Fire the diagnostic solver
    const result = await solver.handleSystemTrauma(fakeErrorContext, fakeStackTrace);
    
    console.log(`\n[TEST] Solver Response Status: ${result.status}`);
    
    // Verify SQLite Cognitive Logging
    const logCheck = db.prepare('SELECT * FROM episodic_logs WHERE status = ? ORDER BY id DESC LIMIT 1').get('CRITICAL_FAILURE');
    
    if (logCheck && logCheck.query.includes('SYSTEM_CRASH')) {
        console.log('✅ SQLite Verification: Trauma successfully logged to episodic memory ledger.');
    } else {
        console.error('❌ SQLite Verification Failed: Trauma not found in ledger.');
    }

    if (result.status === 'AWAITING_HUMAN') {
        console.log('✅ Antifragile Fallback: System gracefully caught offline inference engine. NO BLIND REPOSITORY WIPE TRIGGERED.');
    }

    console.log('--- TEST COMPLETE ---');
}

runSolverTest();
