/**
 * RSBK Online — Automated Email Notification Service
 * Dispatches responsive HTML emails for:
 * 1. Account Creation (30-Day Free Trial Welcome)
 * 2. Successful Wallet Top-up (Razorpay Receipt)
 * 3. Low Wallet Balance Alert (3-Day Expiry Warning)
 */

window.RSBK = window.RSBK || {};

window.RSBK.EmailService = (function () {
    // Google Apps Script Web App Endpoint for MailApp.sendEmail
    const APPS_SCRIPT_EMAIL_ENDPOINT = 'https://script.google.com/macros/s/AKfycbythI1dm3szewe6sbnsA6M7gIfyLdNGAhPEvWIbFbniSOCJEU4KoUQ_zVDQnzS-3-1gpw/exec';

    /**
     * Generate responsive HTML email templates
     */
    function buildEmailHtml(type, data) {
        const { recipientName, recipientEmail, details } = data;
        const currentYear = new Date().getFullYear();

        const baseWrapper = (title, bodyContent) => `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${title}</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 10px;">
                    <tr>
                        <td align="center">
                            <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
                                <!-- Header Banner -->
                                <tr>
                                    <td style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 35px 30px; text-align: center;">
                                        <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">RSBK Online<span style="color: #a7f3d0;">.</span></h1>
                                        <p style="color: #d1fae5; margin: 6px 0 0; font-size: 13px; font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase;">Ayurvedic Pharmaceutical Sciences &amp; Research Portal</p>
                                    </td>
                                </tr>
                                <!-- Main Body -->
                                <tr>
                                    <td style="padding: 35px 30px 25px;">
                                        ${bodyContent}
                                    </td>
                                </tr>
                                <!-- Footer -->
                                <tr>
                                    <td style="background-color: #f8fafc; padding: 25px 30px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 12px; line-height: 1.6;">
                                        <p style="margin: 0 0 4px; font-weight: 600; color: #334155;">RSBK Online by Dr. Milind Chatrabhuji</p>
                                        <p style="margin: 0 0 8px;">Advancing Ayurvedic Pedagogical Frameworks, Cognitive Taxonomy &amp; Clinical Research</p>
                                        <p style="margin: 0;"><a href="https://rsbk-online.web.app" style="color: #059669; text-decoration: none; font-weight: 600;">Visit Website</a> · <a href="https://rsbk-online.web.app/membership.html" style="color: #059669; text-decoration: none; font-weight: 600;">Membership</a> · <a href="https://rsbk-online.web.app/forum.html" style="color: #059669; text-decoration: none; font-weight: 600;">Forum</a></p>
                                        <p style="margin: 12px 0 0; font-size: 11px; color: #94a3b8;">&copy; ${currentYear} Dr. Milind Chatrabhuji. All rights reserved.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `;

        if (type === 'welcome') {
            const expiryDate = details.expiryDate || 'in 30 Days';
            return baseWrapper('Welcome to RSBK Online — 30-Day Free Trial Activated', `
                <div style="text-align: center; margin-bottom: 25px;">
                    <span style="display: inline-block; background-color: #ecfdf5; color: #059669; font-weight: 700; font-size: 12px; padding: 6px 14px; border-radius: 50px; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #a7f3d0;">
                        30-Day Complimentary Trial Active
                    </span>
                    <h2 style="color: #0f172a; margin: 15px 0 8px; font-size: 22px; font-weight: 800;">Welcome to RSBK Online, ${recipientName}!</h2>
                    <p style="color: #475569; margin: 0; font-size: 15px; line-height: 1.6;">
                        Your Google account (<strong>${recipientEmail}</strong>) has been granted complimentary full access to all textbooks, faculty handbooks, and clinical treatises.
                    </p>
                </div>

                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
                    <h3 style="color: #0f172a; margin: 0 0 12px; font-size: 15px; font-weight: 700;">What is included in your access:</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #334155; font-size: 14px; line-height: 1.8;">
                        <li><strong>6 Teacher Handbooks:</strong> Bloom's Taxonomy (L1–L6) &amp; Miller's Pyramid Competency Blueprints.</li>
                        <li><strong>Student Curriculum:</strong> MD/MS Semester II Applied Basics Textbook, Companion Workbook &amp; 53 Case ABQ Question Bank.</li>
                        <li><strong>Academic Discussion Forum:</strong> Share clinical observations, discuss classical shlokas, and attach lab files.</li>
                        <li><strong>Fair Billing:</strong> Your 30 days are 100% free. Afterward, access is just <strong>₹1 per day</strong> with zero automatic bank debits.</li>
                    </ul>
                </div>

                <div style="text-align: center; margin: 30px 0 15px;">
                    <a href="https://rsbk-online.web.app" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 14px rgba(5, 150, 105, 0.3);">
                        Start Exploring Handbooks &rarr;
                    </a>
                </div>
            `);
        }

        if (type === 'recharge_receipt') {
            const { amount, daysAdded, paymentId, date, newBalance, validUntil } = details;
            return baseWrapper(`Payment Confirmation: ₹${amount} Added to RSBK Wallet`, `
                <div style="text-align: center; margin-bottom: 25px;">
                    <span style="display: inline-block; background-color: #ecfdf5; color: #059669; font-weight: 700; font-size: 12px; padding: 6px 14px; border-radius: 50px; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #a7f3d0;">
                        Payment Successful · Razorpay Verified
                    </span>
                    <h2 style="color: #0f172a; margin: 15px 0 8px; font-size: 22px; font-weight: 800;">Wallet Top-Up Confirmation</h2>
                    <p style="color: #475569; margin: 0; font-size: 15px;">
                        Thank you, <strong>${recipientName}</strong>. Your payment has been received and credited to your wallet.
                    </p>
                </div>

                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 25px;">
                    <tr>
                        <td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px; font-weight: 600;">Amount Paid</td>
                        <td align="right" style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #059669; font-size: 16px; font-weight: 800;">₹${amount}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px; font-weight: 600;">Access Credited</td>
                        <td align="right" style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 14px; font-weight: 700;">+${daysAdded} Days</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px; font-weight: 600;">New Wallet Balance</td>
                        <td align="right" style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 14px; font-weight: 700;">₹${newBalance}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px; font-weight: 600;">Access Valid Until</td>
                        <td align="right" style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 14px; font-weight: 700;">${validUntil} (5:00 AM IST)</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px; font-weight: 600;">Payment Reference ID</td>
                        <td align="right" style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 12px; font-family: monospace;">${paymentId}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 18px; color: #64748b; font-size: 13px; font-weight: 600;">Transaction Date</td>
                        <td align="right" style="padding: 12px 18px; color: #64748b; font-size: 13px;">${date}</td>
                    </tr>
                </table>

                <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 12px 16px; margin-bottom: 25px; font-size: 12px; color: #991b1b; line-height: 1.5;">
                    <strong>Non-Refundable Policy:</strong> Exactly ₹1.00 is deducted daily at 5:00 AM IST. Any payment done is not at all refundable under any circumstances.
                </div>

                <div style="text-align: center;">
                    <a href="https://rsbk-online.web.app/membership.html" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 12px 28px; border-radius: 8px;">
                        View Wallet Passbook &rarr;
                    </a>
                </div>
            `);
        }

        if (type === 'low_balance') {
            const { daysRemaining, currentBalance, expiryDate } = details;
            return baseWrapper(`Reminder: 3 Days Remaining on your RSBK Online Access`, `
                <div style="text-align: center; margin-bottom: 25px;">
                    <span style="display: inline-block; background-color: #fffbeb; color: #b45309; font-weight: 700; font-size: 12px; padding: 6px 14px; border-radius: 50px; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #fde68a;">
                        Access Expiration Alert
                    </span>
                    <h2 style="color: #0f172a; margin: 15px 0 8px; font-size: 22px; font-weight: 800;">3 Days Remaining on your Access</h2>
                    <p style="color: #475569; margin: 0; font-size: 15px; line-height: 1.6;">
                        Dear <strong>${recipientName}</strong>, your active RSBK Online access is scheduled to expire on <strong>${expiryDate}</strong> (Current balance: ₹${currentBalance}).
                    </p>
                </div>

                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
                    <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 12px;">
                        To prevent disruption in your research notes, case ABQ study materials, and faculty handbook consultations, you can easily top up any amount between ₹1 and ₹10,000 (just <strong>₹1/day</strong>).
                    </p>
                    <p style="color: #059669; font-size: 13px; font-weight: 700; margin: 0;">
                        ✓ Zero auto-debit mandates &nbsp;·&nbsp; ✓ No debt accumulates on zero balance
                    </p>
                </div>

                <div style="text-align: center; margin: 30px 0 15px;">
                    <a href="https://rsbk-online.web.app/membership.html" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 14px rgba(5, 150, 105, 0.3);">
                        Recharge Wallet (₹1/Day) &rarr;
                    </a>
                </div>
            `);
        }

        if (type === 'doctor_verification_submitted') {
            const { degree, regNo, institution, paymentId, submittedAt } = details;
            return baseWrapper('Doctor / Faculty Badge Application Received (₹100 Paid)', `
                <div style="text-align: center; margin-bottom: 25px;">
                    <span style="display: inline-block; background-color: #ecfdf5; color: #059669; font-weight: 700; font-size: 12px; padding: 6px 14px; border-radius: 50px; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #a7f3d0;">
                        Application Under Review · ₹100 Paid
                    </span>
                    <h2 style="color: #0f172a; margin: 15px 0 8px; font-size: 22px; font-weight: 800;">Doctor Verification Received</h2>
                    <p style="color: #475569; margin: 0; font-size: 15px;">
                        Dear <strong>${recipientName}</strong>, thank you for submitting your academic and medical credentials for official verification on RSBK Online.
                    </p>
                </div>

                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 25px;">
                    <tr>
                        <td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px; font-weight: 600;">Highest Degree</td>
                        <td align="right" style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #059669; font-size: 14px; font-weight: 800;">${degree}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px; font-weight: 600;">Council Registration No.</td>
                        <td align="right" style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 13px; font-family: monospace; font-weight: 700;">${regNo}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px; font-weight: 600;">Affiliated Institution</td>
                        <td align="right" style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 13px;">${institution}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px; font-weight: 600;">Verification Fee Paid</td>
                        <td align="right" style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #059669; font-size: 15px; font-weight: 800;">₹100 (Non-refundable)</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 18px; color: #64748b; font-size: 13px; font-weight: 600;">Razorpay Reference ID</td>
                        <td align="right" style="padding: 12px 18px; color: #64748b; font-size: 12px; font-family: monospace;">${paymentId}</td>
                    </tr>
                </table>

                <div style="background-color: #f1f5f9; border-radius: 10px; padding: 14px 18px; margin-bottom: 25px; font-size: 13px; color: #334155; line-height: 1.6;">
                    <strong>Next Steps:</strong> Dr. Milind Chatrabhuji will verify your certificate scan against the official State / NCISM council records within 24–48 hours. Once approved, your official <strong>Verified Doctor / Faculty</strong> checkmark badge will be permanently activated.
                </div>
            `);
        }

        if (type === 'doctor_verification_approved') {
            const { degree, regNo, approvedAt } = details;
            return baseWrapper('Congratulations! Verified Doctor Badge Approved — RSBK Online', `
                <div style="text-align: center; margin-bottom: 25px;">
                    <span style="display: inline-block; background-color: #ecfdf5; color: #059669; font-weight: 700; font-size: 12px; padding: 6px 14px; border-radius: 50px; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #a7f3d0;">
                        Credentials Verified · Badge Active
                    </span>
                    <h2 style="color: #0f172a; margin: 15px 0 8px; font-size: 22px; font-weight: 800;">Congratulations, Dr. ${recipientName}!</h2>
                    <p style="color: #475569; margin: 0; font-size: 15px;">
                        Your medical and academic credentials (<strong>${degree}</strong>, Reg: <strong>${regNo}</strong>) have been officially verified by Dr. Milind Chatrabhuji on ${approvedAt}.
                    </p>
                </div>

                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
                    <h3 style="color: #0f172a; margin: 0 0 10px; font-size: 15px; font-weight: 700;">Your Verified Status Privileges:</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #334155; font-size: 14px; line-height: 1.8;">
                        <li><strong>Profile Checkmark:</strong> An emerald "Verified Doctor / Faculty" checkmark on your public academic profile.</li>
                        <li><strong>Forum Credibility:</strong> Every question, clinical discussion, and reply you post displays your verified doctor badge.</li>
                        <li><strong>Academic Network:</strong> Recognition among students, PG scholars, and peer faculties across India.</li>
                    </ul>
                </div>

                <div style="text-align: center; margin: 30px 0 15px;">
                    <a href="https://rsbk-online.web.app/profile.html" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 14px rgba(5, 150, 105, 0.3);">
                        View Verified Profile &rarr;
                    </a>
                </div>
            `);
        }

        if (type === 'doctor_verification_rejected') {
            const { reason } = details;
            return baseWrapper('Update on your Doctor / Faculty Verification Application', `
                <div style="text-align: center; margin-bottom: 25px;">
                    <span style="display: inline-block; background-color: #fef2f2; color: #dc2626; font-weight: 700; font-size: 12px; padding: 6px 14px; border-radius: 50px; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #fecaca;">
                        Verification Update
                    </span>
                    <h2 style="color: #0f172a; margin: 15px 0 8px; font-size: 22px; font-weight: 800;">Application Status Update</h2>
                    <p style="color: #475569; margin: 0; font-size: 15px;">
                        Dear <strong>${recipientName}</strong>, your verification application could not be approved at this time.
                    </p>
                </div>

                <div style="background-color: #fff1f2; border: 1px solid #ffe4e6; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
                    <h3 style="color: #9f1239; margin: 0 0 8px; font-size: 14px; font-weight: 700;">Reason Provided by Administration:</h3>
                    <p style="color: #881337; margin: 0; font-size: 14px; line-height: 1.6;">
                        ${reason || 'The uploaded certificate scan or council registration details could not be validated.'}
                    </p>
                </div>

                <p style="color: #64748b; font-size: 13px; line-height: 1.6; text-align: center;">
                    If you believe this was an error or would like to submit clearer documentation, please reply directly or contact <a href="mailto:dr.milindchatrabhuji@gmail.com" style="color: #059669; font-weight: 600;">dr.milindchatrabhuji@gmail.com</a>.
                </p>
            `);
        }

        return '';
    }

    /**
     * Send email via Apps Script / backend dispatcher
     */
    async function sendNotification(type, payload) {
        try {
            const html = buildEmailHtml(type, payload);
            let subject = 'RSBK Online Academic Portal';
            if (type === 'welcome') subject = 'Welcome to RSBK Online — 30-Day Free Trial Activated';
            if (type === 'recharge_receipt') subject = `Payment Confirmation: ₹${payload.details.amount} Added to Wallet (RSBK Online)`;
            if (type === 'low_balance') subject = 'Notice: 3 Days Remaining on your RSBK Online Access';
            if (type === 'doctor_verification_submitted') subject = 'Application Received: Doctor / Faculty Verification (₹100 Paid)';
            if (type === 'doctor_verification_approved') subject = 'Congratulations! Verified Doctor / Faculty Badge Granted (RSBK Online)';
            if (type === 'doctor_verification_rejected') subject = 'Notice: Doctor / Faculty Verification Application Update (RSBK Online)';

            const requestBody = {
                action: 'send_email',
                to: payload.recipientEmail,
                subject: subject,
                htmlBody: html
            };

            // Non-blocking fetch to backend email dispatcher
            fetch(APPS_SCRIPT_EMAIL_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(requestBody)
            }).then(r => r.json()).then(res => {
                console.log('Automated email dispatched:', res);
            }).catch(err => {
                console.log('Email dispatcher notice (logged):', err);
            });

            return true;
        } catch (e) {
            console.warn('Email dispatch warning:', e);
            return false;
        }
    }

    return {
        sendNotification: sendNotification,
        buildEmailHtml: buildEmailHtml
    };
})();
