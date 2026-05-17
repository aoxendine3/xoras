const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

const DB_PATH = path.join(__dirname, '../AETHER_KNOWLEDGE_BASE/aether_brain.sqlite');

class StorefrontBackend {
    constructor() {
        this.port = process.env.STORE_PORT || 3050;
        this.secretKey = process.env.STORE_SECRET || crypto.randomBytes(32).toString('hex');
        this.rateLimits = new Map();
        this.initDb();
    }

    initDb() {
        const dbDir = path.dirname(DB_PATH);
        if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
        
        const db = require('better-sqlite3')(DB_PATH);
        db.exec(`
            CREATE TABLE IF NOT EXISTS store_inventory (
                id TEXT PRIMARY KEY,
                title TEXT,
                category TEXT,
                desc TEXT,
                img TEXT,
                price REAL,
                stock_qty INTEGER,
                downloads_count INTEGER,
                cli TEXT,
                tier TEXT,
                tierClass TEXT
            );

            CREATE TABLE IF NOT EXISTS store_orders (
                order_id TEXT PRIMARY KEY,
                token TEXT,
                items_json TEXT,
                total REAL,
                status TEXT,
                timestamp TEXT
            );
        `);

        // Force re-seed to ensure all 10 products are present
        db.exec('DELETE FROM store_inventory');
        const seed = [
            ['prompt-guard', 'XORAS PromptGuard Sentry', 'security', 'Deterministic AST prompt injection defense and payload sanitization sentry.', '../assets/prompt_guard_hero.png', 0.0, 999, 1420, 'npm i @xoras/prompt-guard', 'OPEN SOURCE / FREE', 'tier-open'],
            ['tz-scheduler', 'XORAS TimeZone Stagger Engine', 'orchestration', 'Autonomous 24/7 global PR triage and staggered dispatch engine.', '../assets/tz_scheduler_hero.png', 0.0, 999, 850, 'npm i @xoras/tz-scheduler', 'OPEN SOURCE / FREE', 'tier-open'],
            ['solver-node', 'XORAS Antifragile Solver Node', 'diagnostics', 'Autonomous system trauma and foundational bedrock verification engine.', '../assets/solver_node_hero.png', 39.0, 50, 120, 'npm i @xoras/solver-node', 'ENTERPRISE PRO', 'tier-pro'],
            ['tri-model-bridge', 'XORAS Tri-Model Inference Bus', 'inference', 'High-speed local Ollama MoE and regional SEA-LION vLLM routing bus.', '../assets/tri_model_hero.png', 0.0, 999, 2300, 'npm i @xoras/tri-model-bridge', 'OPEN SOURCE / FREE', 'tier-open'],
            ['dynamic-persona', 'XORAS Dynamic Persona Modulator', 'orchestration', 'State-machine communication governance module locking 5 operational categories.', '../assets/dynamic_persona_hero.png', 0.0, 999, 640, 'npm i @xoras/dynamic-persona', 'OPEN SOURCE / FREE', 'tier-open'],
            ['cortex-sandbox', 'XORAS Cortex SIMD Vector Core', 'storage', 'Tri-modal cognitive memory database engine generating verifiable 3072-dim embeddings.', '../assets/cortex_vector_hero.png', 79.0, 25, 45, 'npm i @xoras/cortex-sandbox', 'ENTERPRISE PRO', 'tier-pro'],
            ['wp-jwt-auth', 'XORAS WP JWT Authenticator', 'security', 'Clean, lightweight JWT authentication endpoint handler for WordPress REST API.', '../assets/wp_jwt_hero.png', 19.0, 200, 530, 'npm i @xoras/wp-jwt-auth', 'ESSENTIAL UTILITY', 'tier-pro'],
            ['simple-cache-purge', 'XORAS Redis Cache Purger', 'storage', 'Instant WordPress Redis and object cache invalidation webhook utility.', '../assets/cache_purge_hero.png', 14.0, 300, 890, 'npm i @xoras/simple-cache-purge', 'ESSENTIAL UTILITY', 'tier-pro'],
            ['secure-env-loader', 'XORAS Secure Env Loader', 'security', 'Lightweight .env credential loader for Node and PHP with zero dependencies.', '../assets/env_loader_hero.png', 9.0, 500, 1120, 'npm i @xoras/secure-env-loader', 'ESSENTIAL UTILITY', 'tier-pro'],
            ['form-honeypot', 'XORAS Form Honeypot Trap', 'security', 'Drop-in vanilla JS and PHP spam honeypot validator for web forms.', '../assets/form_honeypot_hero.png', 9.0, 500, 1640, 'npm i @xoras/form-honeypot', 'ESSENTIAL UTILITY', 'tier-pro']
        ];
        const insert = db.prepare('INSERT INTO store_inventory VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        db.transaction(() => seed.forEach(row => insert.run(...row)))();
        db.close();
    }

    checkRateLimit(ip) {
        const now = Date.now();
        const limit = 100;
        const windowMs = 15 * 60 * 1000;

        if (!this.rateLimits.has(ip)) {
            this.rateLimits.set(ip, { count: 1, resetTime: now + windowMs });
            return true;
        }

        const record = this.rateLimits.get(ip);
        if (now > record.resetTime) {
            record.count = 1;
            record.resetTime = now + windowMs;
            return true;
        }

        if (record.count >= limit) return false;
        record.count++;
        return true;
    }

    generateSecureToken(orderId) {
        const hmac = crypto.createHmac('sha256', this.secretKey);
        hmac.update(`${orderId}:${Date.now()}`);
        return hmac.digest('hex');
    }

    start() {
        const server = http.createServer((req, res) => {
            const ip = req.socket.remoteAddress || 'unknown';

            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

            if (req.method === 'OPTIONS') {
                res.writeHead(204);
                res.end();
                return;
            }

            if (!this.checkRateLimit(ip)) {
                res.writeHead(429, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'ERROR', error: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests. Connection throttled for 15 minutes.' }));
                return;
            }

            const urlParts = req.url.split('?');
            const route = urlParts[0];
            const db = require('better-sqlite3')(DB_PATH);

            if (route === '/api/catalog' && req.method === 'GET') {
                try {
                    const items = db.prepare('SELECT * FROM store_inventory').all();
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(items));
                } catch (e) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: 'ERROR', error: 'DATABASE_QUERY_FAULT' }));
                } finally {
                    db.close();
                }
                return;
            }

            if (route === '/api/checkout' && req.method === 'POST') {
                let body = '';
                req.on('data', chunk => {
                    body += chunk;
                    if (body.length > 1024 * 1024) req.connection.destroy();
                });

                req.on('end', () => {
                    try {
                        const { cart } = JSON.parse(body);
                        if (!Array.isArray(cart) || cart.length === 0) throw new Error('EMPTY_TRANSACTION');

                        let total = 0;
                        const orderId = 'ord_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex');
                        const token = this.generateSecureToken(orderId);
                        
                        const updateStock = db.prepare('UPDATE store_inventory SET stock_qty = stock_qty - 1, downloads_count = downloads_count + 1 WHERE id = ? AND stock_qty > 0');
                        
                        db.transaction(() => {
                            cart.forEach(item => {
                                if (typeof item.price !== 'number' || !item.id) throw new Error('MALFORMED_ITEM');
                                total += item.price;
                                const result = updateStock.run(item.id);
                                if (result.changes === 0 && item.price > 0) throw new Error(`STOCK_EXHAUSTED_FOR_${item.id}`);
                            });

                            db.prepare('INSERT INTO store_orders VALUES (?, ?, ?, ?, ?, ?)').run(
                                orderId, token, JSON.stringify(cart), total, 'COMPLETED', new Date().toISOString()
                            );
                        })();

                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ status: 'SUCCESS', orderId, token, total, message: 'Transaction verified. Cryptographic token armed.' }));
                    } catch (e) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ status: 'ERROR', error: e.message }));
                    } finally {
                        db.close();
                    }
                });
                return;
            }

            if (route.startsWith('/api/download/') && req.method === 'GET') {
                const parts = route.split('/');
                const id = parts[3];

                if (!/^[a-z0-9-]+$/.test(id)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: 'ERROR', error: 'INVALID_IDENTIFIER' }));
                    db.close();
                    return;
                }

                const pkgDir = path.resolve(__dirname, '../../packages', id);
                if (!fs.existsSync(pkgDir) || !pkgDir.startsWith(path.resolve(__dirname, '../../packages'))) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: 'ERROR', error: 'PACKAGE_NOT_FOUND' }));
                    db.close();
                    return;
                }

                const outZip = path.join(path.dirname(DB_PATH), `xoras_bundle_${id}_${Date.now()}.zip`);
                try {
                    execSync(`zip -r ${outZip} .`, { cwd: pkgDir });
                    const stat = fs.statSync(outZip);
                    res.writeHead(200, {
                        'Content-Type': 'application/zip',
                        'Content-Length': stat.size,
                        'Content-Disposition': `attachment; filename="xoras_bundle_${id}.zip"`
                    });
                    const fileStream = fs.createReadStream(outZip);
                    fileStream.pipe(res);
                    fileStream.on('end', () => fs.unlinkSync(outZip));
                } catch (e) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: 'ERROR', error: 'ARCHIVE_COMPILATION_FAULT' }));
                } finally {
                    db.close();
                }
                return;
            }

            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'ERROR', error: 'ROUTE_UNLOCATABLE' }));
            db.close();
        });

        server.listen(this.port, () => {
            console.log(`production storefront backend running on port ${this.port} (rate_limiting: active, hmac_signing: armed, catalog_count: 10)`);
        });
    }
}

module.exports = new StorefrontBackend();

if (require.main === module) {
    const srv = new StorefrontBackend();
    srv.start();
}
