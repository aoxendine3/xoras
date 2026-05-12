# XORAS: 3-Minute Walkthrough Script

**Goal:** Show how XORAS reduces release uncertainty in under 3 minutes.
**Tone:** Calm, operational, credible, engineering-first. 
**Pacing:** Steady. Let the Step Summaries do the heavy lifting.

---

## Minute 0:00–0:30 | The Problem
**[Visual: Screen recording starts on a standard, open GitHub Pull Request. It has green checkmarks from standard CI tests (e.g., Jest, ESLint).]**

**Voiceover:** 
"Most release failures aren’t caused by obvious CI failures. They come from silent drift—performance regressions, dependency bloat, or configuration mistakes that pass right through standard testing and fragmented tooling."

"By the time these regressions hit production, teams lose confidence in their deployments, and remediation becomes expensive. Today, I'm going to show you how XORAS sits between your CI and production to catch that drift early, without blocking your engineering velocity."

---

## Minute 0:30–1:15 | The Advisory Pilot
**[Visual: Switch to the repository's `.github/workflows/integrity.yml` file, highlighting the `mode: ADVISORY` line.]**

**Voiceover:**
"XORAS is designed to build trust first. It installs in about 3 minutes as a standard GitHub Action. The most important part of our architecture is right here: **Advisory Mode**."

"We know that introducing strict governance on day one creates organizational friction. XORAS starts in Advisory Mode, meaning it will measure release drift and analyze every pull request, but it will never fail a build or block your engineers from merging."

---

## Minute 1:15–2:00 | The Demo PR
**[Visual: Switch to the "Example Warning PR" in the `demo-vulnerable-app`. Scroll down to the beautiful XORAS Step Summary in the PR comments.]**

**Voiceover:**
"Let's look at what the engineers actually see. Here is a PR where a developer introduced an unoptimized database query and accidentally committed a placeholder API key."

"Instead of reading through logs, the engineering leader gets this Step Summary directly in the PR. You can see our Integrity Score dropped to 60. More importantly, XORAS caught a 53% latency regression and an exposed secret."

"Because we are in Advisory mode, the build still passes. But the risk is now visible, measurable, and actionable *before* it merges."

---

## Minute 2:00–2:40 | Governance Dashboard
**[Visual: Switch to the XORAS Governance Dashboard (`http://localhost:3000`). Briefly scroll to show the Integrity Score, Prevented Incidents, and Latency Chart.]**

**Voiceover:**
"While the engineers live in GitHub, engineering leadership needs longitudinal visibility. This is the Governance Dashboard."

"It tracks your institutional baseline over time. You can see your overall integrity score, the exact number of prevented incidents, and your architectural drift. This gives leadership the data they need to understand release confidence trends over time, without having to dig through individual repositories."

---

## Minute 2:40–3:00 | Close
**[Visual: Switch back to the GitHub Action YAML, and change `mode: ADVISORY` to `mode: ENFORCEMENT`. End on the XORAS GitHub repo or Landing Page.]**

**Voiceover:**
"The goal isn’t to add friction to CI. The goal is to make release integrity measurable, so that when you are finally ready to flip this switch to 'Enforcement' mode, it is a data-driven decision, not a guess."

"XORAS is lightweight, CI-native, and ready for your 30-Day Pilot. Check out the documentation below to get started."

---
**[End Recording]**
