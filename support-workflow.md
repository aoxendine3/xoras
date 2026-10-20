# XORAS: Pilot Support Workflow

To maintain high-fidelity trust during the 30-day pilot, we provide high-touch, founder-led support for the first 30 engineering teams.

## 1. The Communication Channel
**Primary Channel:** [Discord / Slack]
**Workspace Name:** XORAS Engineering Integrity
**Dedicated Channel:** `#pilot-[company-name]`

Every pilot team receives a private, dedicated support channel. This is where we:
- Handle initial `xoras.config.json` calibration.
- Review weekly integrity reports together.
- Suppress false positives in real-time.
- Gather feature requests for the Enforcement transition.

---

## 2. Onboarding Hand-off (Day 1)
As soon as the Pilot Intake form is submitted:
1. **Invite the Engineering Lead** to the XORAS Slack/Discord.
2. **Post the Welcome Message**:
   > "Welcome [Name]! Excited to help [Company] build release confidence. I've initialized your private channel here. Have you had a chance to drop the GitHub Action into your pilot repo yet?"
3. **Calibrate the Baseline**: Review their first 3 PR summaries together to ensure the thresholds are tuned correctly for their specific stack.

---

## 3. High-Touch Calibration (Days 1–7)
The first week is about **Signal Tuning**.
- **Issue**: XORAS flags a legacy dependency as "Bloat."
- **Response**: founder/operator manually reviews and adds the package to the `ignore` list or adjusts the threshold in the team's config.
- **Goal**: Zero noise by Day 7.

---

## 4. The Weekly Integrity Sync (Every 7 Days)
Every Friday, the XORAS operator (you) reviews the `WEEKLY_REPORT.md` with the pilot lead.
- **Duration**: 10–15 minutes.
- **Focus**: "What did XORAS catch this week that CI would have missed?"
- **ROI Capture**: Document every prevented latency drift or secret leak as a "Pilot Success Metric."

---

## 5. Escalation & Bug Reports
If a pilot team encounters a false positive or an engine error:
- **SLA**: <2 hour response time during business hours.
- **Remediation**: Immediate config patch or bug fix pushed to `xoras/core`.

---
**The goal is to make the pilot feel like a partnership, not just another piece of software.**
