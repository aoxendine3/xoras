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
                const response = await fetch('https://formspree.io/f/xaqvvvzb', {
                    method: 'POST',
                    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, tier, project: 'XORAS_PILOT' })
                });

                if (response.ok) {
                    form.innerHTML = `
                        <div class="success-message" style="text-align: center; padding: 2rem;">
                            <h3 style="color: #111827; margin-bottom: 1rem;">Submission Received</h3>
                            <p style="color: #6b7280; margin-bottom: 2rem;">We have received your request for the ${tier} program. We will contact you at ${email} shortly.</p>
                        </div>
                    `;
                } else {
                    const errorData = await response.json();
                    console.error('XORAS Funnel Error:', errorData);
                    alert('Submission failed: Form configuration error (404). Please contact support.');
                    submitBtn.textContent = 'Retry Submission';
                    submitBtn.disabled = false;
                }
            } catch (error) {
                console.error('XORAS Network Error:', error);
                alert('Network error. Please check your connection.');
                submitBtn.textContent = 'Retry Submission';
                submitBtn.disabled = false;
            }
        });
    }
});
