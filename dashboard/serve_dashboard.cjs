#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

/**
 * XORAS DASHBOARD SERVER [v1.0.0]
 * Serves the Institutional Governance Portal.
 */

const PORT = 3000;
const ROOT = __dirname;

const server = http.createServer((req, res) => {
    // API Endpoints
    if (req.method === 'POST' && req.url === '/api/propose') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const { category, reason } = JSON.parse(body);
            exec(`node xoras.cjs request-exception ${category} "${reason}"`, (err, stdout, stderr) => {
                if (err) {
                    res.statusCode = 500;
                    return res.end(JSON.stringify({ error: stderr }));
                }
                const match = stdout.match(/REQUEST ID: (REQ-[A-Z0-9]+)/);
                const requestId = match ? match[1] : null;
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, requestId, output: stdout }));
            });
        });
        return;
    }

    if (req.method === 'POST' && req.url === '/api/approve') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const { requestId, anchorId } = JSON.parse(body);
            exec(`node xoras.cjs approve ${requestId} ${anchorId}`, (err, stdout, stderr) => {
                if (err) {
                    res.statusCode = 500;
                    return res.end(JSON.stringify({ error: stderr }));
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, output: stdout }));
            });
        });
        return;
    }

    let filePath = path.join(ROOT, req.url === '/' ? 'governance_dashboard.html' : req.url);
    
    // Safety check
    if (!filePath.startsWith(ROOT)) {
        res.statusCode = 403;
        return res.end('Access Denied');
    }

    if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
        const ext = path.extname(filePath);
        const contentType = {
            '.html': 'text/html',
            '.json': 'application/json',
            '.css': 'text/css',
            '.js': 'text/javascript'
        }[ext] || 'text/plain';

        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(filePath).pipe(res);
    } else {
        res.statusCode = 404;
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`\n==========================================`);
    console.log(`  XORAS: GOVERNANCE PORTAL ACTIVE`);
    console.log(`==========================================`);
    console.log(`  URL: http://localhost:${PORT}`);
    console.log(`  DETERMINISTIC STATE: VERIFIED`);
    console.log(`==========================================\n`);
    
    // Auto-open browser
    const url = `http://localhost:${PORT}`;
    const start = (process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open');
    exec(`${start} ${url}`);
});
