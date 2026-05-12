# XORAS Institutional Analysis: The TanStack "Pwn Request"
## How Deterministic Gating Blocks Transitive Poisoning

### 1. The Incident (May 11, 2026)
Attackers leveraged a `pull_request_target` misconfiguration to gain write-scoped OIDC tokens, allowing them to publish 84 malicious versions across the `@tanstack` ecosystem. 

### 2. The XORAS Interception Path
Standard scanners (Snyk, etc.) missed this because the "Vulnerability" didn't exist in a database—it was **Operational Drift**. 

**XORAS would have intercepted this at three specific points:**
1.  **Context Drift**: XORAS identifies the unauthorized elevation of OIDC scopes during the build phase and triggers a **HARD BLOCK**.
2.  **Registry Determinism**: XORAS maintains a "Golden State" of your npm/Docker registry. When the `pull_request_target` build attempted to pull an unverified layer, XORAS would have dropped the integrity score to **0/1**.
3.  **Entropy Sentry**: The exfiltration script used high-entropy regex patterns. XORAS’s secret scanner would have flagged the exfiltration attempt in real-time.

### 3. Conclusion: The Immune System for Open Source
XORAS is not a scanner; it is **Institutional Immunity**. By enforcing deterministic baselines, we turn "Invisible Drift" into "Visible Gating."

**Request a 5-min Walkthrough**: Join our [Support Channel](https://app.slack.com/client/T0B0Q10DYGG/C0AUU8V015M)
