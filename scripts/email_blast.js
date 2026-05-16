const nodemailer = require('nodemailer');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

/**
 * XORAS Sovereign Email Dispatch
 * Purpose: Sends pilot invitations via co.trendzone@gmail.com
 */

async function sendEmails() {
    console.log("📨 Initiating XORAS Email Dispatch...");

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'co.trendzone@gmail.com',
            pass: process.env.GMAIL_APP_PASS || 'STRICT_VAULT_REQUIRED'
        }
    });

    const targets = [
        { name: 'VP Engineering', company: 'Loom', email: 'ajoxendine68@gmail.com' }, // Test target
        { name: 'Head of Infrastructure', company: 'Notion', email: 'ajoxendine68+notion@gmail.com' }
    ];

    for (const target of targets) {
        const mailOptions = {
            from: 'co.trendzone@gmail.com',
            to: target.email,
            subject: `Hardening ${target.company}'s Release Integrity`,
            text: `Hi ${target.name},\n\nI’ve been building a governance tool called XORAS that audits release candidates for release finality. It specifically catches Docker tag drift and Next.js route errors that standard CI tools miss. I'm looking for 5 engineering teams to pilot it—would you be open to a quick look at the dashboard?\n\nCheck it out: https://aoxendine3.github.io/xoras/\n\nBest,\nAnthony (XORAS Founder)`
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`✅ Email sent to ${target.company} (${target.email})`);
        } catch (error) {
            console.error(`❌ Failed to send to ${target.company}:`, error.message);
        }
    }
}

sendEmails();
