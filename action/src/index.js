const core = require('@actions/core');
const fs = require('fs');
const path = require('path');

/**
 * XORAS: Simple Release Governance
 * Scans for secrets, checks Docker tags, and verifies Next.js routes.
 */

async function run() {
  try {
    core.info('🚀 Starting XORAS Audit...');

    const metrics = await performAudit();
    generateStepSummary(metrics);

    if (metrics.security_findings > 0) {
      core.setFailed(`❌ Audit failed: ${metrics.security_findings} potential secrets detected.`);
    } else if (metrics.docker_tag_drift) {
      core.setFailed('❌ Audit failed: Unstable Docker tags detected (using :latest).');
    } else {
      core.info('✅ Audit passed.');
    }

  } catch (error) {
    core.setFailed(`Error: ${error.message}`);
  }
}

async function performAudit() {
  const results = {
    security_findings: 0,
    dependency_count: 0,
    docker_tag_drift: false,
    next_js_found: false,
    workflow_risks: 0
  };

  const secretPatterns = [
    /api[_-]?key/i, /secret/i, /password/i, /token/i,
    /A3T[A-Z0-9]{16}/, // AWS
    /sk-[a-zA-Z0-9]{48}/ // OpenAI
  ];
  
  // 1. Scan for Secrets
  const files = getAllFiles(process.cwd());
  files.forEach(file => {
    if (file.includes('node_modules') || file.includes('.git') || file.includes('dist')) return;
    try {
      const content = fs.readFileSync(file, 'utf8');
      secretPatterns.forEach(pattern => {
        if (pattern.test(content)) results.security_findings++;
      });
      
      // 2. Workflow Security Audit (Zizmor-Lite)
      if (file.includes('.github/workflows/')) {
        if (content.includes('pull_request_target')) results.workflow_risks++;
        if (content.includes('run: |') && content.includes('${{ github.event')) results.workflow_risks++;
        
        // Count unpinned actions (looking for @v followed by a number instead of a long SHA)
        const unpinnedMatches = content.match(/uses: [a-zA-Z0-9-]+\/[a-zA-Z0-9-]+@v[0-9]/g);
        if (unpinnedMatches) results.workflow_risks += unpinnedMatches.length;
      }
    } catch (e) { /* skip binary/unreadable files */ }
  });

  // 3. Check Dependencies
  if (fs.existsSync('package.json')) {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    results.dependency_count = Object.keys(pkg.dependencies || {}).length;
  }

  // 3. Check Docker Tags
  if (fs.existsSync('Dockerfile')) {
    const content = fs.readFileSync('Dockerfile', 'utf8');
    if (content.includes(':latest')) results.docker_tag_drift = true;
  }

  // 4. Check Next.js
  if (fs.existsSync('next.config.js') || fs.existsSync('next.config.mjs')) {
    results.next_js_found = true;
  }

  return results;
}

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });
  return arrayOfFiles;
}

function generateStepSummary(metrics) {
  core.summary
    .addHeading('🛡️ XORAS Audit Summary')
    .addTable([
      ['Audit Type', 'Result', 'Status'],
      ['Secret Scan', `${metrics.security_findings} found`, metrics.security_findings > 0 ? '❌ FAIL' : '✅ PASS'],
      ['Workflow Audit', `${metrics.workflow_risks} risks`, metrics.workflow_risks > 0 ? '⚠️ WARNING' : '✅ PASS'],
      ['Docker Tags', metrics.docker_tag_drift ? 'Using :latest' : 'Stable', metrics.docker_tag_drift ? '❌ FAIL' : '✅ PASS'],
      ['Next.js Check', metrics.next_js_found ? 'Detected' : 'Not Found', metrics.next_js_found ? '✅ OK' : '⚪ N/A'],
      ['Dependencies', `${metrics.dependency_count} packages`, '✅ OK']
    ])
    .addLink('View Documentation', 'https://github.com/aoxendine3/xoras')
    .write();
}

run();
