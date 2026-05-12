# XORAS: Release Integrity Governance Infrastructure (RIGI)

> **"Turn Engineering Policy into Deterministic Law."**

XORAS is not a scanner. It is not a CI tool. It is **Release Integrity Governance Infrastructure (RIGI)** designed for organizations that require measurable reliability in their software delivery lifecycle.

---

## 🏛 The Vision: Institutional Governance at the Edge

Modern engineering teams suffer from "Policy Drift"—where security, performance, and architecture standards are documented in wikis but ignored in code. XORAS bridges this gap by enforcing **Identity & Access Governance (IAG)** directly within the release pipeline.

### Why XORAS?
*   **Deterministic Enforcement**: Releases fail by default unless they meet cryptographically verified governance profiles.
*   **Immutable Audit Ledger**: Every decision, bypass, and approval is written to a tamper-evident ledger signed by your Integrity Key.
*   **Scoped Authority**: Move beyond simple "Admin" roles. Define Trust Anchors for `SECURITY`, `PERFORMANCE`, and `ARCHITECTURE`.
*   **Governance-at-the-Edge**: No centralized SaaS dependency. XORAS runs in your CI, preserving your code's integrity.

---

## 🚀 Quickstart: Governance-in-a-Box

### 1. Initialize Your Authority
XORAS uses an `AuthorityRegistry.json` to define who has the power to grant exceptions.
```bash
npx xoras init
```

### 2. Run the Governance Gate
Integrate this into your CI/CD pipeline (GitHub Actions, GitLab, etc.).
```bash
npx xoras gate --profile production
```
*If the scores don't meet the threshold, the build dies. No exceptions—unless they are signed.*

### 3. Grant a Signed Exception
When a release must go out despite a policy violation, an authorized **Trust Anchor** must sign the exception.
```bash
xoras approve <REQUEST_ID> <ANCHOR_ID>
```

### 4. Visualize the Integrity Ledger
Launch the Executive Governance Dashboard to see real-time authority distribution and audit trails.
```bash
npx xoras dashboard
```

---

## 🛠 Architectural Components

| Component | Description |
| :--- | :--- |
| **Integrity Ledger** | The immutable source of truth for all governance events. |
| **Authority Registry** | Identity & Access Governance (IAG) layer defining Trust Anchors. |
| **Integrity Key** | HMAC/Asymmetric key used to sign ledger entries. |
| **Governance Profiles** | Declarative definitions of "What Good Looks Like." |

---

## 📈 The Road to v2.0
- [x] Identity & Access Governance (IAG)
- [x] Scoped Exception Signing
- [ ] Asymmetric RSA/ECDSA Non-Repudiation
- [ ] Hardware Security Module (HSM) Integration
- [ ] Multi-Repo Policy Synchronization

---

**XORAS** is built for the era of engineering integrity. [Join the Governance Revolution](mailto:governance@xoras.io).
