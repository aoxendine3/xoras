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
  /disregard all prior instructions/i
];

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
      cleaned = cleaned.replace(pattern, '[BLOCKED]');
    });
    if (cleaned.length > 8000) {
      cleaned = cleaned.substring(0, 8000) + '\n[TRUNCATED - INPUT TOO LONG]';
    }
    return cleaned;
  }

  static isSafe(input) {
    if (typeof input !== 'string') return true;
    return !DANGEROUS_PATTERNS.some(pattern => pattern.test(input));
  }

  static audit(input) {
    const hash = crypto.createHash('sha256').update(input).digest('hex').substring(0, 16);
    const timestamp = new Date().toISOString();
    const safe = this.isSafe(input);

    console.log(`[PROMPT_GUARD] ${timestamp} | Hash: ${hash} | Safe: ${safe}`);

    if (!safe) {
      console.log(`[PROMPT_GUARD] warning: potential injection attempt blocked`);
      const sanitized = this.sanitize(input);
      try {
        const memoryLedger = require('../memory_ledger.cjs');
        if (memoryLedger.logSecurityEvent) {
          memoryLedger.logSecurityEvent('PROMPT_INJECTION_BLOCKED', hash, sanitized, 0);
        }
      } catch (e) {
        // Fallback if ledger not fully initialized
      }
      return { safe: false, sanitized };
    }
    return { safe: true, sanitized: input };
  }

  static sanitizeOutput(output) {
    if (typeof output !== 'string') return output;
    let cleaned = output;
    DANGEROUS_PATTERNS.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '[FILTERED_OUTPUT]');
    });
    return cleaned;
  }
}

module.exports = PromptGuard;
