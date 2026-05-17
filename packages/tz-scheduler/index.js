class TimeZoneScheduler {
    constructor() {
        this.regions = {
            ASIA: { name: 'Asia-Pacific Tranche', startUtc: 0, endUtc: 8, staggerMs: 3000 },
            EUROPE: { name: 'Europe-MiddleEast Tranche', startUtc: 8, endUtc: 16, staggerMs: 2000 },
            AMERICAS: { name: 'Americas Tranche', startUtc: 16, endUtc: 24, staggerMs: 1500 }
        };
    }

    getCurrentActiveRegion(simulatedHour = null) {
        const utcHour = simulatedHour !== null ? simulatedHour : new Date().getUTCHours();
        if (utcHour >= 0 && utcHour < 8) return { code: 'ASIA', ...this.regions.ASIA };
        if (utcHour >= 8 && utcHour < 16) return { code: 'EUROPE', ...this.regions.EUROPE };
        return { code: 'AMERICAS', ...this.regions.AMERICAS };
    }

    calculateStaggerDelay(targetRepo) {
        const active = this.getCurrentActiveRegion();
        const base = active.staggerMs;
        const jitter = Math.floor(Math.random() * 1000);
        return base + jitter;
    }
}

module.exports = new TimeZoneScheduler();
