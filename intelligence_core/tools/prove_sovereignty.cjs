const fs = require('fs');
const path = require('path');

async function proveSovereignty() {
    console.log('[AETHER] Initiating Web Sovereignty Proof...');
    try {
        // Fetching live data from Hacker News 'Show HN' (Indie Makers launching products)
        // Bypassing Cloudflare blocks by using the official Firebase API
        const topStoriesRes = await fetch('https://hacker-news.firebaseio.com/v0/showstories.json');
        const storyIds = await topStoriesRes.json();
        
        const targets = [];
        for (let i = 0; i < 3; i++) {
            const storyRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${storyIds[i]}.json`);
            const story = await storyRes.json();
            
            // Filter to ensure it's a "Show HN" (product launch)
            if (story && story.title && story.title.includes('Show HN:')) {
                targets.push({
                    founder_username: story.by,
                    product_name: story.title.replace('Show HN:', '').trim(),
                    product_url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
                    source: 'Hacker News (Live API)'
                });
            }
        }

        console.log(`\n[AETHER] Live Extraction Complete. Found ${targets.length} targets.`);
        targets.forEach((t, index) => {
            console.log(`\nTARGET ${index + 1}:`);
            console.log(`- Founder: ${t.founder_username}`);
            console.log(`- Product: ${t.product_name}`);
            console.log(`- Link: ${t.product_url}`);
        });

        // Write directly to Anthony's JSON template to prove write access
        const targetPath = path.join(__dirname, '../../AETHER_OUTREACH/target_list_v1.json');
        fs.writeFileSync(targetPath, JSON.stringify(targets, null, 2));
        console.log(`\n[AETHER] Data securely written to local target_list_v1.json.`);

    } catch (error) {
        console.error('[AETHER] Sovereignty Proof Failed:', error.message);
    }
}

proveSovereignty();
