/**
 * 🔬 XORAS // V8 Engine Map vs Object Performance Benchmark
 * Purpose: First-principles empirical test proving V8 Map performance, memory efficiency, 
 * and predictable JIT shape behavior under maximum dynamic RevOps load (100,000+ string keys).
 */

const v8 = require('v8');

function formatMemory(bytes) {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

function runBenchmark() {
    console.log('======================================================================');
    console.log('       🚀 XORAS // V8 MAP vs OBJECT JIT PERFORMANCE BENCHMARK       ');
    console.log('======================================================================\n');
    console.log('Simulating High-Frequency RevOps Ledger Ingestion (100,000 dynamic repository leads)...\n');

    const TOTAL_KEYS = 100000;
    const sampleKeys = [];
    for (let i = 0; i < TOTAL_KEYS; i++) {
        sampleKeys.push(`https://github.com/enterprise-org/repo-target-${i}-${Math.random().toString(36).substring(7)}`);
    }
    const sampleLookupKeys = sampleKeys.slice(0, 5000); // 5k random lookups

    // --- OBJECT BENCHMARK ---
    console.log('--- 1. Testing Standard Object ({}) ---');
    if (global.gc) global.gc();
    const memBeforeObj = process.memoryUsage().heapUsed;
    
    const startObjWrite = performance.now();
    const objCache = Object.create(null); // No prototype pollution
    for (let i = 0; i < TOTAL_KEYS; i++) {
        objCache[sampleKeys[i]] = { id: i, status: 'STAGED', last_updated: Date.now() };
    }
    const objWriteDuration = performance.now() - startObjWrite;
    const memAfterObj = process.memoryUsage().heapUsed;
    const objMemoryUsed = memAfterObj - memBeforeObj;

    const startObjRead = performance.now();
    let objMatches = 0;
    for (let i = 0; i < sampleLookupKeys.length; i++) {
        if (objCache[sampleLookupKeys[i]] !== undefined) objMatches++;
    }
    const objReadDuration = performance.now() - startObjRead;

    const startObjDelete = performance.now();
    for (let i = 0; i < 1000; i++) {
        delete objCache[sampleKeys[i]];
    }
    const objDeleteDuration = performance.now() - startObjDelete;

    console.log(`[Object] Write (100k entries) : ${objWriteDuration.toFixed(2)} ms`);
    console.log(`[Object] Read (5k random)     : ${objReadDuration.toFixed(2)} ms`);
    console.log(`[Object] Delete (1k dynamic)  : ${objDeleteDuration.toFixed(2)} ms`);
    console.log(`[Object] Memory Consumption   : ${formatMemory(objMemoryUsed)}\n`);

    // --- MAP BENCHMARK ---
    console.log('--- 2. Testing V8 Map (new Map()) ---');
    if (global.gc) global.gc();
    const memBeforeMap = process.memoryUsage().heapUsed;

    const startMapWrite = performance.now();
    const mapCache = new Map();
    for (let i = 0; i < TOTAL_KEYS; i++) {
        mapCache.set(sampleKeys[i], { id: i, status: 'STAGED', last_updated: Date.now() });
    }
    const mapWriteDuration = performance.now() - startMapWrite;
    const memAfterMap = process.memoryUsage().heapUsed;
    const mapMemoryUsed = memAfterMap - memBeforeMap;

    const startMapRead = performance.now();
    let mapMatches = 0;
    for (let i = 0; i < sampleLookupKeys.length; i++) {
        if (mapCache.has(sampleLookupKeys[i])) mapMatches++;
    }
    const mapReadDuration = performance.now() - startMapRead;

    const startMapDelete = performance.now();
    for (let i = 0; i < 1000; i++) {
        mapCache.delete(sampleKeys[i]);
    }
    const mapDeleteDuration = performance.now() - startMapDelete;

    console.log(`[Map] Write (100k entries) : ${mapWriteDuration.toFixed(2)} ms`);
    console.log(`[Map] Read (5k random)     : ${mapReadDuration.toFixed(2)} ms`);
    console.log(`[Map] Delete (1k dynamic)  : ${mapDeleteDuration.toFixed(2)} ms`);
    console.log(`[Map] Memory Consumption   : ${formatMemory(mapMemoryUsed)}\n`);

    // --- COMPARATIVE VERDICT ---
    console.log('=== BENCHMARK VERDICT ===');
    const writeWinner = mapWriteDuration < objWriteDuration ? 'Map' : 'Object';
    const readWinner = mapReadDuration < objReadDuration ? 'Map' : 'Object';
    const deleteWinner = mapDeleteDuration < objDeleteDuration ? 'Map' : 'Object';
    const memWinner = mapMemoryUsed < objMemoryUsed ? 'Map' : 'Object';

    console.log(`🏆 Write Speed Advantage : ${writeWinner} (${Math.abs(objWriteDuration - mapWriteDuration).toFixed(2)} ms difference)`);
    console.log(`🏆 Read Speed Advantage  : ${readWinner} (${Math.abs(objReadDuration - mapReadDuration).toFixed(2)} ms difference)`);
    console.log(`🏆 Deletion Efficiency   : ${deleteWinner} (${Math.abs(objDeleteDuration - mapDeleteDuration).toFixed(2)} ms difference)`);
    console.log(`🏆 Memory Efficiency     : ${memWinner} (${formatMemory(Math.abs(objMemoryUsed - mapMemoryUsed))} difference)`);
    console.log('======================================================================\n');
}

runBenchmark();
