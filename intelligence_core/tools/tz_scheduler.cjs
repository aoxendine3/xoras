// intelligence_core/tools/tz_scheduler.cjs

class TimeZoneScheduler {
    static getCurrentActiveRegion() {
        const utcHour = new Date().getUTCHours();
        
        // ASIA / PACIFIC: UTC 00:00 - 08:00 (SGT/JST/CST business hours)
        if (utcHour >= 0 && utcHour < 8) {
            return {
                region: 'ASIA',
                label: 'Asia-Pacific Tranche',
                activeKeywords: ['sea-lion', 'singapore', 'tokyo', 'beijing', 'seoul', 'asia', 'chinese', 'japanese']
            };
        }
        // EUROPE / UK: UTC 07:00 - 15:00 (GMT/CET business hours)
        else if (utcHour >= 8 && utcHour < 15) {
            return {
                region: 'EUROPE',
                label: 'Europe Tranche',
                activeKeywords: ['mistral', 'kyutai', 'eu', 'london', 'berlin', 'paris', 'europe', 'uk']
            };
        }
        // AMERICAS: UTC 13:00 - 22:00 (EST/PST business hours)
        else {
            return {
                region: 'AMERICAS',
                label: 'Americas Tranche',
                activeKeywords: ['us', 'san francisco', 'new york', 'americas', 'latam', 'california', 'canada']
            };
        }
    }

    static isTargetActive(repoDescOrHandle) {
        if (typeof repoDescOrHandle !== 'string') return false;
        const current = this.getCurrentActiveRegion();
        const text = repoDescOrHandle.toLowerCase();
        return current.activeKeywords.some(keyword => text.includes(keyword));
    }

    static getStaggerDelayMs(tier, isRegionActive) {
        // Base delay before PR dispatch to stagger load
        if (isRegionActive) {
            return tier === 'TROPHY' ? 1000 : 3000;
        } else {
            // Non-active region targets get delayed to prevent off-hours spam
            return 12000;
        }
    }
}

module.exports = TimeZoneScheduler;
