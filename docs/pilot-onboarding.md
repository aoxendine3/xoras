# XORAS: 30-Day Pilot Onboarding Flow

This document outlines the standard 30-day onboarding sequence for introducing XORAS into an engineering organization. 

The core philosophy of this pilot is **Advisory-First Rollout**. We do not believe in blocking engineering velocity on Day 1. The goal of the pilot is to gather data, build trust with the engineering team, and establish a baseline *before* any enforcement begins.

---

## Phase 1: Pre-Flight (Day 0)
**Goal:** Select the pilot environment and set initial baselines.

- [ ] **Select 1-2 Pilot Repositories:** Choose repositories with active development but moderate risk (e.g., internal microservices or tier-2 APIs). Do not start with the monolithic legacy core.
- [ ] **Establish Baseline Config:** Create the initial `xoras.config.json` in the root of the pilot repositories.
  ```json
  {
    "budgets": {
      "performance": { "max_latency_drift_percent": 15 },
      "security": { "allowed_exposed_secrets": 0 },
      "architecture": { "bloat_warning_threshold": 30 }
    }
  }
  ```

---

## Phase 2: Silent Observation (Days 1–14)
**Goal:** Deploy XORAS without creating organizational friction.

- [ ] **Install the GitHub Action:** Add the XORAS action to the pilot repositories.
  - **CRITICAL:** Ensure `mode: ADVISORY` is set.
- [ ] **Communicate to the Team:** Inform engineers they will start seeing XORAS Step Summaries on their PRs. Emphasize that these are *warnings only* and will not fail their builds.
- [ ] **Monitor the Output:** Leadership reviews the Step Summaries on PRs to see what XORAS is catching (e.g., latency drift, new dependencies). 

---

## Phase 3: The Baseline Calibration (Day 15)
**Goal:** Tune the thresholds based on real-world data to eliminate false positives.

- [ ] **Review the Governance Dashboard:** Leadership reviews the aggregated data over the first two weeks. 
- [ ] **Analyze Prevented Incidents:** Look at the warnings generated. Were they accurate? Were they helpful?
- [ ] **Tune the Config:** If the architectural bloat threshold was too strict and generated noise, adjust `bloat_warning_threshold` from `30` to `50` in `xoras.config.json`.
- [ ] **Engineering Feedback:** Ask 2-3 engineers how they felt about the Step Summaries. Adjust the verbosity if necessary.

---

## Phase 4: The Enforcement Transition (Day 30)
**Goal:** Transition from measuring release drift to actively protecting the institutional baseline.

- [ ] **Select High-Confidence Rules:** Choose 1-2 rules that the team agrees are critical and have zero false positives (e.g., Exposed Secrets, Missing Security Headers).
- [ ] **Enable Enforcement:** Update the GitHub Action to `mode: ENFORCEMENT`. 
- [ ] **Pilot Sign-Off:** Review the final 30-day report. Measure the total number of intercepted regressions and present the "Release Confidence ROI" to executive leadership.
- [ ] **Expansion Plan:** Map out the rollout schedule for the remaining tier-1 repositories.
