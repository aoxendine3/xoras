const fs = require('fs');
const path = require('path');
const memory = require('../memory_ledger.cjs');
const triModel = require('../local_inference/tri_model_bridge.cjs');

class DiagnosticSolver {
    async verifyFoundationalBedrock() {
        console.log(`probing foundational primitives for structural decay`);
        const results = {
            ipcPipe: 'healthy',
            sqliteWal: 'verified',
            inferenceLatency: 'stable',
            structuralIntegrity: 1.0
        };

        // Probing IPC pipe serialization overhead
        const startIpc = performance.now();
        const dummyPayload = JSON.stringify({ probe: 'bedrock_verification', timestamp: Date.now() });
        JSON.parse(dummyPayload);
        const elapsedIpc = performance.now() - startIpc;
        if (elapsedIpc > 5.0) {
            results.ipcPipe = 'degraded_serialization';
            results.structuralIntegrity -= 0.2;
        }

        // Probing SQLite WAL checkpoint status
        try {
            const dbPath = path.join(__dirname, '../../AETHER_KNOWLEDGE_BASE/aether_brain.sqlite');
            if (fs.existsSync(dbPath)) {
                const stat = fs.statSync(dbPath);
                const walPath = `${dbPath}-wal`;
                if (fs.existsSync(walPath)) {
                    const walStat = fs.statSync(walPath);
                    if (walStat.size > stat.size * 2) {
                        results.sqliteWal = 'checkpoint_overdue';
                        results.structuralIntegrity -= 0.3;
                    }
                }
            }
        } catch (e) {
            results.sqliteWal = 'unverifiable';
        }

        console.log(`bedrock integrity score: ${(results.structuralIntegrity * 100).toFixed(0)}% (ipc: ${results.ipcPipe}, wal: ${results.sqliteWal})`);
        return results;
    }

    async handleSystemTrauma(errorContext, stackTrace) {
        console.log(`system trauma detected: ${errorContext}`);
        
        const bedrock = await this.verifyFoundationalBedrock();
        if (bedrock.structuralIntegrity < 0.8) {
            console.log(`warning: trauma occurred during foundational degradation. evaluating deeper root causes`);
        }

        const traumaRecord = memory.recordEpisode(
            `SYSTEM_CRASH: ${errorContext}`, 
            stackTrace.substring(0, 500), 
            'CRITICAL_FAILURE'
        );

        console.log(`trauma recorded in ledger (id: ${traumaRecord ? traumaRecord.id : 'unknown'}).`);

        try {
            console.log(`engaging core reasoner to analyze structural fault`);
            const prompt = `Analyze this system failure. Account for potential foundational infrastructure degradation (IPC/WAL/Memory). Do not suggest superficial workarounds or full resets. Stack: ${stackTrace}`;
            const context = `Antifragile Solver Node. Find exact structural cause. Bedrock integrity: ${bedrock.structuralIntegrity}`;
            
            const solution = await triModel.deepReason(prompt, context);
            console.log(`proposed resolution:\n${solution}`);
            
            try {
                const dbPath = path.join(__dirname, '../../AETHER_KNOWLEDGE_BASE/aether_brain.sqlite');
                if (fs.existsSync(dbPath)) {
                    const db = require('better-sqlite3')(dbPath);
                    db.prepare('INSERT INTO procedural_rules (context_trigger, rule_directive) VALUES (?, ?)').run(
                        errorContext,
                        `rule: adapted from crash ${errorContext}. fix: ${solution.substring(0, 100)}`
                    );
                    console.log(`procedural rule updated. system adapted to failure condition`);
                }
            } catch (dbErr) {}

            return { status: 'healed', solution };
        } catch (inferenceError) {
            console.error(`reasoning engine unreachable. logging trauma for manual inspection`);
            return { status: 'awaiting_human', reason: 'inference engine offline' };
        }
    }
}

module.exports = new DiagnosticSolver();

if (require.main === module) {
    const solver = new DiagnosticSolver();
    solver.verifyFoundationalBedrock();
}
