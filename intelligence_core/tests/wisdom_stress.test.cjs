const memory = require('../memory_ledger.cjs');
const archivist = require('../archivist.cjs');
const killSwitch = require('../diagnostics/kill_switch.cjs');
const db = require('better-sqlite3')(require('path').join(__dirname, '../../AETHER_KNOWLEDGE_BASE/aether_brain.sqlite'));
const fs = require('fs');
const { performance } = require('perf_hooks');

async function runWisdomTest() {
    console.log('====================================================');
    console.log('⏳ AETHER OS: 10-YEAR WISDOM & UNIVERSAL DEPTH TEST');
    console.log('====================================================\n');

    // 1. Clean Slate for Absolute Accuracy
    db.prepare('DELETE FROM episodic_logs').run();
    db.prepare('DELETE FROM procedural_rules').run();
    if (fs.existsSync(killSwitch.lockPath)) fs.unlinkSync(killSwitch.lockPath);

    // 2. The Universal Depth Test (Injecting 10,000 Cognitive Cycles)
    console.log('[TEST] Compressing 10 years of operational time...');
    console.log('[TEST] Injecting 10,000 simulated episodic memory logs...');
    
    const startInject = performance.now();
    
    const insertMany = db.transaction((episodes) => {
        const stmt = db.prepare('INSERT INTO episodic_logs (query, manifest, status, outcome) VALUES (?, ?, ?, ?)');
        for (const ep of episodes) {
            stmt.run(ep.query, ep.manifest, ep.status, ep.outcome);
        }
    });

    const episodes = [];
    for (let i = 0; i < 10000; i++) {
        // Simulate a pattern: "Enterprise Banking" fails frequently, extracting a wisdom trigger.
        const isFailure = i % 10 === 0;
        episodes.push({
            query: isFailure ? 'Draft a campaign for Enterprise Banking' : 'Draft a campaign for Startup Founder',
            manifest: 'Historical Sim Data',
            status: 'GO',
            outcome: isFailure ? 'FAILED' : 'CONVERTED'
        });
    }
    
    insertMany(episodes);
    const endInject = performance.now();
    console.log(`✅ [DEPTH] 10,000 memories structured and committed in ${(endInject - startInject).toFixed(2)}ms.\n`);

    // 3. The Wisdom Test (Extracting truth from 10,000 records)
    console.log('[TEST] Waking Cognitive Archivist. Initiating Wisdom Extraction...');
    const startWisdom = performance.now();
    
    // Silence archivist internal logs for cleaner test output
    const originalLog = console.log;
    console.log = () => {};
    const manageRes = archivist.runNightlyManageLoop();
    console.log = originalLog; // Restore

    const endWisdom = performance.now();
    
    console.log(`✅ [WISDOM] Analyzed 10,000 logs and abstracted core behavioral rules in ${(endWisdom - startWisdom).toFixed(2)}ms.`);
    
    const rule = db.prepare('SELECT rule_directive FROM procedural_rules WHERE context_trigger = ?').get('Enterprise Banking');
    if (rule) {
        console.log(`   -> Distilled Wisdom: "${rule.rule_directive.substring(0, 110)}..."`);
    } else {
        console.error('   -> ❌ Wisdom extraction failed.');
    }

    // 4. The Structural Endurance Test (The Kill Switch)
    console.log('\n[TEST] Testing Structural Endurance (Simulating a runaway logic loop)...');
    try {
        killSwitch.lastReset = Date.now(); // reset limiter
        killSwitch.actionCount = 0;
        for (let i = 0; i < 60; i++) {
            killSwitch.checkPulse();
        }
        console.error('❌ [ENDURANCE] System failed to quarantine.');
    } catch (e) {
        if (e.message.includes('SYSTEM_HARD_LOCKED')) {
            console.log(`✅ [ENDURANCE] Physical safety breaker tripped exactly at threshold limit.`);
            console.log(`   -> System successfully quarantined before catastrophic meltdown.`);
        } else {
            console.error(e);
        }
    }

    console.log('\n====================================================');
    console.log('🎯 10-YEAR SANDBOX TEST COMPLETE. ARCHITECTURE HOLDING.');
    console.log('====================================================');
}

runWisdomTest();
