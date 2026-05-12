# XORAS Signal Quality Ledger (v1.0)

This document tracks the accuracy and usefulness of XORAS audit findings. This data is used to tune detection heuristics and reduce noise.

| Timestamp | Detection Type | Target | Useful? | False Positive? | Action Taken |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 2026-05-12 | Secret Exposure | sandbox_mock.js | Yes | No | Removed |
| 2026-05-12 | Dependency Drift | github-actions | Partial | No | Reviewed SHAs |
| 2026-05-12 | Workflow Security | .github/workflows | Yes | No | Pinned Actions |

## Heuristic Tuning Notes
- **Entropy (v1.0)**: Initial threshold set to 4.5. Monitor for "noisy" flags on long CSS/Base64 strings.
- **Deterministic Patterns**: Validated for destructuring and computed access. Accuracy at 100% in initial spectrum tests.

## Ignored Warnings
- List any recurring warnings that developers are consistently ignoring here.
