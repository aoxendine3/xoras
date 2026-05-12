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

                // Update UI to show next steps and Support Channels
                const formCard = document.querySelector('.form-card');
                if (formCard) {
                    formCard.innerHTML = `
                        <div style="padding: 1rem;">
                            <h2 style="color: var(--success); margin-bottom: 0.5rem;">Institutional Access Granted</h2>
                            <p style="margin-bottom: 1.5rem; font-size: 0.9rem;">Your <strong>XORAS_PILOT_STARTER.zip</strong> is downloading.</p>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
                                <div style="background: rgba(255,255,255,0.03); padding: 1.25rem; border-radius: 12px; border: 1px solid var(--border); text-align: left;">
                                    <h3 style="color: white; margin-bottom: 0.25rem; font-size: 0.9rem;">1. Install</h3>
                                    <p style="color: var(--text-dim); font-size: 0.75rem;">Follow the <code>PILOT_ONBOARDING.md</code> guide.</p>
                                </div>
                                <div style="background: rgba(255,255,255,0.03); padding: 1.25rem; border-radius: 12px; border: 1px solid var(--border); text-align: left;">
                                    <h3 style="color: white; margin-bottom: 0.25rem; font-size: 0.9rem;">2. Support</h3>
                                    <p style="color: var(--text-dim); font-size: 0.75rem;">Join our community of institutional pilots.</p>
                                </div>
                            </div>

                            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                                <a href="https://discord.com/channels/1503615512888742018/1503615513685790873" target="_blank" class="cta-button" style="text-decoration: none; background: #5865F2;">Join Pilot Support (Discord)</a>
                                <a href="https://app.slack.com/client/T0B0Q10DYGG/C0AUU8V015M" target="_blank" class="cta-button" style="text-decoration: none; background: #4A154B;">Join Pilot Support (Slack)</a>
                                <a href="https://github.com/aoxendine3/xoras" class="secondary-btn" style="text-decoration: none; margin-left: 0; padding: 0.5rem;">Documentation</a>
                            </div>
                        </div>
                    `;
                }
            }, 1000);
        });
    }
});
