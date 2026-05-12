document.addEventListener('DOMContentLoaded', () => {
    // 1. Terminal Simulation Logic
    const terminal = document.getElementById('terminal-output');
    const lines = [
        "> Initializing XORAS Audit Engine...",
        "> Scanning environment for Registry Finality...",
        "> [OK] Docker hashes verified against Authority Registry.",
        "> Intercepting local artifacts for Route Grounding...",
        "> [OK] 14/14 Next.js routes verified in build artifacts.",
        "> Auditing Tier 2 Reasoning (DeepSeek-Coder-V2)...",
        "> [OK] Zero architectural regressions detected.",
        "> [SUCCESS] RELEASE CANDIDATE VERIFIED."
    ];

    let lineIndex = 0;
    function typeLine() {
        if (lineIndex < lines.length) {
            const line = document.createElement('div');
            line.style.marginBottom = '0.5rem';
            terminal.appendChild(line);
            
            let charIndex = 0;
            const text = lines[lineIndex];
            
            const interval = setInterval(() => {
                line.textContent += text[charIndex];
                charIndex++;
                if (charIndex === text.length) {
                    clearInterval(interval);
                    lineIndex++;
                    setTimeout(typeLine, 600);
                }
            }, 20);
        }
    }
    
    // Start terminal after a short delay
    setTimeout(() => {
        terminal.innerHTML = '';
        typeLine();
    }, 1000);

    // 2. Form Submission Logic
    const form = document.getElementById('pilot-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const tier = document.getElementById('intelligence-tier').value;
            const submitBtn = form.querySelector('.submit-btn');
            
            submitBtn.textContent = 'Authenticating...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                form.innerHTML = `
                    <div class="success-message" style="text-align: center; padding: 2rem;">
                        <h3 style="color: #fff; margin-bottom: 1rem;">Application Received</h3>
                        <p style="color: #94a3b8; margin-bottom: 2rem;">Thank you for your interest in the ${tier} program. Our engineering team will review your application shortly.</p>
                        <a href="#" onclick="window.location.reload()" class="cta-button">Back to Portal</a>
                    </div>
                `;
            }, 1200);
        });
    }

    // 3. Smooth Scrolling
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});
