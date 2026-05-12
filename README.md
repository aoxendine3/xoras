# XORAS: Release Drift Detection for GitHub

XORAS is a technical auditor designed to detect and prevent "Release Drift" within your CI/CD pipeline. It ensures that every release candidate is immutable, secure, and verifiably grounded before it reaches production.

## 🚀 The Wedge: Release Drift Detection
Standard CI tools focus on "Does it build?" XORAS focuses on "Is it safe to release?"
- **Dependency Drift**: Detects and enforces immutable SHA-pinning for GitHub Actions.
- **Credential Drift**: Detects exposed secrets using Pattern-based and Entropy-based analysis.
- **Environment Drift**: Validates required environment variables before deployment.

## 🛠️ Quick Start (10-Minute Setup)
1. **Install XORAS**:
```bash
npm install -g xoras
```

2. **Initialize**:
```bash
node scripts/setup_xoras.js
```

3. **Verify**:
```bash
npm run audit
```

## 📊 Documentation
- [Security Model](SECURITY_MODEL.md): Bounded Determinism (v1.0).
- [Case Study #01](docs/CASE_STUDY_01.md): Detecting Drift in Pull Requests.
- [Technical Disclosures](DISCLOSURES.md): Scope and Boundaries.

---
*XORAS: Hardening the gap between Build and Release.*
