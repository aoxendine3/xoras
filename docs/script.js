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

    // Pilot Intake Form & Payload Delivery
    const form = document.getElementById('pilot-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('.submit-btn');
        const email = form.querySelector('input[type="email"]').value;
        const ecosystem = form.querySelector('select').value;

        btn.innerText = "Sending...";
        btn.disabled = true;

        // --- WEBHOOK LOGIC (Placeholder for Anthony) ---
        // Replace 'YOUR_WEBHOOK_URL' with your real Slack/Discord URL
        const webhookUrl = 'YOUR_WEBHOOK_URL'; 
        
        if (webhookUrl !== 'YOUR_WEBHOOK_URL') {
            try {
                await fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        content: `🚀 **New XORAS Pilot Lead!**\n**Email:** ${email}\n**Ecosystem:** ${ecosystem}\n**Status:** Payload Delivered.`
                    })
                });
            } catch (err) {
                console.error("Webhook failed:", err);
            }
        }

        // --- SUCCESS STATE & PAYLOAD DELIVERY ---
        btn.innerText = "Welcome to XORAS! ✅";
        btn.style.background = "var(--success)";
        
        // Instant Download of Starter Pack
        window.location.href = 'XORAS_PILOT_STARTER.zip';

        // Update UI to show next steps
        const formCard = document.querySelector('.form-card');
        formCard.innerHTML = `
            <div style="padding: 2rem;">
                <h2 style="color: var(--success)">Institutional Access Granted</h2>
                <p>Your <strong>XORAS_PILOT_STARTER.zip</strong> should be downloading now.</p>
                <div style="margin-top: 2rem; background: rgba(0,0,0,0.3); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--accent);">
                    <h3 style="margin-bottom: 1rem;">Next Steps:</h3>
                    <ol style="text-align: left; margin-left: 1.5rem; color: var(--text-dim);">
                        <li>Unzip the starter pack and read <code>PILOT_ONBOARDING.md</code></li>
                        <li>Add the <code>xoras.config.json</code> to your repo root.</li>
                        <li>Configure your GitHub Action (v1).</li>
                    </ol>
                </div>
                <p style="margin-top: 2rem;"><a href="https://github.com/aoxendine3/xoras" class="cta-button">View Repository Docs</a></p>
            </div>
        `;
    });
});
