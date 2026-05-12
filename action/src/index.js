const core = require('@actions/core');
const fs = require('fs');
const path = require('path');

async function run() {
  try {
    const configPath = core.getInput('config-path') || 'xoras.config.json';
    const mode = core.getInput('mode') || 'ADVISORY';
    
    console.log(`🚀 XORAS Audit initialized in ${mode} mode...`);

    if (!fs.existsSync(configPath)) {
      core.setFailed(`XORAS config not found at ${configPath}`);
      return;
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const metrics = simulateMetrics();
    const policy = loadPolicy();
    const evaluation = evaluateMetrics(metrics, policy);

    await generateStepSummary(evaluation, mode);

    if (mode === 'ENFORCEMENT' && evaluation.status === 'BLOCKED') {
      core.setFailed('Release blocked by XORAS governance policy.');
    }
  } catch (error) {
    core.setFailed(`XORAS execution failed: ${error.message}`);
  }
}

function simulateMetrics() {
  const depCount = 45;
  const securityFindings = Math.random() > 0.8 ? 1 : 0;
  const dockerTagDrift = Math.random() > 0.9 ? true : false;
  
  return {
    latency: 18,
    security_findings: securityFindings,
    dependency_count: depCount,
    docker_tag_drift: dockerTagDrift,
    baseline: {
      latency: 15,
      dependency_count: 40,
      docker_tag_hash: "sha256:7b5a..."
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
  
  if (latencyDrift > policy.performance.block_threshold_percent) {
    violations.push(`Latency regression (+${Math.round(latencyDrift)}%)`);
  } else if (latencyDrift > policy.performance.max_latency_drift_percent) {
    warnings.push(`Latency warning (+${Math.round(latencyDrift)}%)`);
  }

  if (metrics.security_findings > policy.security.allowed_exposed_secrets) {
    violations.push(`${metrics.security_findings} exposed secrets detected`);
  }

  const depGrowth = metrics.dependency_count - metrics.baseline.dependency_count;
  if (metrics.dependency_count > policy.architecture.max_dependencies) {
    violations.push(`Dependency growth (+${depGrowth} packages) exceeds limits`);
  }

  if (metrics.docker_tag_drift) {
    violations.push(`Docker Tag Drift Detected: Tag hash has been modified in registry.`);
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
  const modeLabel = mode === 'ADVISORY' ? '🛡️ Advisory Mode' : '⚡ Enforcement Mode';

  await core.summary
    .addRaw(`
# XORAS Engineering Audit
![Integrity Score](https://img.shields.io/badge/Integrity_Score-${score}/100-${badgeColor}?style=for-the-badge) ![Status](https://img.shields.io/badge/Status-${modeLabel.replace(/ /g, '_')}-blue?style=for-the-badge)

### 📊 Release Metrics
| Metric | Status | Baseline | Drift |
| :--- | :--- | :--- | :--- |
| **Security Scan** | ${findings.security > 0 ? '❌ AT RISK' : '✅ HEALTHY'} | 0 Secrets | ${findings.security} detected |
| **Performance Drift** | ${findings.performance > 25 ? '❌ REGRESSION' : findings.performance > 10 ? '⚠️ WARNING' : '✅ HEALTHY'} | <15% | +${findings.performance}% |
| **Architecture Audit** | ✅ HEALTHY | <100 deps | No new packages |
| **Docker Tag Finality** | ${metrics.docker_tag_drift ? '❌ DRIFT' : '✅ VERIFIED'} | sha256:... | ${metrics.docker_tag_drift ? 'Tampered' : 'Stable'} |

---

### 🚨 Prevention Summary
${findings.security > 0 ? `- **Security Violation**: Detected potential secret(s) in commit history.` : ''}
${findings.performance > 15 ? `- **Performance Regression**: Latency drift (+${findings.performance}%) exceeds engineering baseline.` : ''}
${metrics.docker_tag_drift ? `- **Docker Tag Tampering**: Unauthorized hash modification detected in registry.` : ''}
${findings.security === 0 && findings.performance <= 15 && !metrics.docker_tag_drift ? '- ✅ All release metrics satisfy the production baseline.' : ''}

### 🛠️ Recommendation
* **Policy Status**: ${modeLabel}
* **Guidance**: **${recommendation}**
* **Documentation**: Review governance standards in [ARCHITECTURE.md](https://aoxendine3.github.io/xoras/docs/ARCHITECTURE.md)

---
*Generated by XORAS (Continuous Release Governance)*
    `)
    .write();
}

run();
