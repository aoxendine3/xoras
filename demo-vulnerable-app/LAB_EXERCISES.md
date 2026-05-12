# XORAS Synthetic Regression Lab
## Developer Exercise: "Breaking the Baseline"

Welcome to the XORAS Integrity Lab. This environment is designed for developers to test the limits of our governance engine. Your goal is to intentionally inject "Release Drift" and observe how XORAS detects and reports it in your CI pipeline.

### Exercise 1: The Performance Sabotage
**Goal**: Trigger a Latency Regression warning.
1.  Open `server.js`.
2.  In the `/order` endpoint, add a manual delay:
    ```javascript
    await new Promise(resolve => setTimeout(resolve, 500)); // Inject 500ms lag
    ```
3.  Commit and push.
4.  **Observe**: Check the GitHub Step Summary. XORAS will calculate the drift against your 15ms baseline and flag a **Critical Performance Regression**.

---

### Exercise 2: The Credential Leak
**Goal**: Trigger a Security Integrity block.
1.  Create a new file `secrets.js`.
2.  Add a mock credential:
    ```javascript
    const AWS_KEY = "MOCK_AKIA_EXAMPLE_1234567890"; // High-entropy pattern
    ```
3.  Commit and push.
4.  **Observe**: XORAS will intercept the high-entropy string and report **1 Exposed Secret Detected**.

---

### Exercise 3: Architectural Bloat
**Goal**: Trigger a Dependency Warning.
1.  Install a heavy, unnecessary package:
    ```bash
    npm install lodash moment --save
    ```
2.  Commit and push.
3.  **Observe**: XORAS will detect the package count drift and flag it as **Architectural Bloat**.

---

## Why This Matters
Institutional release confidence isn't about "perfection"—it's about **Visibility**. By running these exercises, you are verifying that your "Safety Net" is actually operational.

**Next Step**: Learn to write your own custom policies in `xoras.config.json`.
