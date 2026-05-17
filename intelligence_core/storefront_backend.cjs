const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DB_PATH = path.join(__dirname, '../AETHER_KNOWLEDGE_BASE/aether_brain.sqlite');

class StorefrontBackend {
    constructor() {
        this.port = process.env.STORE_PORT || 3050;
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

        // Seed inventory if empty
        const count = db.prepare('SELECT count(*) as c FROM store_inventory').get().c;
        if (count === 0) {
            const seed = [
                ['prompt-guard', 'XORAS PromptGuard Sentry', 'security', 'Deterministic AST prompt injection defense and payload sanitization sentry.', '../assets/prompt_guard_hero.png', 0.0, 999, 1420, 'npm i @xoras/prompt-guard', 'OPEN SOURCE / FREE', 'tier-open'],
                ['tz-scheduler', 'XORAS TimeZone Stagger Engine', 'orchestration', 'Autonomous 24/7 global PR triage and staggered dispatch engine.', '../assets/tz_scheduler_hero.png', 0.0, 999, 850, 'npm i @xoras/tz-scheduler', 'OPEN SOURCE / FREE', 'tier-open'],
                ['solver-node', 'XORAS Antifragile Solver Node', 'diagnostics', 'Autonomous system trauma and foundational bedrock verification engine.', '../assets/solver_node_hero.png', 49.0, 50, 120, 'npm i @xoras/solver-node', 'ENTERPRISE PRO', 'tier-pro'],
                ['tri-model-bridge', 'XORAS Tri-Model Inference Bus', 'inference', 'High-speed local Ollama MoE and regional SEA-LION vLLM routing bus.', '../assets/tri_model_hero.png', 0.0, 999, 2300, 'npm i @xoras/tri-model-bridge', 'OPEN SOURCE / FREE', 'tier-open'],
                ['dynamic-persona', 'XORAS Dynamic Persona Modulator', 'orchestration', 'State-machine communication governance module locking 5 operational categories.', '../assets/dynamic_persona_hero.png', 0.0, 999, 640, 'npm i @xoras/dynamic-persona', 'OPEN SOURCE / FREE', 'tier-open'],
                ['cortex-sandbox', 'XORAS Cortex SIMD Vector Core', 'storage', 'Tri-modal cognitive memory database engine generating verifiable 3072-dim embeddings.', '../assets/cortex_vector_hero.png', 99.0, 25, 45, 'npm i @xoras/cortex-sandbox', 'ENTERPRISE PRO', 'tier-pro']
            ];
            const insert = db.prepare('INSERT INTO store_inventory VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
            const tx = db.transaction(() => {
                seed.forEach(row => insert.run(...row));
            });
            tx();
        }
        db.close();
    }

    start() {
        const server = http.createServer((req, res) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

            if (req.method === 'OPTIONS') {
                res.writeHead(204);
                res.end();
                return;
            }

            const urlParts = req.url.split('?');
            const route = urlParts[0];

            const db = require('better-sqlite3')(DB_PATH);

            if (route === '/api/catalog' && req.method === 'GET') {
                const items = db.prepare('SELECT * FROM store_inventory').all();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(items));
                db.close();
                return;
            }

            if (route === '/api/checkout' && req.method === 'POST') {
                let body = '';
                req.on('data', chunk => body += chunk);
                req.on('end', () => {
                    try {
                        const { cart } = JSON.parse(body);
                        let total = 0;
                        const token = 'dl_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                        
                        const updateStock = db.prepare('UPDATE store_inventory SET stock_qty = stock_qty - 1, downloads_count = downloads_count + 1 WHERE id = ? AND stock_qty > 0');
                        
                        db.transaction(() => {
                            cart.forEach(item => {
                                total += item.price;
                                updateStock.run(item.id);
                            });
                            db.prepare('INSERT INTO store_orders VALUES (?, ?, ?, ?, ?, ?)').run(
                                'ord_' + Date.now(), token, JSON.stringify(cart), total, 'COMPLETED', new Date().toISOString()
                            );
                        })();

                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ status: 'SUCCESS', token, total, message: 'Stock decremented. Secure download session armed.' }));
                    } catch (e) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ status: 'ERROR', error: e.message }));
                    } finally {
                        db.close();
                    }
                });
                return;
            }

            if (route.startsWith('/api/download/') && req.method === 'GET') {
                const id = route.split('/')[3];
                const pkgDir = path.join(__dirname, '../../packages', id);
                
                if (!fs.existsSync(pkgDir)) {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Package source unlocatable.');
                    db.close();
                    return;
                }

                const outZip = path.join(path.dirname(DB_PATH), `xoras_bundle_${id}.zip`);
                try {
                    execSync(`zip -r ${outZip} .`, { cwd: pkgDir });
                    const fileStream = fs.createReadStream(outZip);
                    res.writeHead(200, {
                        'Content-Type': 'application/zip',
                        'Content-Disposition': `attachment; filename="xoras_bundle_${id}.zip"`
                    });
                    fileStream.pipe(res);
                } catch (e) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Compression error: ' + e.message);
                } finally {
                    db.close();
                }
                return;
            }

            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'NOT_FOUND' }));
            db.close();
        });

        server.listen(this.port, () => {
            console.log(`production storefront backend running on port ${this.port}`);
        });
    }
}

module.exports = new StorefrontBackend();

if (require.main === module) {
    const srv = new StorefrontBackend();
    srv.start();
}
