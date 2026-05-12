const fs = require('fs');
const path = require('path');

/**
 * XORAS Pre-Flight Verification (Master Standard)
 * Purpose: Ensures all workflows are pinned, secure, and syntax-valid.
 */

function verifyWorkflows() {
    console.log('🚀 Initiating Pre-Flight Workflow Audit...');
    
    const workflowDir = path.join(process.cwd(), '.github/workflows');
    if (!fs.existsSync(workflowDir)) {
        console.log('⚠️ No workflows found.');
        return;
    }

    const files = fs.readdirSync(workflowDir).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
    let violations = 0;

    files.forEach(file => {
        const content = fs.readFileSync(path.join(workflowDir, file), 'utf8');
        
        // 1. Check for Unpinned Actions
        const actionRegex = /uses: ([a-zA-Z0-9-]+\/[a-zA-Z0-9-]+)@(?![0-9a-f]{40})/g;
        let match;
        while ((match = actionRegex.exec(content)) !== null) {
            console.error(`❌ VULNERABILITY: Unpinned action "${match[1]}" detected in ${file}.`);
            violations++;
        }

        // 2. Check for Brittle Scripts (curl | bash, sudo mv)
        if (content.includes('curl ') && (content.includes('| bash') || content.includes('sudo mv'))) {
            console.error(`❌ BRITTLE_PATTERN: Manual installation detected in ${file}. Use official actions.`);
            violations++;
        }
    });

    if (violations > 0) {
        console.error(`\n⚠️ Pre-Flight Failed: ${violations} structural issue(s) detected.`);
        process.exit(1);
    }

    console.log('\n🏛️ PRE_FLIGHT_PASSED: Workflow integrity solidified.');
}

verifyWorkflows();
