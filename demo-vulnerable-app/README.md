# XORAS Deterministic Proof Environment: Dual-Mode Architecture

This environment is a showcase of the **XORAS Release Integrity Governance Engine**.

It operates in **Dual Mode**, demonstrating both the **Vulnerable Baseline** (simulating delivery pressure and regressions) and the **Hardened Sovereign Production** target (zero-defect remediation).

---

## The Dual-Mode Architecture

```
                                  ┌─────────────────────────────┐
                                  │   XORAS INTEGRITY ACTION    │
                                  │   (.github/workflows/ci)    │
                                  └──────────────┬──────────────┘
                                                 │
                        ┌────────────────────────┴────────────────────────┐
                        ▼                                                 ▼
        [MODE 1: VULNERABLE BASELINE]                     [MODE 2: HARDENED PRODUCTION]
        Entry: `server.js`                                Entry: `server-hardened.js`
        Config: `aws-config.js`                           Config: `aws-config-hardened.js`
        Status: ❌ 4 Regressions Detected                  Status: ✅ 100% Policy Clean
```

### Side-by-Side Comparison

| Pillar | Mode 1: Vulnerable Baseline (`server.js`) | Mode 2: Hardened Production (`server-hardened.js`) | XORAS Governance Verdict |
|---|---|---|---|
| **1. Performance** | Inefficient full-table scan + blocking CPU spin loop (~150ms latency) | Indexed B-Tree search with prepared statements (<1.2ms latency) | **Remediated** (99.2% latency drop) |
| **2. Security** | Hardcoded AWS credentials in `aws-config.js` | Zero-secret environment injection via `process.env` | **Remediated** (0 secrets exposed) |
| **3. Architecture** | Bloated dependencies (`lodash`, `moment`, `request`) | Standard Node.js built-ins & lean runtime | **Remediated** (Zero bloat warnings) |
| **4. Governance** | Missing HTTP security headers | Full OWASP defense headers (`HSTS`, `CSP`, `nosniff`, `DENY`) | **Remediated** (Fail-closed baseline) |

---

## Running the Showcase

### 1. Run the Vulnerable Baseline (Regression Demo)
```bash
# Starts on port 3000
node server.js
```
*Test the performance drift:*
```bash
curl "http://localhost:3000/orders/search?q=Customer"
# Output shows inflated latency (>100ms) due to blocking loops
```

### 2. Run the Hardened Sovereign Production (Certified Clean)
```bash
# Starts on port 3001
node server-hardened.js
```
*Test the hardened endpoint:*
```bash
curl "http://localhost:3001/orders/search?q=Customer"
# Output shows sub-millisecond response, indexed lookup, and security headers
```

---

## Verifying Integrity in CI / PR

Every commit and pull request to this repository triggers the **XORAS Release Integrity Action** (`.github/workflows/integrity.yml`).

The action evaluates the codebase against `xoras.config.json`:
1. **Performance Budget:** Flags latency drift $> 15\%$.
2. **Security Budget:** Fails closed if any hardcoded secret is detected.
3. **Architecture Budget:** Alerts when dependency counts exceed thresholds.

You can inspect the complete attestation receipts in the **GitHub Actions Step Summary**.
