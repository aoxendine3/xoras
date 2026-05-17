class PromptGuard {
    constructor() {
        this.maxPayloadLength = 8192;
        this.forbiddenPatterns = [
            /ignore all previous instructions/i,
            /you are now a/i,
            /dan mode/i,
            /system override/i,
            /base64_decode/i,
            /eval\(/i
        ];
    }

    audit(prompt) {
        if (!prompt || typeof prompt !== 'string') {
            return { safe: true, sanitized: '', blockedReason: null };
        }

        if (prompt.length > this.maxPayloadLength) {
            return {
                safe: false,
                sanitized: prompt.substring(0, this.maxPayloadLength),
                blockedReason: 'PAYLOAD_LENGTH_EXCEEDED'
            };
        }

        for (const pattern of this.forbiddenPatterns) {
            if (pattern.test(prompt)) {
                return {
                    safe: false,
                    sanitized: '[BLOCKED_PROMPT_INJECTION]',
                    blockedReason: 'ADVERSARIAL_PATTERN_MATCH'
                };
            }
        }

        return { safe: true, sanitized: prompt, blockedReason: null };
    }
}

module.exports = new PromptGuard();
