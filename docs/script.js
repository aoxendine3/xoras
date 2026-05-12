document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('pilot-form');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('user-email').value;
            const tier = document.getElementById('intelligence-tier').value;
            const submitBtn = form.querySelector('.submit-btn');
            
            // Set Loading State
            submitBtn.textContent = 'Processing...';
            submitBtn.disabled = true;
            
            // Simulate Lead Processing
            setTimeout(() => {
                // Secure logging - no email exposure in UI
                console.log(`XORAS Pilot Access Requested for Tier: ${tier}`);
                
                // Show Success State (No Email Displayed)
                form.innerHTML = `
                    <div class="success-message" style="text-align: center; padding: 2rem;">
                        <div class="card-brand">XORAS</div>
                        <h3 style="margin-bottom: 1rem;">Application Received</h3>
                        <p style="color: #666; margin-bottom: 2rem;">Thank you for your interest in the <strong>${tier}</strong> Intelligence Tier. Our team will review your application and reach out to the provided work email within 24 hours.</p>
                        <a href="https://github.com/aoxendine3/xoras" class="cta-button" style="display: inline-block;">Return to Main</a>
                    </div>
                `;
            }, 1000);
        });
    }

    // Smooth Scrolling for Nav Links
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
