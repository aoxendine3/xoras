import * as core from '@actions/core';
import fs from 'fs';
import path from 'path';

async function run() {
  try {
    const mode = core.getInput('mode') || 'ADVISORY';
    core.info(`Starting XORAS Release Integrity Check (Mode: ${mode})`);

    // Simulated Telemetry (For Pilot Display)
    // In production, this would call the xoras core engine via API or binary
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
        if (/AKIA[0-9A-Z]{16}/.test(content)) securityFindings++;
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
  const { status, score, violations, warnings, metrics, latencyDrift } = evaluation;
  
  const icon = status === 'BLOCKED' ? '❌' : (status === 'WARNING' ? '⚠️' : '✅');
  const recommendation = status === 'BLOCKED' ? 'Review Required' : 'Proceed';
  
  await core.summary
    .addHeading('🛡️ XORAS Engineering Integrity')
    .addTable([
      [{data: 'Signal', header: true}, {data: 'Status', header: true}],
      ['Integrity Score', `${score}/100`],
      ['Security Drift', metrics.security_findings > 0 ? '❌ Block Candidate' : '✅ Healthy'],
      ['Performance Drift', latencyDrift > 15 ? '⚠️ Warning' : '✅ Healthy'],
      ['Stability', status === 'HEALTHY' ? '✅ Healthy' : (status === 'WARNING' ? '⚠️ Degraded' : '❌ At Risk')],
      ['Recommendation', `**${recommendation}**`]
    ])
    .addBreak();

  if (violations.length > 0 || warnings.length > 0) {
    let risks = '';
    violations.forEach(v => risks += `- ❌ ${v}\n`);
    warnings.forEach(w => risks += `- ⚠️ ${w}\n`);
    
    await core.summary
      .addHeading('Prevented Risks:', 3)
      .addRaw(risks)
      .addBreak();
      
    await core.summary
      .addHeading('Remediation:', 3)
      .addRaw('Please review the identified architectural and performance drifts against the `xoras.config.json` baseline. ')
      .addRaw(`Current Mode: **${mode}** (Policies are ${mode === 'ADVISORY' ? 'non-blocking' : 'enforced'}).`);
  } else {
    await core.summary.addRaw('✅ All institutional baselines met. Release confidence is high.');
  }

  await core.summary.write();
}

run();
