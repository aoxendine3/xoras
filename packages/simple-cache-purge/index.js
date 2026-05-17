const http = require('http');
const https = require('https');

class SimpleCachePurge {
    constructor(webhookUrl = '') {
        this.webhook = webhookUrl;
    }

    async purgeObjectCache(key = 'all') {
        if (!this.webhook) return { status: 'ERROR', error: 'WEBHOOK_NOT_CONFIGURED' };
        
        return new Promise((resolve) => {
            const client = this.webhook.startsWith('https') ? https : http;
            const req = client.request(this.webhook, { method: 'POST', headers: { 'Content-Type': 'application/json' } }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve({ status: 'PURGED', code: res.statusCode, key }));
            });
            req.on('error', (err) => resolve({ status: 'ERROR', error: err.message }));
            req.write(JSON.stringify({ action: 'purge_cache', key }));
            req.end();
        });
    }
}

module.exports = SimpleCachePurge;
