const fs = require('fs');
const path = require('path');

class KillSwitch {
    constructor() {
        this.lockPath = path.join(__dirname, '../../AETHER_KNOWLEDGE_BASE/.SYSTEM_LOCK');
        this.throttleLimit = 50; // Maximum safe operations per minute
        this.actionCount = 0;
        this.lastReset = Date.now();
    }

    /**
     * Checks the vital pulse before any operation. Throws if system is locked.
     */
    checkPulse() {
        // 1. Check for physical quarantine lock
        if (fs.existsSync(this.lockPath)) {
            const reason = fs.readFileSync(this.lockPath, 'utf8');
            throw new Error(`\n[KILL_SWITCH] SYSTEM QUARANTINED.\n${reason}\nRemove .SYSTEM_LOCK to resume operations.`);
        }

        // 2. Runaway Loop Preemption (Rate Limiting)
        if (Date.now() - this.lastReset > 60000) {
            this.actionCount = 0;
            this.lastReset = Date.now();
        }

        this.actionCount++;
        if (this.actionCount > this.throttleLimit) {
            this.engageLock('Runaway AI loop detected. Operations exceeded 50/minute. Preemptive quarantine engaged to prevent spam or resource exhaustion.');
            throw new Error('SYSTEM_HARD_LOCKED: Runaway loop detected.');
        }
    }

    /**
     * Sever the connection and lock the system.
     */
    engageLock(reason) {
        fs.writeFileSync(this.lockPath, `LOCKED_REASON: ${reason}\nTIMESTAMP: ${new Date().toISOString()}`);
        console.error(`\n[KILL_SWITCH_ENGAGED] ${reason}\n`);
    }
}
module.exports = new KillSwitch();
