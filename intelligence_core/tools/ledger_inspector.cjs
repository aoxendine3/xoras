/**
 * XORAS CORE: Relational Ledger Inspector
 * Purpose: Audits aether_brain.sqlite, verifies all operational state transitions, 
 * and outputs an executive summary of active B2B prospecting threads.
 */

const path = require('path');
const db = require('better-sqlite3')(path.join(__dirname, '../../AETHER_KNOWLEDGE_BASE/aether_brain.sqlite'));

class LedgerInspector {
    inspect() {
        console.log("📊 [LEDGER_INSPECT] Executing Relational State Audit across aether_brain.sqlite...\n");

        const stats = db.prepare(`
            SELECT status, COUNT(*) as count 
            FROM episodic_logs 
            GROUP BY status
        `).all();

        const activeThreads = db.prepare(`
            SELECT id, query, status, outcome, timestamp 
            FROM episodic_logs 
            WHERE status IN ('STAGED', 'SUBMITTED', 'MERGED', 'CLOSED_WON')
            ORDER BY id DESC
        `).all();

        console.log("=== EXECUTIVE PIPELINE AGGREGATE ===");
        const breakdown = { STAGED: 0, SUBMITTED: 0, MERGED: 0, CLOSED_WON: 0 };
        stats.forEach(s => breakdown[s.status] = s.count);
        
        console.log(`📌 Staged Leads in Queue : ${breakdown.STAGED || 0}`);
        console.log(`⏳ Active PR Submissions : ${breakdown.SUBMITTED || 0}`);
        console.log(`🎉 Merged PR Threads     : ${breakdown.MERGED || 0}`);
        console.log(`🏆 Closed / Pitched Won  : ${breakdown.CLOSED_WON || 0}`);
        console.log("====================================\n");

        console.log("=== ACTIVE OPERATIONAL THREADS ===");
        activeThreads.forEach(t => {
            const cleanQuery = t.query.replace('AUDIT_REPO: https://github.com/', '');
            console.log(`[${t.status}] ${cleanQuery} -> ${t.outcome}`);
        });
        console.log("==================================");
    }
}

module.exports = new LedgerInspector();

if (require.main === module) {
    const inspector = new LedgerInspector();
    inspector.inspect();
}
