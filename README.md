# XORAS: Engineering Integrity Management

![XORAS Header](https://raw.githubusercontent.com/aoxendine3/xoras/main/docs/assets/header_v2.png)

**Turn release anxiety into release confidence.** 

XORAS is the release integrity layer sitting between your CI and production. It analyzes pull requests for architectural bloat, performance drift, and security regressions *before* they merge.

---

## 📽️ 3-Minute Walkthrough
See how XORAS catches a latency regression and an exposed secret in real-time.

![XORAS Pilot Walkthrough Video](/Users/ajoxendine68/.gemini/antigravity/brain/1171459a-9704-4ce6-bed1-2cc1df4b4610/xoras_pilot_walkthrough_1778548623937.webp)

---

## 🚀 The 3-Minute Install
Add XORAS to your repository in **Advisory Mode** to start measuring drift without blocking your engineers.

```yaml
- name: XORAS Release Integrity
  uses: aoxendine3/xoras/action@main
  with:
    mode: ADVISORY
```

---

## 🛠️ The 30-Day Advisory Pilot
The fastest way to build release confidence is through our frictionless, no-blocking pilot.

* **Week 1-2**: Establish release baseline and measure silent drift.
* **Week 3**: Review Weekly Integrity Reports and tune thresholds.
* **Week 4**: Transition high-confidence signals to enforcement mode.

👉 [**View the Pilot Onboarding Checklist**](./docs/PILOT_ONBOARDING.md)

---

## 🧪 The Proof Environment
Don't take our word for it. Explore the **Synthetic Regression Lab** to see exactly how XORAS detects:
* **+53% Latency Drift**
* **Exposed Secrets**
* **Architectural Dependency Bloat**

👉 [**Explore the Demo Repo**](./demo-vulnerable-app/)

---

## ⚖️ Governance Maturity
XORAS scales with your organization.
1. **Advisory Mode**: Frictionless data gathering and signal building.
2. **Enforcement Mode**: Deterministic release gating to protect your institutional baseline.

[**Technical Docs**](./docs/README.md) | [**Report Template**](./docs/WEEKLY_REPORT_TEMPLATE.md) | [**GitHub Action**](./action/)
