const crypto = require('crypto');

class MultiPlatformBridge {
    constructor(secretMap = {}) {
        this.secrets = {
            github: secretMap.github || 'default_github_secret',
            wordpress: secretMap.wordpress || 'default_wp_secret',
            stripe: secretMap.stripe || 'default_stripe_secret'
        };
    }

    verifyHmac(platform, rawBody, signatureHeader) {
        if (!rawBody || !signatureHeader) return { verified: false, error: 'MISSING_PAYLOAD_OR_HEADER' };
        const secret = this.secrets[platform.toLowerCase()];
        if (!secret) return { verified: false, error: 'UNSUPPORTED_PLATFORM' };

        try {
            if (platform.toLowerCase() === 'github') {
                const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
                const verified = crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(expected));
                return { verified, error: verified ? null : 'SIGNATURE_MISMATCH' };
            }
            const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
            const verified = signatureHeader === expected;
            return { verified, error: verified ? null : 'SIGNATURE_MISMATCH' };
        } catch (e) {
            return { verified: false, error: e.message };
        }
    }
}

module.exports = MultiPlatformBridge;
