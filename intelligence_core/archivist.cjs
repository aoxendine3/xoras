const db = require('better-sqlite3')(require('path').join(__dirname, '../AETHER_KNOWLEDGE_BASE/aether_brain.sqlite'));

class CognitiveArchivist {
    /**
     * The MANAGE Loop: Runs asynchronously to abstract rules from failures.
     */
    runNightlyManageLoop() {
        console.log('[ARCHIVIST] Initiating Cognitive Management Loop...');
        
        // 1. Scan Episodic Memory for explicit failure outcomes
        const failedEpisodes = db.prepare('SELECT * FROM episodic_logs WHERE outcome = ?').all('FAILED');
        let newRulesCount = 0;

        failedEpisodes.forEach(ep => {
            // Cognitive Extraction: Identify the core demographic/context and map it to a restrictive rule
            const target = ep.query.replace('Draft a campaign for ', '').trim();
            const rule = `[LEARNED_RULE] Historical data indicates poor conversion for target: '${target}'. Prioritize hyper-personalized problem-solution frameworks over generic automated outreach.`;
            
            // Check if rule already exists to avoid redundant logic
            const existing = db.prepare('SELECT id FROM procedural_rules WHERE context_trigger = ?').get(target);
            
            if (!existing) {
                // 2. Write to Procedural Memory
                db.prepare('INSERT INTO procedural_rules (context_trigger, rule_directive) VALUES (?, ?)').run(target, rule);
                console.log(`[ARCHIVIST] Abstracted new Procedural Rule for context: ${target}`);
                newRulesCount++;
            }
        });

        console.log(`[ARCHIVIST] Manage Loop Complete. Generated ${newRulesCount} new procedural rules.`);
        return { status: 'OPTIMIZED', rulesGenerated: newRulesCount };
    }
}
module.exports = new CognitiveArchivist();
