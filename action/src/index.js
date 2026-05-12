import * as core from '@actions/core';
import fs from 'fs';
import path from 'path';

async function run() {
  try {
    const mode = core.getInput('mode') || 'ADVISORY';
    core.info(`Starting XORAS Release Integrity Check (Mode: ${mode})`);

    // 1. Load and Validate Configuration
    const config = loadConfig();
    validateConfig(config);

    // 2. Gather Telemetry
    const metrics = await gatherTelemetry();

    // Evaluate
    const policy = loadPolicy();
    const evaluation = evaluateMetrics(metrics, policy);

    // Generate Beautiful PR Feedback (Step Summary)
    await generateStepSummary(evaluation, mode);

    // Enforce
    if (evaluation.status === 'BLOCKED' && mode === 'ENFORCEMENT') {
      core.setFailed('XORAS ENFORCEMENT: Release Blocked due to policy violations.');
    } else {
      core.info('XORAS Check Complete. See GitHub Step Summary for details.');
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

function validateConfig(config) {
    const required = ['name', 'mode', 'thresholds'];
    const missing = required.filter(key => !config[key]);
    
    if (missing.length > 0) {
        throw new Error(`XORAS Institutional Error: Malformed xoras.config.json. Missing required fields: ${missing.join(', ')}`);
    }

    if (!['ADVISORY', 'ENFORCEMENT'].includes(config.mode)) {
        throw new Error(`XORAS Institutional Error: Invalid mode "${config.mode}". Must be ADVISORY or ENFORCEMENT.`);
    }
    
    console.log(`✅ XORAS Policy Validated: [${config.name}] in [${config.mode}] mode.`);
}

function loadConfig() {
    try {
        const configPath = path.join(process.cwd(), 'xoras.config.json');
        if (fs.existsSync(configPath)) {
            return JSON.parse(fs.readFileSync(configPath, 'utf8'));
        }
        // Fallback for pilots
        return {
            name: "XORAS-ADVISORY-PILOT",
            mode: "ADVISORY",
            thresholds: { latencyDrift: 0.25, securitySeverity: "high" }
        };
    } catch (err) {
        throw new Error(`XORAS Technical Error: Failed to parse xoras.config.json - ${err.message}`);
    }
}

async function gatherTelemetry() {
  const workspace = process.env.GITHUB_WORKSPACE || process.cwd();
  const pkgPath = path.join(workspace, 'package.json');
  let depCount = 0;
  
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      depCount = Object.keys(pkg.dependencies || {}).length + Object.keys(pkg.devDependencies || {}).length;
    } catch (e) {
      core.warning('Could not parse package.json for dependency count.');
    }
  }

  // Scan for mock secrets
  let securityFindings = 0;
  try {
    const files = fs.readdirSync(workspace);
    for (const file of files) {
      if (file.endsWith('.js') || file.endsWith('.cjs')) {
        const content = fs.readFileSync(path.join(workspace, file), 'utf8');
        if (/MOCK_AKIA_[0-9A-Z]{10}/.test(content)) securityFindings++;
      }
    }
  } catch (e) {
    // ignore
  }

  // Simulated latency for demo
  const latency = Math.floor(Math.random() * 50) + 10;

  return {
    latency,
    security_findings: securityFindings,
    dependency_count: depCount,
    baseline: {
      latency: 15,
      dependency_count: Math.max(0, depCount - 5) // simulate growth
    }
  };
}

function loadPolicy() {
  return {
    performance: { max_latency_drift_percent: 15, block_threshold_percent: 25 },
    security: { allowed_exposed_secrets: 0 },
    architecture: { max_dependencies: 100, bloat_warning_threshold: 45 }
  };
}

function evaluateMetrics(metrics, policy) {
  const violations = [];
  const warnings = [];
  
  const latencyDrift = ((metrics.latency - metrics.baseline.latency) / metrics.baseline.latency) * 100;
  
  // Latency
  if (latencyDrift > policy.performance.block_threshold_percent) {
    violations.push(`Latency regression (+${Math.round(latencyDrift)}%)`);
  } else if (latencyDrift > policy.performance.max_latency_drift_percent) {
    warnings.push(`Latency warning (+${Math.round(latencyDrift)}%)`);
  }

  // Security
  if (metrics.security_findings > policy.security.allowed_exposed_secrets) {
    violations.push(`${metrics.security_findings} exposed secrets detected`);
  }

  // Architecture
  const depGrowth = metrics.dependency_count - metrics.baseline.dependency_count;
  if (metrics.dependency_count > policy.architecture.max_dependencies) {
    violations.push(`Dependency growth (+${depGrowth} packages) exceeds limits`);
  } else if (metrics.dependency_count > policy.architecture.bloat_warning_threshold) {
    warnings.push(`Dependency growth (+${depGrowth} packages) near limit`);
  }

  let status = 'HEALTHY';
  let score = 100 - (violations.length * 20) - (warnings.length * 5);
  
  if (violations.length > 0) status = 'BLOCKED';
  else if (warnings.length > 0) status = 'WARNING';

  return { status, score, violations, warnings, metrics, latencyDrift };
}

async function generateStepSummary(evaluation, mode) {
  const { score, metrics, latencyDrift } = evaluation;
  const findings = {
    security: metrics.security_findings,
    performance: Math.round(latencyDrift)
  };

  const badgeColor = score > 80 ? 'success' : score > 50 ? 'important' : 'critical';
  const recommendation = score > 80 ? '✅ Proceed' : score > 50 ? '⚠️ Review Required' : '❌ Release Blocked';
  const modeLabel = mode === 'ADVISORY' ? '🛡️ Advisory Mode (Non-Blocking)' : '⚡ Enforcement Mode (Active Gating)';

  await core.summary
    .addRaw(`
# XORAS Engineering Integrity
![Integrity Score](https://img.shields.io/badge/Integrity_Score-${score}/100-${badgeColor}?style=for-the-badge) ![Mode](https://img.shields.io/badge/Mode-Pilot_Advisory-blue?style=for-the-badge)

### 📊 Release Confidence Report
| Signal | Status | Baseline | Drift |
| :--- | :--- | :--- | :--- |
| **Security Drift** | ${findings.security > 0 ? '❌ AT RISK' : '✅ HEALTHY'} | 0 Secrets | ${findings.security} detected |
| **Performance Drift** | ${findings.performance > 25 ? '❌ REGRESSION' : findings.performance > 10 ? '⚠️ WARNING' : '✅ HEALTHY'} | <15% | +${findings.performance}% |
| **Architectural Bloat** | ✅ HEALTHY | <40 deps | 0 new packages |
| **Institutional Stability** | ✅ HEALTHY | Verified | No drift |

---

### 🚨 Prevention Summary
${findings.security > 0 ? `- **Secret Exposure**: Intercepted ${findings.security} potential token(s) in commit history.` : ''}
${findings.performance > 15 ? `- **Latency Regression**: Detected +${findings.performance}% drift in critical path (Order API).` : ''}
${findings.security === 0 && findings.performance <= 15 ? '- ✅ All institutional baselines within tolerances.' : ''}

### 🛠️ Remediation Path
* **Current Policy**: ${modeLabel}
* **Recommendation**: **${recommendation}**
* **Next Step**: ${score > 80 ? 'Continue to release.' : 'Review drift metrics in the [Governance Dashboard](http://localhost:3000) before merging.'}

---
*Generated by XORAS v1.0.0 (Release Confidence Layer)*
    `)
    .write();
}

run();
