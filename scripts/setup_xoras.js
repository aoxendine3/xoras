#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

/**
 * XORAS Repository Audit Setup
 * Purpose: Automates the installation of the XORAS Action and Local Hook.
 */

function setup() {
    console.log("\n🚀 Initializing XORAS Repository Audit Setup...");

    const projectRoot = process.cwd();

    // 1. Create .github/workflows directory
    const workflowDir = path.join(projectRoot, '.github', 'workflows');
    if (!fs.existsSync(workflowDir)) {
        fs.mkdirSync(workflowDir, { recursive: true });
    }

    // 2. Create xoras_audit.yml (Pinned to SHAs for Integrity)
    const workflowFile = path.join(workflowDir, 'xoras_audit.yml');
    const workflowContent = `name: XORAS Audit
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  audit:
    name: Release Drift Audit
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read
    steps:
      - name: Checkout Repository
        uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
      
      - name: Run XORAS Audit
        uses: aoxendine3/xoras/action@461bd8559093845b410940586e3f48a1d1354a # Current Stabilized SHA
`;
    fs.writeFileSync(workflowFile, workflowContent);
    console.log("✅ Created: .github/workflows/xoras_audit.yml (Pinned to SHAs)");

    // 3. Create xoras.config.json
    const configFile = path.join(projectRoot, 'xoras.config.json');
    if (!fs.existsSync(configFile)) {
        const configContent = {
            project: "XORAS Pilot Project",
            policy: "DETERMINISTIC",
            scanners: ["SECRETS", "DEPENDENCY_DRIFT", "WORKFLOW_SECURITY"]
        };
        fs.writeFileSync(configFile, JSON.stringify(configContent, null, 2));
        console.log("✅ Created: xoras.config.json");
    }

    // 4. Update package.json for DX
    const pkgPath = path.join(projectRoot, 'package.json');
    if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        pkg.scripts = pkg.scripts || {};
        if (!pkg.scripts.audit) {
            pkg.scripts.audit = "xoras local";
            fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
            console.log("✅ Updated: package.json (Added 'npm run audit')");
        }
    }

    console.log("\n✅ XORAS Setup Complete. Your repository integrity is now verifiably grounded.\n");
}

setup();
