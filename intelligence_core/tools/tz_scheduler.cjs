// intelligence_core/tools/tz_scheduler.cjs

class TimeZoneScheduler {
    static getCurrentActiveRegion(overrideHour = null) {
        const utcHour = overrideHour !== null ? overrideHour : new Date().getUTCHours();
        
        // ASIA / PACIFIC: UTC 00:00 - 08:00
        if (utcHour >= 0 && utcHour < 8) {
            return {
                region: 'asia',
                activeKeywords: ['sea-lion', 'singapore', 'tokyo', 'beijing', 'seoul', 'asia', 'chinese', 'japanese']
            };
        }
        // EUROPE / UK: UTC 08:00 - 15:00
        else if (utcHour >= 8 && utcHour < 15) {
            return {
                region: 'europe',
                activeKeywords: ['mistral', 'kyutai', 'eu', 'london', 'berlin', 'paris', 'europe', 'uk']
            };
        }
        // AMERICAS: UTC 15:00 - 24:00
        else {
            return {
                region: 'americas',
                activeKeywords: ['us', 'san francisco', 'new york', 'americas', 'latam', 'california', 'canada']
            };
        }
    }

    static isTargetActive(repoDescOrHandle, overrideHour = null) {
        if (typeof repoDescOrHandle !== 'string') return false;
        const current = this.getCurrentActiveRegion(overrideHour);
        const text = repoDescOrHandle.toLowerCase();
        return current.activeKeywords.some(keyword => text.includes(keyword));
    }

    static getStaggerDelayMs(tier, isRegionActive) {
        if (isRegionActive) {
            return tier === 'TROPHY' ? 1000 : 3000;
        } else {
            return 12000;
        }
    }
}

module.exports = TimeZoneScheduler;

if (require.main === module) {
    const override = process.argv.includes('--hour') ? parseInt(process.argv[process.argv.indexOf('--hour') + 1], 10) : null;
    const reg = TimeZoneScheduler.getCurrentActiveRegion(override);
    console.log(`region: ${reg.region}`);
}
