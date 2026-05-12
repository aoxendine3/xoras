# XORAS Release Integrity Action

Turn release anxiety into release confidence. 

XORAS is an Engineering Integrity Management platform that analyzes your pull requests for architectural bloat, performance drift, and security regressions *before* they merge. 

This action is optimized for a **30-Day Advisory Pilot**. It runs in your CI, analyzes your drift, and generates beautiful PR feedback without blocking your engineers.

## Fastest Possible Install (3 Minutes)

Add this workflow to `.github/workflows/integrity.yml` in your repository:

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

## The Output (Beautiful PR Feedback)

XORAS hooks directly into GitHub Step Summaries to provide your engineering leaders with a clear, concise readout of release health:

| Signal            | Status          |
| ----------------- | --------------- |
| Integrity Score   | 82/100          |
| Security Drift    | ✅ Healthy      |
| Performance Drift | ⚠️ Warning      |
| Stability         | ⚠️ Degraded     |
| Recommendation    | **Review Required** |

**Prevented Risks:**
- ⚠️ Latency regression (+41%)
- ❌ Dependency growth (+19 packages) exceeds limits

## Configuration (xoras.config.json)

By default, XORAS uses institutional baselines. To customize thresholds, add a `xoras.config.json` to the root of your repo:

```json
{
  "budgets": {
    "performance": { "max_latency_drift_percent": 15, "block_threshold_percent": 25 },
    "security": { "allowed_exposed_secrets": 0 },
    "architecture": { "max_dependencies": 100, "bloat_warning_threshold": 45 }
  }
}
```

## Modes
* `ADVISORY` (Default) - Runs checks and generates the PR summary, but will never fail your build. The perfect starting point for building trust.
* `ENFORCEMENT` - Fails the workflow if any `block_threshold` limits are breached. Use this when your team is ready for strict governance.
