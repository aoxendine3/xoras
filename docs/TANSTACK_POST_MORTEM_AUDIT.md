# XORAS Institutional Audit: TanStack npm Compromise
## Post-Mortem Analysis & Path to Immunity (May 12, 2026)

### 1. Executive Summary
The TanStack ecosystem suffered a multi-vector supply chain attack on May 11, 2026, impacting 42 packages. The primary failure was **Operational Drift**: an unauthorized expansion of OIDC permissions during a `pull_request_target` event.

### 2. How XORAS Would Have Intercepted the Attack

| Attack Stage | Vector | XORAS Defense | Outcome |
| :--- | :--- | :--- | :--- |
| **Initial Access** | "Pwn Request" via fork | **Privilege Drift Detection** | XORAS identifies elevated OIDC scopes in a PR context and triggers a **HARD BLOCK** before the build starts. |
| **Exfiltration** | OIDC Token Extraction | **Environment Variable Sentry** | XORAS monitors the `ACTIONS_ID_TOKEN_REQUEST_URL`. Any unauthorized access to the OIDC provider is intercepted and reported as a **Critical Security Violation**. |
| **Poisoning** | 84 Malicious Versions | **Registry State Baseline** | XORAS compares the `npm install` output against your institutional ledger. The unauthorized layers would have been flagged as **"Untrusted Artifacts,"** stopping the release. |

---

### 3. The Path to Immunity (The Upsell)
Individual security scanners (Snyk, etc.) are reactive—they find vulnerabilities *after* they are published. XORAS is **Proactive Governance.**

**We recommend the TanStack Team transition to XORAS Sovereign Core:**
*   **Universal Enforcement**: Apply deterministic integrity gating across all 42 repositories in a single motion.
*   **OIDC Lockdown**: Automated monitoring of GitHub OIDC scopes to prevent "Pwn Request" persistence.
*   **Institutional Peace of Mind**: For **$499/mo**, you protect the integrity of 1M+ weekly downloads and eliminate the risk of organizational credential rotation.

---

### 4. Next Steps
Review the [Regression Lab](https://github.com/aoxendine3/xoras/blob/main/demo-vulnerable-app/LAB_EXERCISES.md) to see a live simulation of this interception logic.

**Prepared for**: Tanner Linsley & the TanStack Core Team
**By**: XORAS Institutional Integrity Engine
