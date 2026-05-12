# XORAS Institutional Pilot Agreement
## Version 1.0.0 (Q2 2026)

This agreement defines the technical and operational boundaries for the **XORAS 30-Day Release Integrity Pilot**. 

---

### 1. The Zero-Knowledge Mandate
XORAS is built on the principle of **Sovereign Privacy**. 
*   **Local Execution**: All code analysis, secret scanning, and latency tracking occur locally within the Participant's CI runner (GitHub Actions).
*   **Data Sovereignty**: No source code, intellectual property, or raw telemetry is ever transmitted to XORAS-controlled infrastructure.
*   **Metadata Finality**: XORAS only receives high-level integrity signatures required to populate the participant's private Governance Dashboard.

### 2. The 30-Day Integrity Lifecycle
*   **Phase 1: Calibration (Day 1-7)**: Participants operate in `mode: ADVISORY`. XORAS gathers baseline metrics for latency, dependency counts, and security findings.
*   **Phase 2: Governance (Day 8-25)**: Participants refine thresholds in `xoras.config.json`. XORAS provides real-time "Release Drift" feedback in PR Step Summaries.
*   **Phase 3: Finality Audit (Day 26-30)**: XORAS generates the **Institutional ROI Report**, quantifying the risks intercepted (secrets, regressions) during the pilot.

### 3. Institutional Commitment
*   **XORAS Support**: Participant receives direct priority support via the #pilot-vanguard channels on Slack/Discord.
*   **Participant Feedback**: Participant agrees to provide two technical feedback sessions (Mid-Pilot and Finality) to refine the governance schema.
*   **Conversion**: Upon successful completion of the ROI Audit, the Participant may transition to the **Sovereign Core** tier ($499/mo) or provide a public case study/testimonial in lieu of the first 3 months of service fees.

### 4. Technical SLOs
*   **Performance Impact**: XORAS integrity checks are guaranteed to add < 10 seconds to any CI pipeline execution.
*   **Accuracy**: Zero-false-positive secret detection via institutional high-entropy regex patterns.

---

**Signed for XORAS**: Anthony Oxendine, Founder
**Signed for Participant**: ____________________
