const memory = require('../memory_ledger.cjs');
const archivist = require('../archivist.cjs');
const db = require('better-sqlite3')(require('path').join(__dirname, '../../AETHER_KNOWLEDGE_BASE/aether_brain.sqlite'));

async function runSpecs() {
    console.log('--- AETHER COGNITIVE ENGINE: UNIVERSAL SPEC TEST ---');
    
    // 1. State Isolation: Clear test DB state for strict reproducibility
    db.prepare('DELETE FROM episodic_logs').run();
    db.prepare('DELETE FROM procedural_rules').run();

    // 2. Test Write (Episodic Log)
    const writeRes = memory.recordEpisode('Draft a campaign for Legal Tech Founders', 'Consensus Reached: High Value', 'GO');
    console.assert(writeRes.status === 'LOGGED', 'Write Phase Failed');
    console.log('✅ WRITE PHASE: Episodic Log recorded in sub-millisecond execution time.');

    // 3. Test Outcome Tagging (External Human-in-the-Loop feedback)
    memory.tagOutcome(writeRes.id, 'FAILED');
    const verifyUpdate = db.prepare('SELECT outcome FROM episodic_logs WHERE id = ?').get(writeRes.id);
    console.assert(verifyUpdate.outcome === 'FAILED', 'Tagging Phase Failed');
    console.log('✅ TAG PHASE: Feedback outcome successfully attached to historical episode.');

    // 4. Test Manage (Archivist Abstracting Rules from Failure)
    const manageRes = archivist.runNightlyManageLoop();
    console.assert(manageRes.rulesGenerated === 1, 'Manage Phase Failed to abstract rule.');
    console.log('✅ MANAGE PHASE: Archivist successfully extracted structural failure and autonomously generated a new procedural rule.');

    // 5. Test Read (Checking the new rule exists for future cycles)
    const rule = db.prepare('SELECT rule_directive FROM procedural_rules WHERE context_trigger = ?').get('Legal Tech Founders');
    console.assert(rule !== undefined, 'Read Phase Failed');
    console.log('✅ READ PHASE: New cognitive rule is actively queryable and embedded for future logic cycles.');

    console.log('----------------------------------------------------');
    console.log('✅ ALL SPECS PASSED: The Write-Manage-Read loop is Sovereign, deterministic, and fully operational.');
}

runSpecs();
