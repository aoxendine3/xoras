/**
 * AETHER OS: Autonomy Pulse (The Circadian Heartbeat)
 * Purpose: Transforms the system from a manual script into a living, autonomous daemon.
 */
const archivist = require('./archivist.cjs');
const backupSentry = require('./diagnostics/tri_backup_sentry.cjs');

class AutonomyPulse {
    start() {
        console.log('[PULSE] Aether Autonomy Heartbeat Initialized. System is now fully autonomous.');

        // 1. The Deep Sleep: Archivist Management Loop (Runs every 12 hours)
        // Consolidates memories and learns from failures.
        setInterval(() => {
            console.log('[PULSE] Executing Circadian Cognitive Management Loop...');
            archivist.runNightlyManageLoop();
        }, 12 * 60 * 60 * 1000);

        // 2. The Secure Vault: Tri-Backup (Runs every 24 hours)
        // Encrypts the memory database and prepares it for Layer 3 Cloud Storage.
        setInterval(() => {
            console.log('[PULSE] Executing Sovereign Backup Protocol...');
            backupSentry.executeSecureBackup();
        }, 24 * 60 * 60 * 1000);
    }
}

// If run directly, start the pulse
if (require.main === module) {
    const daemon = new AutonomyPulse();
    daemon.start();
}

module.exports = new AutonomyPulse();
