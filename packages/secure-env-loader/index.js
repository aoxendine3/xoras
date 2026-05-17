const fs = require('fs');
const path = require('path');

class SecureEnvLoader {
    load(customPath = null) {
        const envPath = customPath || path.resolve(process.cwd(), '.env');
        if (!fs.existsSync(envPath)) return { loaded: false, error: 'FILE_NOT_FOUND' };

        const content = fs.readFileSync(envPath, 'utf8');
        let count = 0;
        content.split('\n').forEach(line => {
            const clean = line.trim();
            if (!clean || clean.startsWith('#') || !clean.includes('=')) return;
            const [key, ...valParts] = clean.split('=');
            const val = valParts.join('=').replace(/^['"]|['"]$/g, '').trim();
            if (key.trim()) {
                process.env[key.trim()] = val;
                count++;
            }
        });
        return { loaded: true, count };
    }
}

module.exports = new SecureEnvLoader();
