const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../AETHER_KNOWLEDGE_BASE/aether_brain.sqlite');

const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

function initializeSchema() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS episodic_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            query TEXT,
            manifest TEXT,
            status TEXT,
            outcome TEXT DEFAULT 'PENDING'
        );
        CREATE TABLE IF NOT EXISTS semantic_graph (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            entity_type TEXT,
            entity_value TEXT,
            relation TEXT,
            target_entity TEXT,
            confidence REAL
        );
        CREATE TABLE IF NOT EXISTS procedural_rules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            context_trigger TEXT,
            rule_directive TEXT,
            success_weight INTEGER DEFAULT 0
        );
    `);
    try {
        db.exec("ALTER TABLE episodic_logs ADD COLUMN execution_mode TEXT DEFAULT 'SIMULATED'");
    } catch (e) {
        // Column already exists
    }
}

initializeSchema();

const insertLog = db.prepare('INSERT INTO episodic_logs (query, manifest, status, execution_mode) VALUES (?, ?, ?, ?)');
const updateOutcome = db.prepare('UPDATE episodic_logs SET outcome = ? WHERE id = ?');
const updateMode = db.prepare('UPDATE episodic_logs SET execution_mode = ? WHERE id = ?');
const getRecentLogs = db.prepare('SELECT * FROM episodic_logs ORDER BY timestamp DESC LIMIT ?');
const getAllByStatus = db.prepare('SELECT * FROM episodic_logs WHERE status = ? ORDER BY id DESC');
const getAllRecords = db.prepare('SELECT * FROM episodic_logs ORDER BY id DESC');

class MemoryLedger {
    constructor() {
        this.cache = new Map();
        this.itemIndex = new Map();
        this.isHydrated = false;
        this.lastHydratedTimestamp = 0;
    }

    async hydrateMemoryCache() {
        const startMs = performance.now();
        const statuses = ['STAGED', 'QUALIFIED', 'SUBMITTED', 'MERGED', 'CLOSED', 'CLOSED_WON', 'WAITING_FOR_APPROVAL'];
        let totalRecords = 0;

        this.cache.clear();
        this.itemIndex.clear();
        statuses.forEach(status => {
            const rows = getAllByStatus.all(status);
            this.cache.set(status, rows);
            rows.forEach(row => {
                this.itemIndex.set(row.id, row);
            });
            totalRecords += rows.length;
        });

        this.isHydrated = true;
        this.lastHydratedTimestamp = Date.now();
        const durationMs = (performance.now() - startMs).toFixed(3);

        return {
            status: 'HYDRATED',
            recordsHydrated: totalRecords,
            durationMs,
            timestamp: new Date(this.lastHydratedTimestamp).toISOString(),
            distribution: {
                STAGED: (this.cache.get('STAGED') || []).length,
                QUALIFIED: (this.cache.get('QUALIFIED') || []).length,
                SUBMITTED: (this.cache.get('SUBMITTED') || []).length,
                MERGED: (this.cache.get('MERGED') || []).length,
                CLOSED_WON: (this.cache.get('CLOSED_WON') || []).length,
                WAITING_FOR_APPROVAL: (this.cache.get('WAITING_FOR_APPROVAL') || []).length
            }
        };
    }

    async getStagedLeads() {
        if (!this.isHydrated || (Date.now() - this.lastHydratedTimestamp > 60000)) {
            await this.hydrateMemoryCache();
        }
        const staged = this.cache.get('STAGED') || [];
        const qualified = this.cache.get('QUALIFIED') || [];
        return [...staged, ...qualified];
    }

    async getSubmittedLeads() {
        if (!this.isHydrated || (Date.now() - this.lastHydratedTimestamp > 60000)) {
            await this.hydrateMemoryCache();
        }
        return this.cache.get('SUBMITTED') || [];
    }

    async getMergedLeads() {
        if (!this.isHydrated || (Date.now() - this.lastHydratedTimestamp > 60000)) {
            await this.hydrateMemoryCache();
        }
        return this.cache.get('MERGED') || [];
    }

    async getLeadById(id) {
        if (!this.isHydrated || !this.itemIndex.has(id)) {
            await this.hydrateMemoryCache();
        }
        return this.itemIndex.get(id) || null;
    }

    async getLeadByQuery(queryStr) {
        if (!this.isHydrated) {
            await this.hydrateMemoryCache();
        }
        for (const [id, item] of this.itemIndex) {
            if (item.query === queryStr) return item;
        }
        const checkStmt = db.prepare('SELECT * FROM episodic_logs WHERE query = ?');
        const existing = checkStmt.get(queryStr);
        if (existing && this.isHydrated) {
            this.itemIndex.set(existing.id, existing);
            if (!this.cache.has(existing.status)) this.cache.set(existing.status, []);
            this.cache.get(existing.status).push(existing);
        }
        return existing || null;
    }

    async getStatsSummary() {
        if (!this.isHydrated || (Date.now() - this.lastHydratedTimestamp > 60000)) {
            await this.hydrateMemoryCache();
        }
        return {
            STAGED: (this.cache.get('STAGED') || []).length + (this.cache.get('QUALIFIED') || []).length,
            SUBMITTED: (this.cache.get('SUBMITTED') || []).length,
            MERGED: (this.cache.get('MERGED') || []).length,
            CLOSED_WON: (this.cache.get('CLOSED_WON') || []).length,
            WAITING_FOR_APPROVAL: (this.cache.get('WAITING_FOR_APPROVAL') || []).length
        };
    }

    async getAllActiveThreads() {
        if (!this.isHydrated || (Date.now() - this.lastHydratedTimestamp > 60000)) {
            await this.hydrateMemoryCache();
        }
        const staged = this.cache.get('STAGED') || [];
        const qualified = this.cache.get('QUALIFIED') || [];
        const submitted = this.cache.get('SUBMITTED') || [];
        const merged = this.cache.get('MERGED') || [];
        const won = this.cache.get('CLOSED_WON') || [];
        const waiting = this.cache.get('WAITING_FOR_APPROVAL') || [];
        return [...won, ...merged, ...submitted, ...staged, ...qualified, ...waiting];
    }

    recordEpisode(query, manifest, status, mode = 'SIMULATED') {
        try {
            const result = insertLog.run(query, manifest, status, mode);
            const newRecord = {
                id: result.lastInsertRowid,
                timestamp: new Date().toISOString(),
                query,
                manifest,
                status,
                outcome: 'PENDING',
                execution_mode: mode
            };

            if (this.isHydrated) {
                if (this.cache.has(status)) {
                    this.cache.get(status).unshift(newRecord);
                } else {
                    this.cache.set(status, [newRecord]);
                }
                this.itemIndex.set(newRecord.id, newRecord);
            }

            return { status: 'LOGGED', id: result.lastInsertRowid };
        } catch (e) {
            return { status: 'FAILED', reason: e.message };
        }
    }

    tagOutcome(logId, outcome, newStatus = null) {
        try {
            updateOutcome.run(outcome, logId);
            if (newStatus) {
                db.prepare('UPDATE episodic_logs SET status = ? WHERE id = ?').run(newStatus, logId);
            }

            if (this.isHydrated && this.itemIndex.has(logId)) {
                const item = this.itemIndex.get(logId);
                const oldStatus = item.status;
                item.outcome = outcome;
                if (newStatus && newStatus !== oldStatus) {
                    item.status = newStatus;
                    if (this.cache.has(oldStatus)) {
                        const arr = this.cache.get(oldStatus);
                        const idx = arr.findIndex(x => x.id === logId);
                        if (idx !== -1) arr.splice(idx, 1);
                    }
                    if (!this.cache.has(newStatus)) {
                        this.cache.set(newStatus, []);
                    }
                    this.cache.get(newStatus).unshift(item);
                }
            } else {
                this.hydrateMemoryCache();
            }

            return { status: 'UPDATED' };
        } catch (e) {
            return { status: 'FAILED', reason: e.message };
        }
    }

    tagExecutionMode(logId, mode = 'REAL') {
        try {
            updateMode.run(mode, logId);
            if (this.isHydrated && this.itemIndex.has(logId)) {
                this.itemIndex.get(logId).execution_mode = mode;
            }
            return { status: 'MODE_UPDATED' };
        } catch (e) {
            return { status: 'FAILED', reason: e.message };
        }
    }

    retrieveRecentEpisodes(limit = 5) {
        return getRecentLogs.all(limit);
    }

    purgeCache() {
        this.cache.clear();
        this.itemIndex.clear();
        this.isHydrated = false;
        this.lastHydratedTimestamp = 0;
        return { status: 'PURGED' };
    }

    purgeSimulatedData() {
        try {
            const countStmt = db.prepare("SELECT count(*) as c FROM episodic_logs WHERE execution_mode = 'SIMULATED'");
            const count = countStmt.get().c;
            db.exec("DELETE FROM episodic_logs WHERE execution_mode = 'SIMULATED'");
            this.purgeCache();
            return { status: 'SIMULATED_PURGED', purgedCount: count };
        } catch (e) {
            return { status: 'FAILED', reason: e.message };
        }
    }

    releaseHoldingQueue() {
        try {
            const countStmt = db.prepare("SELECT count(*) as c FROM episodic_logs WHERE status = 'WAITING_FOR_APPROVAL'");
            const count = countStmt.get().c;
            db.prepare("UPDATE episodic_logs SET status = 'STAGED', outcome = 'PENDING' WHERE status = 'WAITING_FOR_APPROVAL'").run();
            this.purgeCache();
            return { status: 'QUEUE_RELEASED', releasedCount: count };
        } catch (e) {
            return { status: 'FAILED', reason: e.message };
        }
    }
}

module.exports = new MemoryLedger();
