# XORAS: GitHub Release Integrity Auditor

XORAS is a technical governance tool designed to verify the security and integrity of GitHub release candidates. It performs automated static analysis on workflows, build artifacts, and secret patterns to prevent configuration-related failures.

## Core Features
- **Workflow Security**: Identifies unpinned third-party actions and high-risk triggers.
- **Secret Scanning**: High-fidelity regex patterns for detecting hardcoded tokens and API keys.
- **Environment Forecasting**: Validates the presence of required environment variables locally before commit.
- **Pipeline Auditing**: Detects brittle installation patterns and cache poisoning risks.

## Installation
```bash
npm install -g xoras
```

## Usage
### Local Audit
To run a pre-commit integrity audit:
```bash
xoras local
```

### GitHub Action Integration
Add the following to your `.github/workflows/audit.yml`:
```yaml
- uses: aoxendine3/xoras@main
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

## Technical Architecture
XORAS operates in a tiered execution model:
1. **Edge Sentry**: High-speed local pre-commit checks.
2. **Workflow Auditor**: Deep analysis of GitHub Action configurations.
3. **Condition Forecaster**: Environment variable and dependency validation.

---
*XORAS is an engineering-first tool for release governance.*
