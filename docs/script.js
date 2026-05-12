document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('pilot-form');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = form.querySelector('input[type="email"]').value;
            const teamSize = form.querySelector('select').value;
            const submitBtn = form.querySelector('.submit-btn');
            
            // Set Loading State
            submitBtn.textContent = 'Processing...';
            submitBtn.disabled = true;
            
            // Simulate Lead Processing
            setTimeout(() => {
                // In a production environment, this would hit a backend API (e.g., Slack/Discord webhook or CRM)
                console.log(`Lead Captured: ${email} | Team Size: ${teamSize}`);
                
                // Show Success State
                form.innerHTML = `
                    <div class="success-message" style="text-align: center; padding: 2rem;">
                        <h3 style="margin-bottom: 1rem;">Application Received</h3>
                        <p style="color: #666; margin-bottom: 2rem;">Thank you for your interest in the XORAS Pilot. Our engineering team will review your application and reach out within 24 hours.</p>
                        <a href="https://github.com/aoxendine3/xoras" class="cta-button" style="display: inline-block;">Explore the Docs</a>
                    </div>
                `;
            }, 1000);
        });
    }

    // Smooth Scrolling for Nav Links
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});
