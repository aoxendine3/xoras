const crypto = require('crypto');

class WpJwtAuth {
    constructor(secretKey = 'default_secret_key') {
        this.secret = secretKey;
    }

    generateToken(payload, expiresIn = 3600) {
        const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
        const body = Buffer.from(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + expiresIn })).toString('base64url');
        const signature = crypto.createHmac('sha256', this.secret).update(`${header}.${body}`).digest('base64url');
        return `${header}.${body}.${signature}`;
    }

    verifyToken(token) {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) return { valid: false, error: 'MALFORMED_TOKEN' };
            const expectedSig = crypto.createHmac('sha256', this.secret).update(`${parts[0]}.${parts[1]}`).digest('base64url');
            if (parts[2] !== expectedSig) return { valid: false, error: 'INVALID_SIGNATURE' };
            const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
            if (payload.exp < Math.floor(Date.now() / 1000)) return { valid: false, error: 'TOKEN_EXPIRED' };
            return { valid: true, payload };
        } catch (e) {
            return { valid: false, error: e.message };
        }
    }
}

module.exports = WpJwtAuth;
