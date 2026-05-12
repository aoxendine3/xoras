# Example: The Advisory Warning PR

**Scenario:** An engineer submits a PR that introduces an unoptimized linear scan (simulating a 53% latency drift) and accidentally commits a mock AWS key.

Because XORAS is running in `ADVISORY` mode, the GitHub Action **does not fail the build**. Instead, it generates a beautiful, non-blocking Step Summary that surfaces the architectural drift for the reviewer.

---

### GitHub Step Summary Output:

# 🛡️ XORAS Engineering Integrity
| Signal | Status |
| --- | --- |
| Integrity Score | 60/100 |
| Security Drift | ❌ Block Candidate |
| Performance Drift | ⚠️ Warning |
| Stability | ❌ At Risk |
| Recommendation | **Review Required** |

### Prevented Risks:
- ❌ Latency regression (+53%)
- ❌ 1 exposed secrets detected

### Remediation:
Please review the identified architectural and performance drifts against the `xoras.config.json` baseline. Current Mode: **ADVISORY** (Policies are non-blocking).

---
**The Result:** The engineering team catches the latency drift *before* it merges into production, without feeling like the tooling is aggressively punishing them. Trust is built.
