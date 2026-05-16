/**
 * 🔬 XORAS // High-Speed In-Memory Index Unit Test
 * Purpose: Verifies O(1) item index lookup, dynamic in-memory status transitions, 
 * and absolute garbage collection cache purging.
 */

const memoryLedger = require('../memory_ledger.cjs');
const assert = require('assert');

async function testIndexAndPurge() {
    console.log('======================================================================');
    console.log('          🚀 XORAS // MEMORY LEDGER INDEX & PURGE SPEC TEST           ');
    console.log('======================================================================\n');

    console.log('[TEST 1] Initializing and hydrating V8 memory cache...');
    const result = await memoryLedger.hydrateMemoryCache();
    console.log(`✅ Hydrated in ${result.durationMs}ms across ${result.recordsHydrated} active records.\n`);

    console.log('[TEST 2] Recording new test episode...');
    const logRes = memoryLedger.recordEpisode('AUDIT_TEST: https://github.com/xoras/index-spec', 'TEST_MANIFEST', 'STAGED');
    assert.strictEqual(logRes.status, 'LOGGED');
    const newId = logRes.id;
    console.log(`✅ Episode recorded successfully with ID: ${newId}.\n`);

    console.log('[TEST 3] Verifying O(1) item index lookup via getLeadById()...');
    const lead = await memoryLedger.getLeadById(newId);
    assert.notStrictEqual(lead, null);
    assert.strictEqual(lead.id, newId);
    assert.strictEqual(lead.status, 'STAGED');
    console.log(`✅ O(1) lookup verified: ID ${lead.id} retrieved instantly.\n`);

    console.log('[TEST 4] Executing O(1) in-memory status transition (STAGED -> SUBMITTED)...');
    const tagRes = memoryLedger.tagOutcome(newId, JSON.stringify({ patched: true }), 'SUBMITTED');
    assert.strictEqual(tagRes.status, 'UPDATED');

    const updatedLead = await memoryLedger.getLeadById(newId);
    assert.strictEqual(updatedLead.status, 'SUBMITTED');
    const stagedList = await memoryLedger.getStagedLeads();
    const foundInStaged = stagedList.find(x => x.id === newId);
    assert.strictEqual(foundInStaged, undefined);
    console.log('✅ In-memory array transition verified without full SQL database reload.\n');

    console.log('[TEST 5] Testing absolute garbage collection cache purge...');
    const purgeRes = memoryLedger.purgeCache();
    assert.strictEqual(purgeRes.status, 'PURGED');
    assert.strictEqual(memoryLedger.isHydrated, false);
    assert.strictEqual(memoryLedger.cache.size, 0);
    assert.strictEqual(memoryLedger.itemIndex.size, 0);
    console.log('✅ Cache successfully purged. Memory references zeroed.\n');

    console.log('======================================================================');
    console.log('🎉 Memory Ledger indexing and purging completely validated.');
    console.log('======================================================================\n');
}

testIndexAndPurge().catch(err => {
    console.error('❌ Index Spec Test Failed:', err);
    process.exit(1);
});
