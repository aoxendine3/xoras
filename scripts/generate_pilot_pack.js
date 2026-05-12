const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const target = process.argv[2] || 'GENERIC_PILOT';
const outputDir = path.join(process.cwd(), 'pilots', target);

console.log(`🚀 Orchestrating XORAS Pilot Pack for: ${target}...`);

// 1. Create Pilot Directory
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// 2. Generate Custom xoras.config.json
const config = {
    name: `${target}-INTEGRITY-PILOT`,
    mode: "ADVISORY",
    thresholds: {
        latencyDrift: 0.15,
        securitySeverity: "high",
        maxDependencies: 150
    },
    institutionalId: `XORAS-${target.toUpperCase()}-${Math.floor(Math.random() * 10000)}`
};

fs.writeFileSync(path.join(outputDir, 'xoras.config.json'), JSON.stringify(config, null, 2));

// 3. Add Onboarding Guide
const guide = `# XORAS Onboarding: ${target}
## Your 30-Day Integrity Lifecycle

Welcome to the XORAS Institutional Pilot. This repo has been pre-configured for **${target}**.

### Steps to Launch:
1.  **Copy** the \`xoras.config.json\` to your root directory.
2.  **Integrate** the XORAS GitHub Action (v1.0.0).
3.  **Calibrate** your baseline for the next 7 days.

### Support:
Join the ${target}-vanguard channel in our [Pilot Support Space](https://app.slack.com/client/T0B0Q10DYGG/C0AUU8V015M).

**Authorized by**: Anthony Oxendine
`;

fs.writeFileSync(path.join(outputDir, 'PILOT_ONBOARDING.md'), guide);

console.log(`✅ Pilot Pack Generated at: ${outputDir}`);
console.log(`🔗 Ready for Institutional Delivery.`);
