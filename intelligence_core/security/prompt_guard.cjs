// intelligence_core/security/prompt_guard.cjs
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

let DANGEROUS_PATTERNS = [
  /system\s*:\s*ignore|override|forget|new instructions/i,
  /DAN|do anything now|jailbreak/i,
  /<|>|[\[\]]{2,}|```/g,
  /(?:you are now|act as|pretend you are|role-play)/i,
  /base64|encoded|hex|rot13/i,
  /repeat this|ignore previous|new rules/i,
  /disregard all prior instructions/i,
  // High-Fidelity Enterprise Guardrails:
  /(?:checkout|purchase|pay|buy|transfer|invoice|outbound transaction|debit|credit card)/i,
  /(?:download|install|allocate|expand|cache buffer|payload)/i
];

const MAX_MEMORY_INSTALL_BYTES = 1073741824; // 1 GB Memory Allocation Ceiling

try {
  const blocklistPath = path.join(__dirname, 'blocklist.json');
  if (fs.existsSync(blocklistPath)) {
    const data = JSON.parse(fs.readFileSync(blocklistPath, 'utf8'));
    if (Array.isArray(data.dangerous_patterns)) {
      DANGEROUS_PATTERNS = data.dangerous_patterns.map(p => new RegExp(p, 'i'));
    }
  }
} catch (e) {
  // Use default patterns
}

class PromptGuard {
  static sanitize(input) {
    if (typeof input !== 'string') return input;
    let cleaned = input;
    DANGEROUS_PATTERNS.forEach(pattern => {
      cleaned = cleaned.replace(pattern, 'BLOCKED_POLICY_SENTRY');
    });
    if (cleaned.length > 8000) {
      cleaned = cleaned.substring(0, 8000) + '\nTRUNCATED - INPUT TOO LONG';
    }
    return cleaned;
  }

  static isSafe(input) {
    if (typeof input !== 'string') return true;
    return !DANGEROUS_PATTERNS.some(pattern => pattern.test(input));
  }

  static checkMemoryAllocation(requestedBytes) {
    const bytes = Number(requestedBytes);
    if (isNaN(bytes)) return false;
    return bytes <= MAX_MEMORY_INSTALL_BYTES;
  }

  static audit(input, requestedBytes = 0) {
    const hash = crypto.createHash('sha256').update(input).digest('hex').substring(0, 16);
    const timestamp = new Date().toISOString();
    let safe = this.isSafe(input);
    let reason = "SAFE";

    if (requestedBytes > MAX_MEMORY_INSTALL_BYTES) {
      safe = false;
      reason = `EXCEEDED_MEMORY_CEILING_1GB (${requestedBytes} bytes requested)`;
    } else if (!safe) {
      reason = `INTERCEPTED_PROMPT_POLICY_VIOLATION`;
    }

    console.log(`timestamp: ${timestamp} | hash: ${hash} | safe: ${safe} | status: ${reason}`);

    if (!safe) {
      console.log(`audit: blocked transaction/injection attempt (${reason})`);
      const sanitized = this.sanitize(input);
      try {
        const memoryLedger = require('../memory_ledger.cjs');
        if (memoryLedger.logSecurityEvent) {
          memoryLedger.logSecurityEvent('SECURITY_POLICY_INTERCEPTION', hash, `${reason}: ${sanitized}`, 0);
        }
      } catch (e) {}
      return { safe: false, reason, sanitized: 'BLOCKED_SECURITY_SENTRY' };
    }
    return { safe: true, reason, sanitized: input };
  }

  static sanitizeOutput(output) {
    if (typeof output !== 'string') return output;
    let cleaned = output;
    DANGEROUS_PATTERNS.forEach(pattern => {
      cleaned = cleaned.replace(pattern, 'FILTERED_ENTERPRISE_OUTPUT');
    });
    return cleaned;
  }
}

module.exports = PromptGuard;
