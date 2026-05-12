document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('pilot-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const tier = document.getElementById('intelligence-tier').value;
            const email = document.getElementById('user-email').value;
            const submitBtn = form.querySelector('.submit-btn');
            
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            try {
                // Lead Capture via Formspree (User must replace with their own ID)
                const response = await fetch('https://formspree.io/f/xoqgypzv', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, tier, project: 'XORAS_PILOT' })
                });

                if (response.ok) {
                    form.innerHTML = `
                        <div class="success-message" style="text-align: center; padding: 2rem;">
                            <h3 style="color: #111827; margin-bottom: 1rem;">Welcome to the Pilot</h3>
                            <p style="color: #6b7280; margin-bottom: 2rem;">You are now on the list for the ${tier} program. Check your email for your onboarding pack.</p>
                            <a href="https://github.com/aoxendine3/xoras" class="cta-button">View Setup Guide</a>
                        </div>
                    `;
                } else {
                    throw new Error('Capture failed');
                }
            } catch (error) {
                submitBtn.textContent = 'Error. Try again.';
                submitBtn.disabled = false;
            }
        });
    }
});
