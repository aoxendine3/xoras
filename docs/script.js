document.addEventListener('DOMContentLoaded', () => {
    // Tab Switching Logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-tab');

            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(target).classList.add('active');
        });
    });

    // Live Drift Simulator
    const simulateBtn = document.getElementById('simulate-drift');
    const resetBtn = document.getElementById('reset-sim');
    const statusIndicator = document.getElementById('sim-status');
    const driftVal = document.getElementById('latency-val');
    const scoreVal = document.getElementById('score-val');
    const output = document.getElementById('sim-output');

    simulateBtn.addEventListener('click', () => {
        simulateBtn.disabled = true;
        output.innerText = "Analyzing release candidate...";
        
        setTimeout(() => {
            driftVal.innerText = "133% (Critical)";
            driftVal.style.color = "var(--danger)";
            
            setTimeout(() => {
                scoreVal.innerText = "60/1";
                scoreVal.style.color = "var(--danger)";
                
                statusIndicator.innerText = "DRIFT DETECTED";
                statusIndicator.classList.add('drift');
                
                output.innerHTML = `<span style="color: var(--danger)">❌ Integrity Violation</span><br>
                - Major latency regression detected in core API.<br>
                - Unauthorized container layer detected (Docker).<br>
                <br>
                <span style="color: var(--warning)">⚠️ ADVISORY MODE: Drift recorded in ledger. Merge blocked.</span>`;
                
                simulateBtn.disabled = false;
            }, 800);
        }, 1200);
    });

    resetBtn.addEventListener('click', () => {
        driftVal.innerText = "0%";
        driftVal.style.color = "var(--text-bright)";
        scoreVal.innerText = "100/1";
        scoreVal.style.color = "var(--text-bright)";
        statusIndicator.innerText = "HEALTHY";
        statusIndicator.classList.remove('drift');
        output.innerText = "Waiting for release signal...";
    });

    // Form Mock
    const form = document.getElementById('pilot-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = form.querySelector('.submit-btn');
        btn.innerText = "Application Sent ✅";
        btn.disabled = true;
        btn.style.background = "var(--success)";
    });
});
