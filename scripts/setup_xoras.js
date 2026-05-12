#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * XORAS One-Click Setup
 * Purpose: Automates the installation of the XORAS Action and Local Hook.
 */

function setup() {
    console.log("\n🛡️  Initializing XORAS Enterprise Setup...");

    // 1. Create .github/workflows directory
    const workflowDir = path.join(process.cwd(), '.github', 'workflows');
    if (!fs.existsSync(workflowDir)) {
        fs.mkdirSync(workflowDir, { recursive: true });
    }

    // 2. Create xoras_audit.yml
    const workflowFile = path.join(workflowDir, 'xoras_audit.yml');
    const workflowContent = `name: XORAS Audit
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: XORAS Release Audit
        uses: aoxendine3/xoras/action@main
`;
    fs.writeFileSync(workflowFile, workflowContent);
    console.log("✅ Created: .github/workflows/xoras_audit.yml");

    // 3. Create xoras.config.json
    const configFile = path.join(process.cwd(), 'xoras.config.json');
    if (!fs.existsSync(configFile)) {
        const configContent = {
            project: "My Enterprise Project",
            policy: "STANDARD",
            scanners: ["SECRETS", "DOCKER", "NEXTJS"]
        };
        fs.writeFileSync(configFile, JSON.stringify(configContent, null, 2));
        console.log("✅ Created: xoras.config.json");
    }

    // 4. Install Local Hook
    try {
        console.log("🛠️  Installing local pre-commit hook...");
        // Assuming the user has xoras as a dependency or is running npx
        const hookPath = path.join(process.cwd(), '.git', 'hooks', 'pre-commit');
        const hookContent = `#!/bin/sh\nnode scripts/local_audit.js`;
        fs.writeFileSync(hookPath, hookContent);
        fs.chmodSync(hookPath, '755');
        console.log("✅ Installed: Local pre-commit security hook.");
    } catch (e) {
        console.log("⚠️  Skipped local hook installation (not a git repo).");
    }

    console.log("\n🚀 XORAS Setup Complete. Your project is now grounded.\n");
}

setup();
