const { exec } = require('child_process');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const SENDER = process.env.VITE_CONTACT_EMAIL || "ajoxendine68@gmail.com";

let isDispatching = false;

async function dispatchTask(target) {
    if (isDispatching) return;
    isDispatching = true;
    
    try {
        const subject = `Optimizing ${target.company} for Release Finality`;
        const rawBody = `Hi ${target.name},\n\nFollowing up on the operational scaling at ${target.company}. We have deployed XORAS (Aether Core) to address stability and release finality gaps in high-density automated workflows.\n\nInstitutional Portal: https://aoxendine3.github.io/xoras/\n\nBest,\nAnthony (XORAS Founder)`;
        
        // Sanitize body for AppleScript (escape quotes and replace newlines with AppleScript line breaks)
        const cleanBody = rawBody.replace(/"/g, '\\"').replace(/\n/g, '" & return & "');
        
        const appleScript = `
            tell application "Mail"
                set theMessage to make new outgoing message with properties {sender:"${SENDER}", subject:"${subject}", content:"${cleanBody}", visible:true}
                tell theMessage
                    make new to recipient at end of to recipients with properties {name:"${target.name}", address:"${target.email}"}
                end tell
            end tell
        `;

        // HARD LOCK: Apple Mail execution is explicitly stopped unless a strict per-use approval is passed.
        const appApproval = process.env.VITE_APP_APPROVAL;
        if (appApproval !== 'STRICT_AUTHORIZATION_GRANTED') {
            console.warn(`[AETHER] Apple Mail Execution HARD LOCKED. Draft for ${target.email} staged in memory only. No app launched.`);
            return { status: 'LOCKED', message: 'Apple Mail use is stopped until explicit per-use approval.' };
        }

        // Only executes if strict authorization is granted
        return new Promise((resolve) => {
            exec(`osascript -e '${appleScript}'`, (error) => {
                if (error) {
                    console.error(`[AETHER_FATAL] Dispatch Failed: ${error.message}`);
                    resolve({ status: 'FAILED' });
                } else {
                    console.log(`[AETHER] Visual Draft Staged for ${target.email}`);
                    resolve({ status: 'STAGED' });
                }
            });
        });
    } finally {
        isDispatching = false;
    }
}

async function run() {
    console.log('[Aether] Initiating Batch Dispatch (HARD LOCK ACTIVE)...');
    
    const targets = [
        { name: "Demo User", email: "demo@example.com", company: "TestCorp" }
    ];

    for (const target of targets) {
        try {
            await dispatchTask(target);
        } catch (e) {
            continue; 
        }
    }

    console.log('[System] AETHER OS: Batch Complete.');
}

module.exports = { run };
