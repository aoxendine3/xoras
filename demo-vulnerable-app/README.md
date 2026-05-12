# XORAS Deterministic Proof Environment

This is a deliberate "Vulnerable Demo App" used to showcase the capabilities of XORAS Release Integrity Governance. 

It simulates a modern Order Management API built with Express and SQLite, currently suffering from real-world delivery pressure.

## Purpose
This environment contains deterministic regressions in 4 categories:
1. **Performance**: Inefficient search logic in `server.js` causing latency drift.
2. **Security**: Exposed AWS credentials in `aws-config.js`.
3. **Architecture**: Redundant dependencies (lodash, moment, request) triggering bloat warnings.
4. **Governance**: Missing baseline security headers.

## See it in Action
Every PR to this repository triggers the `xoras/action`. You can see the governance feedback in the **GitHub Step Summary** of the actions tab.
