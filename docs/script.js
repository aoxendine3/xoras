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

    if (simulateBtn) {
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
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            driftVal.innerText = "0%";
            driftVal.style.color = "var(--text-bright)";
            scoreVal.innerText = "100/1";
            scoreVal.style.color = "var(--text-bright)";
            statusIndicator.innerText = "HEALTHY";
            statusIndicator.classList.remove('drift');
            output.innerText = "Waiting for release signal...";
        });
    }

    // Pilot Intake Form & Payload Delivery
    const form = document.getElementById('pilot-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('.submit-btn');
            const emailInput = form.querySelector('input[type="email"]');
            const select = form.querySelector('select');
            
            const email = emailInput ? emailInput.value : "unknown";
            const ecosystem = select ? select.value : "unknown";

            btn.innerText = "Verifying...";
            btn.disabled = true;

            // --- SUCCESS STATE & PAYLOAD DELIVERY ---
            setTimeout(() => {
                // Instant Download of Starter Pack
                window.location.href = 'XORAS_PILOT_STARTER.zip';

                // Update UI to show next steps and Slack Support
                const formCard = document.querySelector('.form-card');
                if (formCard) {
                    formCard.innerHTML = `
                        <div style="padding: 2rem;">
                            <h2 style="color: var(--success)">Institutional Access Granted</h2>
                            <p style="margin-bottom: 1.5rem;">Your <strong>XORAS_PILOT_STARTER.zip</strong> is downloading.</p>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
                                <div style="background: rgba(255,255,255,0.03); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--border); text-align: left;">
                                    <h3 style="color: white; margin-bottom: 0.5rem; font-size: 1rem;">1. Install</h3>
                                    <p style="color: var(--text-dim); font-size: 0.875rem;">Follow the <code>PILOT_ONBOARDING.md</code> in your starter pack.</p>
                                </div>
                                <div style="background: rgba(255,255,255,0.03); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--border); text-align: left;">
                                    <h3 style="color: white; margin-bottom: 0.5rem; font-size: 1rem;">2. Connect</h3>
                                    <p style="color: var(--text-dim); font-size: 0.875rem;">Join our founders and other pilots in the support channel.</p>
                                </div>
                            </div>

                            <div style="display: flex; flex-direction: column; gap: 1rem;">
                                <a href="https://app.slack.com/client/T0B0Q10DYGG/C0AUU8V015M" target="_blank" class="cta-button" style="text-decoration: none; background: #4A154B;">Join Pilot Support Channel (Slack)</a>
                                <a href="https://github.com/aoxendine3/xoras" class="secondary-btn" style="text-decoration: none; margin-left: 0;">View Documentation</a>
                            </div>
                        </div>
                    `;
                }
            }, 1000);
        });
    }
});
