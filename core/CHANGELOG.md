# XORAS: INSTITUTIONAL RELEASE CHANGELOG

## [v1.13.1] - 2026-05-11
### FIXED
*   **Scoring Jitter**: Implemented a **Stability Floor (0.1ms)** to prevent micro-variations in hardware latency from triggering false-positive regressions.
*   **Simulation Drift**: Fixed a bug where simulations induced artificial latency drift by not referencing the baseline.

## [v1.13.0] - 2026-05-11
### ADDED
*   **Policy-as-Code**: Externalized governance thresholds to `xoras.config.json`.
*   **Self-Healing Suite**: Introduced `xoras repair` for automated ledger recovery.
*   **Error Proofing**: Global try-catch boundaries for fail-closed operational security.

## [v1.12.0] - 2026-05-11
### ADDED
*   **Governance Simulation Framework**: Introduced `xoras simulate [PROFILE]` for failure rehearsal.
*   **Context-Aware Auditing**: Support for multi-repo target paths.

---
**XORAS: THE SINGLE TIMELINE OF ENGINEERING INTEGRITY.**
