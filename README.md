# XORAS | Release Governance Infrastructure

Automated engineering guardrails for security, quality, and performance.

## Overview
XORAS is a GitHub Action designed to provide deterministic governance for high-velocity engineering teams. It detects security risks (secrets), performance regressions (latency), and architectural drift (dependency bloat) at the point of pull request.

## Features
- **Secret Protection**: Prevents exposed credentials from hitting production.
- **Performance Gating**: Tracks latency regressions in real-time.
- **Architectural Audit**: Stops unauthorized dependency growth.
- **Local-First**: Runs entirely within your CI runner. No code leaves your environment.

## Installation
Add XORAS to your GitHub Actions workflow:

```yaml
- name: XORAS Integrity
  uses: aoxendine3/xoras/action@main
```

## Documentation
View the full documentation at [https://aoxendine3.github.io/xoras/](https://aoxendine3.github.io/xoras/)
