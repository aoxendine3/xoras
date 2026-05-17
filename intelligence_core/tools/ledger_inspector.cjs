const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../../AETHER_KNOWLEDGE_BASE/aether_brain.sqlite');

function inspectLedger() {
    if (!fs.existsSync(DB_PATH)) {
        console.error('ERROR: SQLite database unlocatable at ' + DB_PATH);
        process.exit(1);
    }

    const db = require('better-sqlite3')(DB_PATH);
    console.log('\n================================================================');
    console.log('       XORAS INSTITUTIONAL LEDGER INSPECTOR (WEBHOOKS WAL)      ');
    console.log('================================================================');

    try {
        const records = db.prepare('SELECT event_id, platform, event_type, audit_status, sanitized_summary, timestamp FROM platform_webhooks_ledger ORDER BY timestamp DESC LIMIT 10').all();
        console.table(records);
    } catch (e) {
        console.error('ERROR: Database inspection fault - ' + e.message);
    } finally {
        db.close();
    }
}

inspectLedger();
