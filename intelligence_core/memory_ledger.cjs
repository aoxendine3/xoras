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
}

initializeSchema();

const insertLog = db.prepare('INSERT INTO episodic_logs (query, manifest, status) VALUES (?, ?, ?)');
const updateOutcome = db.prepare('UPDATE episodic_logs SET outcome = ? WHERE id = ?');
const getRecentLogs = db.prepare('SELECT * FROM episodic_logs ORDER BY timestamp DESC LIMIT ?');
const getAllByStatus = db.prepare('SELECT * FROM episodic_logs WHERE status = ? ORDER BY id DESC');

class MemoryLedger {
    constructor() {
        this.cache = new Map();
        this.itemIndex = new Map(); // Direct O(1) item memory reference lookup
        this.isHydrated = false;
        this.lastHydratedTimestamp = 0;
    }

    /**
     * First-Principles In-Memory State Hydration
     * Reconstructs active operational queues into high-speed V8 memory index.
     */
    async hydrateMemoryCache() {
        const startMs = performance.now();
        const statuses = ['STAGED', 'SUBMITTED', 'MERGED', 'CLOSED', 'CLOSED_WON'];
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
                SUBMITTED: (this.cache.get('SUBMITTED') || []).length,
                MERGED: (this.cache.get('MERGED') || []).length,
                CLOSED: (this.cache.get('CLOSED') || []).length,
                CLOSED_WON: (this.cache.get('CLOSED_WON') || []).length
            }
        };
    }

    /**
     * High-speed $O(1)$ memory lookup for staged leads.
     * Eliminates disk bottleneck during heavy ranking and dispatch sweeps.
     */
    async getStagedLeads() {
        if (!this.isHydrated || (Date.now() - this.lastHydratedTimestamp > 60000)) {
            await this.hydrateMemoryCache();
        }
        return this.cache.get('STAGED') || [];
    }

    /**
     * High-speed $O(1)$ memory lookup for active submissions.
     */
    async getSubmittedLeads() {
        if (!this.isHydrated || (Date.now() - this.lastHydratedTimestamp > 60000)) {
            await this.hydrateMemoryCache();
        }
        return this.cache.get('SUBMITTED') || [];
    }

    /**
     * Direct $O(1)$ memory lookup for a specific item by ID.
     */
    async getLeadById(id) {
        if (!this.isHydrated || !this.itemIndex.has(id)) {
            await this.hydrateMemoryCache();
        }
        return this.itemIndex.get(id) || null;
    }

    recordEpisode(query, manifest, status) {
        try {
            const result = insertLog.run(query, manifest, status);
            const newRecord = {
                id: result.lastInsertRowid,
                timestamp: new Date().toISOString(),
                query,
                manifest,
                status,
                outcome: 'PENDING'
            };

            // Instantly update V8 memory cache
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

            // O(1) in-memory update if item is cached
            if (this.isHydrated && this.itemIndex.has(logId)) {
                const item = this.itemIndex.get(logId);
                const oldStatus = item.status;
                item.outcome = outcome;
                if (newStatus && newStatus !== oldStatus) {
                    item.status = newStatus;
                    // Move between status arrays in memory
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

    retrieveRecentEpisodes(limit = 5) {
        return getRecentLogs.all(limit);
    }

    /**
     * Cache pruning and garbage collection safety valve.
     */
    purgeCache() {
        this.cache.clear();
        this.itemIndex.clear();
        this.isHydrated = false;
        this.lastHydratedTimestamp = 0;
        return { status: 'PURGED' };
    }
}

module.exports = new MemoryLedger();
