# XORAS Case Study #01: Preventing Credential Leaks & Dependency Drift

## 📊 Summary
XORAS identified an exposed Stripe API token and three unpinned GitHub Actions during a standard Pull Request review.

## 🕒 Timeline
- **12:09 PM**: Developer commits new integration code with a hardcoded testing key.
- **12:10 PM**: XORAS Local Auditor flags high-entropy string in `scripts/local_audit.js`.
- **12:12 PM**: Developer ignores local warning and pushes to branch.
- **12:14 PM**: GitHub Action triggers. XORAS Deterministic Audit fails the build.
- **12:15 PM**: Audit report identifies:
    1.  **Secret Exposure**: High-entropy token in `stripe_integration.js`.
    2.  **Dependency Drift**: `actions/checkout@v4` used instead of immutable SHA.
- **12:20 PM**: Developer removes token, pins actions, and pushes fix.
- **12:22 PM**: Audit PASS. Merge approved.

## 🛡️ Findings & Remediation

### 1. Secret Exposure
- **Finding**: `sk_test_...` detected via Shannon Entropy Analysis (Entropy: 4.82).
- **Remediation**: Key moved to GitHub Secrets; local code refactored to use `process.env.STRIPE_SECRET`.

### 2. Dependency Drift
- **Finding**: `actions/checkout@v4` is mutable.
- **Remediation**: Pinned to `11bd71901bbe5b1630ceea73d27597364c9af683`.

## 💬 Developer Feedback
"The entropy check caught a token I thought I had stashed. The SHA-pinning was annoying at first, but knowing the build is now immutable gives us more confidence in our release integrity."

---
*Verified by XORAS Audit Orchestrator.*
