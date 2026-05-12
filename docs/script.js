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
    const latencyVal = document.getElementById('latency-val');
    const secretsVal = document.getElementById('secrets-val');
    const output = document.getElementById('sim-output');

    simulateBtn.addEventListener('click', () => {
        simulateBtn.disabled = true;
        output.innerText = "Analyzing release candidate...";
        
        setTimeout(() => {
            latencyVal.innerText = "98ms (+133%)";
            latencyVal.style.color = "var(--danger)";
            
            setTimeout(() => {
                secretsVal.innerText = "1 DETECTED";
                secretsVal.style.color = "var(--danger)";
                
                statusIndicator.innerText = "DRIFT DETECTED";
                statusIndicator.classList.add('drift');
                
                output.innerHTML = `<span style="color: var(--danger)">❌ Integrity Check Failed</span><br>
                - Latency regression in critical path.<br>
                - Exposed secret found in commit diff.<br>
                <br>
                <span style="color: var(--warning)">⚠️ ADVISORY MODE: Build allowed, but review required.</span>`;
                
                simulateBtn.disabled = false;
            }, 800);
        }, 1200);
    });

    resetBtn.addEventListener('click', () => {
        latencyVal.innerText = "42ms";
        latencyVal.style.color = "var(--text-bright)";
        secretsVal.innerText = "0";
        secretsVal.style.color = "var(--text-bright)";
        statusIndicator.innerText = "HEALTHY";
        statusIndicator.classList.remove('drift');
        output.innerText = "Waiting for release signal...";
    });

    // Form Mock
    const form = document.getElementById('pilot-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = form.querySelector('.submit-btn');
        btn.innerText = "Request Sent ✅";
        btn.disabled = true;
        btn.style.background = "var(--success)";
    });
});
