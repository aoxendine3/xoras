const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DROP_ZONE = '/Users/ajoxendine68/Desktop/XORAS_INGESTION_ZONE';
const AUDITOR_PATH = '/Users/ajoxendine68/.gemini/antigravity/brain/133a6559-0e13-4f0f-8fbd-ea3dbe546091/scratch/design_audit_engine.cjs';
const LEDGER_PATH = '/Users/ajoxendine68/Documents/GitHub/SYSTEM_CONTROL_CORE/RESILIENCE_LEDGER.json';

if (!fs.existsSync(DROP_ZONE)) fs.mkdirSync(DROP_ZONE);

console.log(`[XORAS_INGESTION] GATEWAY ACTIVE. Monitoring: ${DROP_ZONE}`);

fs.watch(DROP_ZONE, (eventType, filename) => {
    if (filename && eventType === 'rename') {
        const filePath = path.join(DROP_ZONE, filename);
        
        if (fs.existsSync(filePath)) {
            console.log(`[XORAS_INGESTION] NEW ASSET DETECTED: ${filename}`);
            
            try {
                // Execute Design-Audit
                const result = execSync(`node ${AUDITOR_PATH} ${filePath}`);
                console.log(`[XORAS_INGESTION] AUDIT_COMPLETE for ${filename}:`);
                console.log(result.toString());

                // Update Ledger (Institutional Succession)
                const ledger = JSON.parse(fs.readFileSync(LEDGER_PATH, 'utf8'));
                ledger.assets = ledger.assets || [];
                ledger.assets.push({
                    name: filename,
                    timestamp: new Date().toISOString(),
                    status: 'HARDENED',
                    integrity: '100/1'
                });
                fs.writeFileSync(LEDGER_PATH, JSON.stringify(ledger, null, 2));
                
                console.log(`[XORAS_INGESTION] ${filename} SUCCESSFULLY ARCHIVED.`);
            } catch (e) {
                console.error(`[XORAS_INGESTION] AUDIT_FAILURE for ${filename}: ${e.message}`);
            }
        }
    }
});
