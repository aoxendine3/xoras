const fs = require('fs');
const path = require('path');
const orchestrator = require('../intelligence_core/orchestrator');

/**
 * Structural Reconciliation Check
 * Verifies that the Audit Report header matches the Deterministic Standard.
 */

async function verifyReconciliation() {
    console.log("🔍 Initiating Structural Reconciliation...");
    
    await orchestrator.executeAudit();
    
    const reportPath = path.join(__dirname, '../intelligence_core/audit_report.md');
    const content = fs.readFileSync(reportPath, 'utf8');
    
    const requiredHeader = "# XORAS Repository Integrity Audit Report";
    const requiredScope = "**Scope**: Bounded Deterministic (v1.0)";
    
    if (content.includes(requiredHeader) && content.includes(requiredScope)) {
        console.log("✅ RECONCILIATION_PASSED: Documentation matches the Deterministic Standard.");
    } else {
        console.error("❌ RECONCILIATION_FAILED: Documentation deviation detected.");
        process.exit(1);
    }
}

verifyReconciliation();
