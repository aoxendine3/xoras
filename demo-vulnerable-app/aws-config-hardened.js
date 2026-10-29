/**
 * Secure AWS Configuration Loader
 * Uses deterministic environment variables and secret managers.
 * Zero hardcoded credentials committed to VCS.
 */

module.exports = {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || null,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || null,
    isConfigured: () => {
        return Boolean(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
    }
};
