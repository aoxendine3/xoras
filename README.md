# XORAS | Xero-knowledge Operational Release Audit System

Automated engineering guardrails for security, quality, and performance.

## Intelligence Core Architecture
XORAS operates on a tiered intelligence model, routing tasks between local and cloud environments to maximize efficiency and security.

### 1. Local Edge (Tier 1 - 3B Logic)
- **Function**: Pre-commit security and syntax gating.
- **Location**: Local Git Hook (`scripts/local_audit.js`).
- **Goal**: Intercept secrets and low-level regressions before they reach the repository.

### 2. Cloud Reasoning (Tier 2/3 - 12B/120B Logic)
- **Function**: Deep logical audit, Registry Finality, and Strategic Strategy.
- **Location**: GitHub Actions.
- **Goal**: Enforce deterministic governance on every release candidate.

## Installation

### Local Setup
Initialize the local edge auditor:
```bash
node scripts/install_hooks.js
```

### GitHub Setup
Add XORAS to your workflow:
```yaml
- name: XORAS Integrity
  uses: aoxendine3/xoras/action@main
```

## Documentation
View the full documentation at [https://aoxendine3.github.io/xoras/](https://aoxendine3.github.io/xoras/)
