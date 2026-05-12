# XORAS: Technical Disclosures & Scope

To maintain the **Honesty Standard**, this document outlines the current technical boundaries and architectural limitations of the XORAS system.

## 1. Cryptographic Scope
- **XORAS is not a cryptographic breakthrough.** It utilizes industry-standard SHA-256 pinning and regular expression matching. It does not implement new cryptographic primitives or zero-knowledge proofs.

## 2. Infrastructure Mutability
- **XORAS is not immutable infrastructure.** It audits mutable configurations (YAML, JSON, JS). While it enforces pinning, the auditor itself operates within a mutable execution environment (GitHub Runner or local OS).

## 3. Governance Context
- **XORAS is not a replacement for enterprise GRC platforms.** It is a developer-focused CI/CD governance tool. It does not provide the legal, regulatory, or broad organizational compliance mapping offered by full-scale GRC (Governance, Risk, and Compliance) suites.

## 4. Analysis Depth
- **XORAS is not a deep behavioral analysis engine.** Current analysis is limited to **Static Analysis**. It identifies patterns in code and configuration but does not monitor runtime execution behavior (e.g., eBPF, syscall monitoring) for anomalous activity.

## 5. Tamper Resistance
- **XORAS does not yet provide independently verifiable tamper resistance.** Audit logs are currently stored locally or in a private repository. If the execution environment (GitHub Action runner) is fully compromised at the root level, audit logs could be suppressed or modified before transmission.

---
*Last Updated: 2026-05-12*
