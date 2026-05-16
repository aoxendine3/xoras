# Abstract Syntax Tree (AST) Drift Trapping
**Deterministic Code Verification & Normalization Engine**

## 1. Problem Statement
In Next.js 15 App Router applications, route parameters (`params` and `searchParams`) have transitioned to asynchronous promises. Legacy codebases that attempt synchronous destructuring (`const { slug } = params`) trigger build failures and runtime exceptions during static site generation (SSG) and server-side rendering (SSR).

## 2. Tokenization & AST Traversal
The XORAS Level-4 pre-commit sentry parses JavaScript and TypeScript source files into an Abstract Syntax Tree (AST) using Babel and TypeScript compiler APIs.

```text
[Source File: page.tsx] ➔ [AST Tokenization] ➔ [Visitor Pattern Scan] ➔ [Asynchronous Mutation] ➔ [Clean Diff Output]
```

### 2.1 The Visitor Verification Algorithm
When traversing the AST, our sentry identifies functional components and page handlers:
1.  **Locate Route Handlers:** Matches file path patterns against Next.js dynamic routing conventions (e.g., `/app/**/[...slug]/page.tsx`).
2.  **Inspect Parameter Declarations:** Checks if the first argument (`{ params }`) is destructured synchronously.
3.  **Inject Asynchronous Trapping:** Wraps parameter usage in `await params` and ensures the enclosing function is explicitly typed as `async`.

## 3. Verifiable Exit Codes
If an AST modification is required, the sentry writes the exact git diff to disk and halts the commit sequence with a POSIX exit code:
*   `Exit Code 0`: Verification passed. Zero drift detected.
*   `Exit Code 1`: AST anomaly trapped. Remediation diff generated.
