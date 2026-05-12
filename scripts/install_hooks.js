/**
 * XORAS Local Hook Installer
 * Purpose: Automates the setup of the Tier 1 (Edge) local auditor.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const hookPath = path.join(process.cwd(), '.git', 'hooks', 'pre-commit');
const auditorPath = path.join(process.cwd(), 'scripts', 'local_audit.js');

function install() {
    console.log("🛠  Installing XORAS Local Governance Gate...");

    if (!fs.existsSync(auditorPath)) {
        console.error("❌ ERROR: scripts/local_audit.js not found. Installation aborted.");
        process.exit(1);
    }

    const hookContent = `#!/bin/sh\nnode scripts/local_audit.js`;
    
    try {
        fs.writeFileSync(hookPath, hookContent);
        fs.chmodSync(hookPath, '755');
        console.log("✅ SUCCESS: Pre-commit hook installed and active.");
    } catch (e) {
        console.error(`❌ ERROR: Failed to write hook: ${e.message}`);
        process.exit(1);
    }
}

install();
