const puppeteer = require('puppeteer-core');
const http = require('http');

/**
 * XORAS Sovereign Distribution Blast
 * Purpose: Connects to existing browser and executes social media posts.
 */

async function runBlast() {
    console.log("🚀 Initiating XORAS Sovereign Distribution Blast...");
    
    try {
        // 1. Get the WebSocket Debug URL from the running browser
        const version = await new Promise((resolve, reject) => {
            http.get('http://127.0.0.1:9222/json/version', (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve(JSON.parse(data)));
            }).on('error', reject);
        });

        const browser = await puppeteer.connect({
            browserWSEndpoint: version.webSocketDebuggerUrl,
            defaultViewport: null
        });

        const pages = await browser.pages();
        const page = pages[0] || await browser.newPage();

        const message = "Just launched XORAS: a local-first auditor for GitHub. It stops you from pushing broken Next.js builds or unpinned Docker tags to production. Simple setup, zero-data leaks. Check it out: https://aoxendine3.github.io/xoras/";

        // 2. Blast to X (Twitter)
        console.log("🐦 Posting to X...");
        await page.goto('https://x.com/intent/post?text=' + encodeURIComponent(message));
        await new Promise(r => setTimeout(r, 5000)); // Wait for load
        // Attempt to hit the 'Post' button via keyboard
        await page.keyboard.down('Control');
        await page.keyboard.press('Enter');
        await page.keyboard.up('Control');
        console.log("✅ X Post Triggered.");

        // 3. Blast to Discord
        console.log("💬 Posting to Discord...");
        await page.goto('https://discord.com/channels/1503615512888742018/1503615513685790873');
        await new Promise(r => setTimeout(r, 8000)); // Wait for load
        await page.keyboard.type(message);
        await page.keyboard.press('Enter');
        console.log("✅ Discord Post Triggered.");

        await browser.disconnect();
        console.log("\n🎊 Distribution Complete. XORAS is now reaching the network.\n");

    } catch (e) {
        console.error("❌ Blast Failed:", e.message);
        process.exit(1);
    }
}

runBlast();
