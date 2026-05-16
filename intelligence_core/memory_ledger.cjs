const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../AETHER_KNOWLEDGE_BASE/aether_brain.sqlite');

// Ensure knowledge base directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize the Sovereign Cognitive Graph Database
const db = new Database(dbPath);

// Enforce high-performance PRAGMAs (WAL mode for zero-latency concurrent writes)
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

function initializeSchema() {
    db.exec(`
        -- Episodic Memory: The Lifelog of Actions and Outcomes
        CREATE TABLE IF NOT EXISTS episodic_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            query TEXT,
            manifest TEXT,
            status TEXT,
            outcome TEXT DEFAULT 'PENDING'
        );

        -- Semantic Memory: The Spreading Activation Knowledge Graph
        CREATE TABLE IF NOT EXISTS semantic_graph (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            entity_type TEXT,
            entity_value TEXT,
            relation TEXT,
            target_entity TEXT,
            confidence REAL
        );

        -- Procedural Memory: Autonomously generated workflows and rules
        CREATE TABLE IF NOT EXISTS procedural_rules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            context_trigger TEXT,
            rule_directive TEXT,
            success_weight INTEGER DEFAULT 0
        );
    `);
}

initializeSchema();

// Pre-compiled statements for microsecond execution times
const insertLog = db.prepare('INSERT INTO episodic_logs (query, manifest, status) VALUES (?, ?, ?)');
const updateOutcome = db.prepare('UPDATE episodic_logs SET outcome = ? WHERE id = ?');
const getRecentLogs = db.prepare('SELECT * FROM episodic_logs ORDER BY timestamp DESC LIMIT ?');

class MemoryLedger {
    /**
     * Write: Record an action to the Episodic Lifelog
     */
    recordEpisode(query, manifest, status) {
        try {
            const result = insertLog.run(query, manifest, status);
            console.log(`[MEMORY] Episodic event recorded (ID: ${result.lastInsertRowid})`);
            return { status: 'LOGGED', id: result.lastInsertRowid };
        } catch (e) {
            console.error(`[MEMORY_FATAL] Failed to record episode: ${e.message}`);
            return { status: 'FAILED' };
        }
    }

    /**
     * Manage: Tag the outcome of a past episode for continuous learning
     */
    tagOutcome(logId, outcome) {
        try {
            updateOutcome.run(outcome, logId);
            console.log(`[MEMORY] Episode ${logId} outcome updated to: ${outcome}`);
            return { status: 'UPDATED' };
        } catch (e) {
            console.error(`[MEMORY_FATAL] Failed to update outcome: ${e.message}`);
            return { status: 'FAILED' };
        }
    }

    /**
     * Read: Retrieve recent context to inform the Orchestrator's next move
     */
    retrieveRecentEpisodes(limit = 5) {
        return getRecentLogs.all(limit);
    }
}

module.exports = new MemoryLedger();
