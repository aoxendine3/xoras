# XORAS: Engineering Integrity Management

Turn release anxiety into release confidence. 

XORAS is the release confidence layer sitting between your CI and production. It analyzes pull requests for architectural bloat, performance drift, and security regressions *before* they merge—without blocking your engineers.

## The Problem: Deployment Drift
In fast-moving engineering teams:
* Regressions slip through code review.
* CI passes, but the architecture silently drifts.
* Teams lose confidence in deployments due to "regression fatigue."
* Performance degradation accumulates over months.

## The Solution: XORAS Release Integrity
XORAS detects release drift early and surfaces risky PRs instantly.

* **Release drift is visible** inside the GitHub PR.
* **Integrity trends are measurable** via the Governance Dashboard.
* **Remediation becomes faster** because drift is caught before production.
* **Enforcement becomes data-driven**, transitioning from advisory warnings to strict policy gates over time.

---

## 🚀 The 30-Day Release Integrity Pilot
The fastest way to build release confidence is through our **Advisory-First Pilot**. 

We do not believe in blocking builds on day one. Enterprise tooling fails when it introduces immediate organizational friction. Instead, XORAS runs in **Advisory Mode**.

**During the 30-Day Pilot, you get:**
1. **Zero-Friction Install**: A 3-minute setup using `xoras/action@v1`.
2. **Advisory Mode**: XORAS will analyze your PRs, generate beautiful Step Summaries, and flag architectural drift—but it will *never* fail a build.
3. **Prevented Incidents Tracking**: We measure exactly what XORAS catches (latency spikes, missing security headers, dependency bloat).
4. **Weekly Governance Reports**: Data-driven ROI showing exactly how your engineering integrity is improving.

[**Start Your 30-Day Pilot**](#) | [**Book a Demo**](#)

---

## See It In Action (The "Wow" Moment)

XORAS doesn't require a dashboard to provide value. The product surfaces exactly where your engineers live: **The Pull Request.**

* [👀 View an Example Warning PR](../examples/PR_WARNING_EXAMPLE.md) (Advisory Mode)
* [👀 View an Example Blocked PR](../examples/PR_BLOCKED_EXAMPLE.md) (Enforcement Mode)

### The Setup (3 Minutes)
Add this to `.github/workflows/integrity.yml` in your repository:

```yaml
name: Release Integrity

on:
  pull_request:

jobs:
  integrity:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: XORAS Release Integrity
        uses: xoras/action@v1
        with:
          mode: ADVISORY
```

That's it. You now have deterministic release governance.

---

## Why Teams Trust XORAS

* **Local-First & CI-Native**: No mandatory cloud dependencies or intrusive agents. XORAS runs entirely inside your existing CI pipeline.
* **Advisory-First**: Roll out governance without engineering rebellion. 
* **Data-Driven Enforcement**: Once the team trusts the signal, flip `mode: ENFORCEMENT` to strictly gate releases based on your institutional baseline.

[**Technical Architecture & Security**](./ARCHITECTURE.md) | [**View the Synthetic Regression Lab**](../demo-vulnerable-app/)
