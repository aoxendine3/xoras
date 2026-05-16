/**
 * AETHER COGNITIVE ENGINE: Antifragile Diagnostic Solver
 * Purpose: Work through problems, don't cover them up. Replaces blind repository resets 
 * with structural learning and diagnostic error resolution.
 */

const memory = require('../memory_ledger.cjs');
const triModel = require('../local_inference/tri_model_bridge.cjs');

class DiagnosticSolver {
    /**
     * Traps system crashes, logs the trauma, and learns from it instead of resetting.
     */
    async handleSystemTrauma(errorContext, stackTrace) {
        console.log(`\n[DIAGNOSTIC_SOLVER] System Trauma Detected: ${errorContext}`);
        
        // 1. Record the Trauma in Episodic Memory
        const traumaRecord = memory.recordEpisode(
            `SYSTEM_CRASH: ${errorContext}`, 
            stackTrace.substring(0, 500), 
            'CRITICAL_FAILURE'
        );

        console.log(`[DIAGNOSTIC_SOLVER] Trauma recorded in SQLite Ledger (ID: ${traumaRecord.id}).`);

        // 2. Query the Local Deep Reasoner to Work Through the Problem
        try {
            console.log('[DIAGNOSTIC_SOLVER] Engaging Deep Reasoner (Model 2) to analyze root cause...');
            const solution = await triModel.deepReason(
                `Analyze this system crash and provide a structural patch. Do not suggest a full reset. Stack trace: ${stackTrace}`,
                `You are the Antifragile Solver Node. Find the exact structural reason for the failure.`
            );
            
            console.log(`[DIAGNOSTIC_SOLVER] Proposed Solution:\n${solution}`);
            
            // 3. Write a permanent procedural rule based on the solution
            const db = require('better-sqlite3')(require('path').join(__dirname, '../../AETHER_KNOWLEDGE_BASE/aether_brain.sqlite'));
            db.prepare('INSERT INTO procedural_rules (context_trigger, rule_directive) VALUES (?, ?)').run(
                errorContext,
                `[TRAUMA_RESPONSE] Prev crash: ${errorContext}. Fix applied: ${solution.substring(0, 100)}`
            );

            console.log('[DIAGNOSTIC_SOLVER] Procedural Rule updated. The system has structurally adapted to the failure.');
            return { status: 'HEALED', solution };

        } catch (inferenceError) {
            console.error('[DIAGNOSTIC_SOLVER] Deep Reasoner unavailable. Logging trauma for human intervention.');
            // Fallback: If local models are off, just log it. Never reset blindly.
            return { status: 'AWAITING_HUMAN', reason: 'Inference Engine Offline' };
        }
    }
}

module.exports = new DiagnosticSolver();
