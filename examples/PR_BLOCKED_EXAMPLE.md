# Example: The Enforced Block PR

**Scenario:** A mature engineering team has graduated from the 30-Day Pilot and transitioned XORAS into `ENFORCEMENT` mode to strictly protect their institutional baseline. An engineer submits a PR that introduces 19 new unnecessary dependencies (bloat).

Because XORAS is running in `ENFORCEMENT` mode, the GitHub Action **fails the build** and prevents the PR from merging, enforcing architectural discipline.

---

### GitHub Step Summary Output:

# 🛡️ XORAS Engineering Integrity
| Signal | Status |
| --- | --- |
| Integrity Score | 75/100 |
| Security Drift | ✅ Healthy |
| Performance Drift | ✅ Healthy |
| Stability | ❌ At Risk |
| Recommendation | **Review Required** |

### Prevented Risks:
- ❌ Dependency growth (+19 packages) exceeds limits

### Remediation:
Please review the identified architectural drifts against the `xoras.config.json` baseline. Current Mode: **ENFORCEMENT** (Release Blocked).

---
**The Result:** The PR is blocked. The engineer removes the bloated dependencies (e.g., swapping `lodash` and `moment` for native JS methods) and pushes a clean architecture, preserving the health of the codebase.
