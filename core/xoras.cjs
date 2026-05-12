#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');

/**
 * XORAS CONTROL NODE [v1.23.0]
 * Release Integrity Governance Infrastructure (RIGI).
 * 
 * FOCUS: Pilot Readiness, Risk Mitigation Telemetry, and Operational Workflow.
 */

const SECRET_KEY = process.env.XORAS_INTEGRITY_KEY || 'XORAS_DEFAULT_SECURE_KEY';

const MODE = process.env.XORAS_MODE || 'ADVISORY'; // ADVISORY | ENFORCEMENT
const INCIDENT_LEDGER = path.join(process.cwd(), 'prevented_incidents.json');

class XorasControl {
    constructor(targetPath = '.') {
        this.version = '1.23.0';
        this.targetPath = targetPath;
        this.ledgerPath = path.join(targetPath, 'integrity_ledger.json');
        this.configPath = path.join(targetPath, 'xoras.config.json');
        this.authorityPath = path.join(__dirname, 'AuthorityRegistry.json');
        this.policy = this.loadPolicy();
        this.authority = this.loadAuthority();
    }

    loadAuthority() {
        try {
            if (fs.existsSync(this.authorityPath)) {
                return JSON.parse(fs.readFileSync(this.authorityPath, 'utf8'));
            }
        } catch (e) {
            console.warn(`[XORAS_IAG] Authority Registry corrupt or missing.`);
        }
        return { trust_anchors: [] };
    }

    signLedger(ledger) {
        const { history, audit_log, governance_mode } = ledger;
        const data = JSON.stringify({ history, audit_log, governance_mode });
        return crypto.createHmac('sha256', SECRET_KEY).update(data).digest('hex');
    }

    verifyLedger() {
        if (!fs.existsSync(this.ledgerPath)) return false;
        const ledger = JSON.parse(fs.readFileSync(this.ledgerPath, 'utf8'));
        if (!ledger.signature) return false;
        const expected = this.signLedger(ledger);
        return ledger.signature === expected;
    }

    loadPolicy() {
        const institutionalBaseline = {
            policy_name: "INSTITUTIONAL_CORE_v1",
            budgets: {
                performance: { max_latency_drift_percent: 15, block_threshold_percent: 25 },
                security: { allowed_vulnerabilities: 0, allowed_exposed_secrets: 0 },
                architecture: { max_dependencies: 40, bloat_warning_threshold: 30 }
            }
        };

        try {
            if (fs.existsSync(this.configPath)) {
                const localPolicy = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
                return { ...institutionalBaseline, ...localPolicy, budgets: { ...institutionalBaseline.budgets, ...localPolicy.budgets } };
            }
        } catch (e) {
            console.warn(`[XORAS_WARNING] Config corrupt or missing. Falling back to institutional baseline.`);
        }
        return institutionalBaseline;
    }

    analyzeHealth() {
        console.log(`\n[XORAS_HEALTH] ANALYZING GOVERNANCE MATURITY...`);
        if (!fs.existsSync(this.ledgerPath)) return console.error(`[XORAS_HEALTH] Ledger missing.`);

        const ledger = JSON.parse(fs.readFileSync(this.ledgerPath, 'utf8'));
        const log = ledger.audit_log || [];

        const metrics = {
            friction_events: log.filter(e => e.type === 'EXCEPTION_REQUESTED' || e.type === 'BLOCK_BYPASSED').length,
            stability_events: log.filter(e => e.type === 'REPAIR').length,
            total_events: log.length,
            uptime_days: (Date.now() - new Date(ledger.history[0].timestamp).getTime()) / (1000 * 60 * 60 * 24)
        };

        console.log(`==========================================`);
        console.log(`  GOVERNANCE HEALTH REPORT`);
        console.log(`==========================================`);
        console.log(`  FRICTION SCORE: ${metrics.friction_events} Exceptions (Target: <3)`);
        console.log(`  STABILITY SCORE: ${metrics.stability_events} Repairs (Target: <5)`);
        console.log(`  OPERATIONAL AGE: ${metrics.uptime_days.toFixed(1)} Days`);
        console.log(`  DETERMINISM: ${this.verifyLedger() ? 'HIGH (Verified)' : 'COMPROMISED'}`);
        
        const healthVerdict = metrics.friction_events > 5 ? '⚠️ NOISY' : '✅ STABLE';
        console.log(`\n  VERDICT: ${healthVerdict}`);
    }


    async repair(reason = 'MANUAL_REPAIR') {
        console.log(`[XORAS_HEALING] INITIATING REPAIR SEQUENCE...`);
        try {
            const exists = fs.existsSync(this.ledgerPath);
            if (!exists) {
                await this.initialize();
            }
            this.logEvent('REPAIR', { reason: reason, original_ledger_exists: exists, recovery_method: 'AUTO_REBASELINE' });
            console.log(`[XORAS_HEALING] SUCCESS: REPOSITORY REPAIRED. PROVENANCE LOGGED.`);
        } catch (e) {
            console.error(`[XORAS_HEALING] FATAL: Repair failed.`);
        }
    }

    saveLedger(ledger) {
        const tempPath = `${this.ledgerPath}.tmp`;
        try {
            ledger.signature = this.signLedger(ledger);
            fs.writeFileSync(tempPath, JSON.stringify(ledger, null, 2));
            fs.renameSync(tempPath, this.ledgerPath);
        } catch (e) {
            console.error(`[XORAS_FS] FATAL: Failed to commit ledger state: ${e.message}`);
            if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        }
    }

    logEvent(type, details) {
        if (!fs.existsSync(this.ledgerPath)) return;
        const ledger = JSON.parse(fs.readFileSync(this.ledgerPath, 'utf8'));
        if (!ledger.audit_log) ledger.audit_log = [];

        const event = {
            id: `EVT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
            timestamp: new Date().toISOString(),
            origin: { hostname: os.hostname(), user: os.userInfo().username, cwd: process.cwd() },
            type: type,
            details: details
        };

        ledger.audit_log.push(event);
        this.saveLedger(ledger);
        console.log(`[XORAS_AUDIT] Event Logged: ${event.id} [${type}]`);
        return event.id;
    }

    requestException(category, reason) {
        if (!['PERF', 'SEC', 'ARCH'].includes(category)) {
            console.error(`[XORAS] Invalid category. Use: [PERF|SEC|ARCH]`);
            return;
        }
        const requestId = `REQ-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
        console.log(`\n==========================================`);
        console.log(`  GOVERNANCE EXCEPTION REQUEST [${category}]`);
        console.log(`==========================================`);
        console.log(`  REQUEST ID: ${requestId}`);
        console.log(`  REASON: ${reason || 'Not specified'}`);
        console.log(`\nTo approve locally: node xoras.cjs approve ${requestId} [AUTHORITY_ID]`);
        this.logEvent('EXCEPTION_REQUESTED', { requestId, category, reason });
        return requestId;
    }

    approveException(requestId, approverId) {
        const anchor = this.authority.trust_anchors.find(a => a.id === approverId);
        if (!anchor) {
            console.error(`[XORAS_IAG] UNAUTHORIZED: Approver ID [${approverId}] not found in Registry.`);
            return;
        }

        console.log(`[XORAS_IAG] Trust Anchor [${anchor.name}] signing approval for ${requestId}...`);
        
        const hsmPath = path.join(__dirname, 'sandbox', 'hsm_private_keys.json');
        if (!fs.existsSync(hsmPath)) {
            console.error(`[XORAS_HSM] FATAL: HSM Key Store not found.`);
            return;
        }

        const hsm = JSON.parse(fs.readFileSync(hsmPath, 'utf8'));
        const privateKey = hsm[approverId];
        
        if (!privateKey) {
            console.error(`[XORAS_HSM] ERROR: Private key for ${approverId} not in HSM.`);
            return;
        }

        const data = `${requestId}:${approverId}:${anchor.roles.join(',')}`;
        const signature = crypto.sign("sha256", Buffer.from(data), {
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        }).toString('hex');

        this.logEvent('EXCEPTION_APPROVED', {
            requestId,
            approverId,
            approverName: anchor.name,
            signature: signature,
            timestamp: new Date().toISOString()
        });

        console.log(`[XORAS_IAG] SUCCESS: Approval bound to ledger with Cryptographic Signature.`);
    }

    async checkGate(forcedMetrics = null) {
        try {
            console.log(`[XORAS_GATEKEEPER] EVALUATING RELEASE INTEGRITY [MODE: ${MODE}]...`);
            if (fs.existsSync(this.ledgerPath) && !this.verifyLedger()) {
                console.error(`[XORAS_GATEKEEPER] ABORTING: Ledger trust violation detected.`);
                process.exit(1);
            }

            const current = forcedMetrics || await this.captureTelemetry();
            if (!fs.existsSync(this.ledgerPath)) {
                await this.repair('MISSING_LEDGER_AUTO_DETECT');
            }

            const ledger = JSON.parse(fs.readFileSync(this.ledgerPath, 'utf8'));
            const baseline = ledger.history[0];

            const diff = current.latency - baseline.metrics.latency;
            const drift = (diff / baseline.metrics.latency) * 100;

            const violations = [];
            const warnings = [];
            
            // Performance Check
            const perfPolicy = this.policy.budgets.performance;
            if (drift > perfPolicy.block_threshold_percent) {
                violations.push(`LATENCY_CRITICAL: ${drift.toFixed(2)}% drift exceeds block threshold (${perfPolicy.block_threshold_percent}%)`);
            } else if (drift > perfPolicy.max_latency_drift_percent) {
                warnings.push(`LATENCY_DRIFT: ${drift.toFixed(2)}% drift exceeds warning threshold (${perfPolicy.max_latency_drift_percent}%)`);
            }

            // Security Check
            if (current.security_findings > this.policy.budgets.security.allowed_exposed_secrets) {
                violations.push(`SECURITY_VULNERABILITY: ${current.security_findings} secrets detected`);
            }

            // Architecture Check
            const archPolicy = this.policy.budgets.architecture;
            if (current.dependency_count > archPolicy.max_dependencies) {
                violations.push(`ARCHITECTURE_BLOAT: ${current.dependency_count} deps exceeds block limit (${archPolicy.max_dependencies})`);
            } else if (current.dependency_count > archPolicy.bloat_warning_threshold) {
                warnings.push(`ARCHITECTURE_WARNING: ${current.dependency_count} deps exceeds warning threshold (${archPolicy.bloat_warning_threshold})`);
            }

            const isJson = process.argv.includes('--json');
            const violationHash = crypto.createHash('md5').update([...violations, ...warnings].join('|')).digest('hex').substring(0, 6).toUpperCase();
            const requestId = `REQ-${violationHash}`;

            if (violations.length > 0) {
                // ROI Tracking: Log as a Prevented Incident
                await this.logPreventedIncident(violations, requestId);

                const isApproved = ledger.audit_log.some(event => 
                    event.type === 'EXCEPTION_APPROVED' && 
                    event.details.requestId === requestId
                );

                const isSuppressed = ledger.audit_log.some(event => 
                    event.type === 'FINDING_SUPPRESSED' && 
                    violations.some(v => v.includes(event.details.category))
                );

                if (isApproved || isSuppressed) {
                    console.log(`[XORAS_GATE] VALID GOVERNANCE OVERRIDE DETECTED. PROCEEDING.`);
                    return true;
                }

                if (isJson) {
                    console.log(JSON.stringify({ status: 'BLOCKED', requestId, violations, warnings }));
                } else {
                    console.log(`\n==========================================`);
                    console.log(`  XORAS INTEGRITY VERDICT: ❌ BLOCKED`);
                    console.log(`==========================================`);
                    violations.forEach(v => console.log(`  - ${v}`));
                    warnings.forEach(w => console.log(`  - ${w} (NON-BLOCKING)`));
                    console.log(`  REQUEST ID: ${requestId}`);
                }

                if (MODE === 'ADVISORY') {
                    if (!isJson) console.log(`\n[XORAS_MODE] ADVISORY: Governance Warning Logged. Proceeding with workflow...`);
                    this.logEvent('GATE_WARNING', { violations, warnings, requestId });
                    return true;
                } else {
                    if (!isJson) {
                        console.log(`\n[XORAS_MODE] ENFORCEMENT: RELEASE BLOCKED. Requires Identity-Signed Approval.`);
                        console.log(`To request a signed exception: node xoras.cjs request-exception [CATEGORY] "Reason"`);
                    }
                    this.logEvent('GATE_BLOCK', { violations, warnings, requestId });
                    process.exit(1);
                }
            } else if (warnings.length > 0) {
                if (isJson) {
                    console.log(JSON.stringify({ status: 'WARNING', requestId, warnings }));
                } else {
                    console.log(`\n==========================================`);
                    console.log(`  XORAS INTEGRITY VERDICT: ⚠️ WARNING`);
                    console.log(`==========================================`);
                    warnings.forEach(w => console.log(`  - ${w}`));
                    console.log(`  REQUEST ID: ${requestId}`);
                }
                this.logEvent('GATE_WARNING', { warnings, requestId });
                return true;
            }

            if (isJson) {
                console.log(JSON.stringify({ status: 'PASSED', metrics: current }));
            } else {
                console.log(`[XORAS_GATE] ALL INSTITUTIONAL POLICIES VERIFIED.`);
            }
            return true;
        } catch (e) {
            console.error(`[XORAS_ERROR] Gatekeeper failed: ${e.message}`);
            process.exit(1);
        }
    }

    async logPreventedIncident(violations, requestId) {
        let incidents = [];
        try {
            if (fs.existsSync(INCIDENT_LEDGER)) {
                incidents = JSON.parse(fs.readFileSync(INCIDENT_LEDGER, 'utf8'));
            }
        } catch (e) {}

        const incident = {
            id: `INC-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
            timestamp: new Date().toISOString(),
            requestId,
            violations,
            estimated_risk: violations.length > 1 ? 'HIGH' : 'MEDIUM',
            status: MODE === 'ADVISORY' ? 'DETECTED' : 'PREVENTED'
        };

        incidents.push(incident);
        fs.writeFileSync(INCIDENT_LEDGER, JSON.stringify(incidents, null, 2));
        console.log(`[XORAS_ROI] Risk logged to Prevented Incidents Ledger: ${incident.id}`);
    }

    suppressFinding(category, approverId) {
        const anchor = this.authority.trust_anchors.find(a => a.id === approverId);
        if (!anchor || (!anchor.scopes.includes(category) && !anchor.scopes.includes('*'))) {
            console.error(`[XORAS_IAG] UNAUTHORIZED: Identity ${approverId} cannot suppress ${category}.`);
            return;
        }

        console.log(`[XORAS_IAG] Trust Anchor [${anchor.name}] suppressing ${category} findings...`);
        this.logEvent('FINDING_SUPPRESSED', { category, approverId, approverName: anchor.name });
        console.log(`[XORAS_IAG] SUCCESS: ${category} findings are now acknowledged & suppressed.`);
    }

    async initialize() {
        try {
            console.log(`[XORAS] INITIALIZING INSTITUTIONAL GOVERNANCE BASELINE...`);
            const metrics = await this.captureTelemetry();
            const ledger = {
                history: [{
                    id: `SNAP-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
                    timestamp: new Date().toISOString(),
                    status: 'GOVERNANCE_ACTIVE',
                    metrics: metrics
                }],
                audit_log: []
            };
            this.saveLedger(ledger);
            console.log(`[XORAS] SUCCESS: REPOSITORY BASELINED. RELEASE INTEGRITY ACTIVE.`);
        } catch (e) {
            console.error(`[XORAS_ERROR] Initialization failed.`);
        }
    }

    async captureTelemetry() {
        const start = performance.now();
        for(let i=0; i<50; i++) fs.readFileSync(__filename, 'utf8');
        const latency = (performance.now() - start) / 50;
        
        let securityFindings = 0;
        const files = fs.readdirSync(this.targetPath).filter(f => f.endsWith('.cjs') || f.endsWith('.js'));
        for (const file of files) {
            const content = fs.readFileSync(path.join(this.targetPath, file), 'utf8');
            if (/AKIA[0-9A-Z]{16}/.test(content)) securityFindings++;
        }

        const pkgPath = path.join(this.targetPath, 'package.json');
        let depCount = fs.existsSync(pkgPath) ? Object.keys(JSON.parse(fs.readFileSync(pkgPath, 'utf8')).dependencies || {}).length : 0;

        return { latency: parseFloat(latency.toFixed(4)), security_findings: securityFindings, dependency_count: depCount, timestamp: new Date().toISOString() };
    }

    async simulate(profileName) {
        console.log(`\n[XORAS_SIMULATION] REHEARSING PROFILE: ${profileName}...`);
        const profilesPath = path.join(__dirname, 'sandbox', 'profiles.json');
        const manifest = JSON.parse(fs.readFileSync(profilesPath, 'utf8'));
        const profile = manifest.profiles[profileName];
        if (!profile) return;

        const ledger = JSON.parse(fs.readFileSync(this.ledgerPath, 'utf8'));
        const baseline = ledger.history[0];

        const mockMetrics = {
            latency: profile.type === 'PERFORMANCE' ? profile.value : baseline.metrics.latency,
            security_findings: profile.type === 'SECURITY' ? 1 : 0,
            dependency_count: profile.type === 'ARCHITECTURE' ? profile.value : baseline.metrics.dependency_count,
            timestamp: new Date().toISOString()
        };

        // Push Snapshot for Timeline Analysis
        ledger.history.push({
            id: `SNAP-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
            timestamp: new Date().toISOString(),
            status: 'SIMULATED_DRIFT',
            metrics: mockMetrics
        });
        this.saveLedger(ledger);

        await this.checkGate(mockMetrics);
    }

    generateWeeklyReport() {
        const ledger = JSON.parse(fs.readFileSync(this.ledgerPath, 'utf8'));
        const latest = ledger.history[ledger.history.length - 1];
        const report = `
# XORAS INSTITUTIONAL INTEGRITY REPORT [v${this.version}]
## STATUS: ${this.verifyLedger() ? 'VERIFIED' : 'COMPROMISED'}
## AUDIT EVENTS: ${ledger.audit_log.length}

### GOVERNANCE MATURITY
*   Determinism Score: ${(100 - (latest.metrics.security_findings * 50)).toFixed(0)}/100
*   Operational Age: ${((Date.now() - new Date(ledger.history[0].timestamp).getTime()) / (1000 * 60 * 60 * 24)).toFixed(1)} Days
        `;
        fs.writeFileSync(path.join(this.targetPath, 'WEEKLY_REPORT.md'), report);
        console.log(`[XORAS] REPORT GENERATED.`);
    }

    sync(ecosystemRoot) {
        const root = ecosystemRoot || '.';
        const configPath = path.join(root, 'xoras.config.json');
        fs.writeFileSync(configPath, JSON.stringify(this.policy, null, 2));
        console.log(`[XORAS_SYNC] Policy synchronized.`);
    }
}

const [,, action, arg1, arg2] = process.argv;
const control = new XorasControl('.');

async function orchestrate() {
    const profileArgIdx = process.argv.indexOf('--profile');
    const profileName = profileArgIdx !== -1 ? process.argv[profileArgIdx + 1] : 'standard';

    switch (action) {
        case 'init': await control.initialize(); break;
        case 'gate': await control.checkGate(profileName); break;
        case 'check': await control.checkGate(arg1, profileName); break;
        case 'report': control.generateWeeklyReport(); break;
        case 'repair': await control.repair(); break;
        case 'verify': console.log(`[XORAS_VERIFY] Status: ${control.verifyLedger() ? 'VERIFIED' : 'UNVERIFIED'}`); break;
        case 'health': control.analyzeHealth(); break;
        case 'sync': control.sync(arg1); break;
        case 'approve': await control.approveException(arg1, arg2); break;
        case 'suppress': control.suppressFinding(arg1, arg2); break;
        case 'request-exception': control.requestException(arg1, arg2); break;
        case 'simulate': await control.simulate(arg1); break;
        default: console.log(`XORAS RIGI v1.23.0 - Use 'help' for commands.`);
    }
}

orchestrate().catch(e => {
    console.error(`[XORAS_FATAL] ${e.message}`);
    process.exit(1);
});
