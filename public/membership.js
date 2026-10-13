// ===================================================
// RSBK Online — Membership & Wallet Controller
// ₹1 Per Day · 5:00 AM IST Daily Deduction · Razorpay Gateway
// ===================================================

document.addEventListener('DOMContentLoaded', () => {
    const RAZORPAY_KEY_ID = 'rzp_live_SScE9buh5lMxJ3';
    let currentUser = null;
    let selectedAmount = 365; // Default 1 year

    // DOM Elements
    const walletHeroCard = document.getElementById('walletHeroCard');
    const walletUserName = document.getElementById('walletUserName');
    const walletStatusBadge = document.getElementById('walletStatusBadge');
    const walletStatusText = document.getElementById('walletStatusText');
    const walletBalanceNumber = document.getElementById('walletBalanceNumber');
    const walletDaysRemaining = document.getElementById('walletDaysRemaining');
    const walletDaysSubtext = document.getElementById('walletDaysSubtext');
    const walletValidUntil = document.getElementById('walletValidUntil');

    const amountPresets = document.querySelectorAll('.preset-chip');
    const customAmountInput = document.getElementById('customAmountInput');
    const amountLiveSummary = document.getElementById('amountLiveSummary');
    const previewExpiryDate = document.getElementById('previewExpiryDate');
    const topupErrorAlert = document.getElementById('topupErrorAlert');
    const topupErrorMsg = document.getElementById('topupErrorMsg');
    const btnProceedPayment = document.getElementById('btnProceedPayment');
    const payBtnText = document.getElementById('payBtnText');

    const passbookTableBody = document.getElementById('passbookTableBody');
    const pbFilterTabs = document.querySelectorAll('.pb-filter-tab');
    let currentPbFilter = 'all';

    // Helper: Format Date to Indian Standard Time (IST)
    const formatISTDate = (date) => {
        return new Intl.DateTimeFormat('en-IN', {
            timeZone: 'Asia/Kolkata',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).format(date) + ' IST';
    };

    const formatISTDateShort = (date) => {
        return new Intl.DateTimeFormat('en-IN', {
            timeZone: 'Asia/Kolkata',
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).format(date);
    };

    // Helper: Compute current 5:00 AM IST boundary
    const getISTTime = (d = new Date()) => {
        const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
        return new Date(utc + (3600000 * 5.5)); // UTC+5:30
    };

    const getLatest5AMBoundary = (now = new Date()) => {
        const istNow = getISTTime(now);
        const boundary = new Date(istNow);
        if (istNow.getHours() < 5) {
            // Before 5 AM -> latest 5 AM was yesterday
            boundary.setDate(boundary.getDate() - 1);
        }
        boundary.setHours(5, 0, 0, 0);
        return boundary;
    };

    // Wallet Storage Key
    const getWalletKey = () => {
        const uid = currentUser && currentUser.uid ? currentUser.uid : 'default_user';
        return `rsbk_wallet_${uid}`;
    };

    // Load Wallet
    const loadWallet = () => {
        const key = getWalletKey();
        let wallet = null;
        try {
            const raw = localStorage.getItem(key);
            if (raw) wallet = JSON.parse(raw);
        } catch (e) {
            console.error('Error loading wallet:', e);
        }

        if (!wallet) {
            wallet = {
                balance: 0,
                trialStartDate: Date.now(),
                lastDeductedEpoch: null,
                transactions: []
            };
        }

        if (!wallet.trialStartDate && currentUser && currentUser.uid) {
            const storedTrial = localStorage.getItem(`rsbk_trial_start_${currentUser.uid}`);
            wallet.trialStartDate = storedTrial ? parseInt(storedTrial, 10) : Date.now();
            localStorage.setItem(`rsbk_trial_start_${currentUser.uid}`, wallet.trialStartDate.toString());
        }

        return wallet;
    };

    // Save Wallet
    const saveWallet = (wallet) => {
        const key = getWalletKey();
        try {
            localStorage.setItem(key, JSON.stringify(wallet));
        } catch (e) {
            console.error('Error saving wallet:', e);
        }
    };

    // Process Daily Deductions (₹1 / day at 5:00 AM IST, ONLY after 30-day free trial)
    const TRIAL_MS = 30 * 24 * 60 * 60 * 1000;

    const processDailyDeductions = (wallet) => {
        const now = Date.now();
        const trialStart = wallet.trialStartDate || now;
        const trialEnd = trialStart + TRIAL_MS;

        // Zero deductions during 30-day free trial period
        if (now < trialEnd) {
            wallet.lastDeductedEpoch = trialEnd;
            saveWallet(wallet);
            return wallet;
        }

        // Deductions apply only after trial ends and if balance > 0
        if (!wallet.balance || wallet.balance <= 0) return wallet;

        const latest5AM = getLatest5AMBoundary();
        const latest5AMEpoch = latest5AM.getTime();

        if (!wallet.lastDeductedEpoch || wallet.lastDeductedEpoch < trialEnd) {
            wallet.lastDeductedEpoch = trialEnd;
        }

        if (latest5AMEpoch <= wallet.lastDeductedEpoch) return wallet;

        const diffMs = latest5AMEpoch - wallet.lastDeductedEpoch;
        const daysPassed = Math.floor(diffMs / (24 * 60 * 60 * 1000));

        if (daysPassed > 0) {
            const deductDays = Math.min(daysPassed, Math.floor(wallet.balance));
            if (deductDays > 0) {
                wallet.balance = Math.max(0, wallet.balance - deductDays);
                const deductRecord = {
                    id: 'TXN-DED-' + Date.now(),
                    date: formatISTDate(new Date()),
                    rawDate: Date.now(),
                    type: 'debit',
                    amount: deductDays,
                    note: `Daily Membership Charge (₹1/day × ${deductDays} ${deductDays === 1 ? 'day' : 'days'} at 5:00 AM IST)`,
                    refId: 'AUTO-IST-0500',
                    balanceAfter: wallet.balance
                };
                wallet.transactions.unshift(deductRecord);
            }
            wallet.lastDeductedEpoch = latest5AMEpoch;
            saveWallet(wallet);
        }

        return wallet;
    };

    // Update UI
    const updateWalletUI = () => {
        let wallet = loadWallet();
        wallet = processDailyDeductions(wallet);

        const now = Date.now();
        const trialStart = wallet.trialStartDate || now;
        const trialEnd = trialStart + TRIAL_MS;
        const isTrialActive = now < trialEnd;
        const trialDaysRemaining = isTrialActive ? Math.max(1, Math.ceil((trialEnd - now) / (24 * 60 * 60 * 1000))) : 0;

        const balance = Math.max(0, wallet.balance || 0);
        const paidDays = Math.floor(balance / 1);

        const trialInfoAlert = document.getElementById('trialInfoAlert');
        const trialAlertTitle = document.getElementById('trialAlertTitle');
        const trialAlertDesc = document.getElementById('trialAlertDesc');

        // Display user info
        if (currentUser) {
            walletUserName.textContent = currentUser.displayName || currentUser.email || 'Verified Member';
        } else {
            walletUserName.textContent = 'Member Account (Sign In with Google to Sync)';
        }

        walletBalanceNumber.textContent = balance.toFixed(2);

        if (isTrialActive) {
            walletStatusBadge.className = 'wallet-status-badge trial active';
            walletStatusBadge.innerHTML = '<ion-icon name="sparkles" style="color:#0284c7; margin-right:4px;"></ion-icon> <span>Free Trial Active</span>';
            walletDaysRemaining.textContent = trialDaysRemaining + paidDays;

            const totalExpiryDate = new Date(trialEnd + (paidDays * 24 * 60 * 60 * 1000));
            walletValidUntil.textContent = formatISTDate(totalExpiryDate);
            walletDaysSubtext.textContent = `${trialDaysRemaining} days complimentary trial remaining` + (paidDays > 0 ? ` (+${paidDays} paid days queued)` : '');

            if (trialInfoAlert) {
                trialInfoAlert.style.display = 'flex';
                if (trialAlertTitle) trialAlertTitle.textContent = `30-Day Free Trial Active (${trialDaysRemaining} Days Remaining)`;
                if (trialAlertDesc) trialAlertDesc.textContent = `Your account has complimentary full access until ${formatISTDateShort(new Date(trialEnd))}. No balance is deducted during your trial! Any balance loaded below will start deducting ₹1/day only AFTER your 30-day trial ends.`;
            }
        } else {
            if (paidDays > 0) {
                walletStatusBadge.className = 'wallet-status-badge active';
                walletStatusBadge.innerHTML = '<span class="status-pulse-dot"></span> <span>Active Member</span>';
                walletDaysRemaining.textContent = paidDays;

                const latest5AM = getLatest5AMBoundary();
                const expiryDate = new Date(latest5AM.getTime() + (paidDays * 24 * 60 * 60 * 1000));
                walletValidUntil.textContent = formatISTDate(expiryDate);
                walletDaysSubtext.textContent = `Full access unlocked for ${paidDays} ${paidDays === 1 ? 'day' : 'days'}`;

                if (trialInfoAlert) trialInfoAlert.style.display = 'none';
            } else {
                walletStatusBadge.className = 'wallet-status-badge inactive';
                walletStatusBadge.innerHTML = '<span class="status-pulse-dot"></span> <span>Trial Completed</span>';
                walletDaysRemaining.textContent = '0';
                walletValidUntil.textContent = `Trial ended on ${formatISTDateShort(new Date(trialEnd))}`;
                walletDaysSubtext.textContent = 'Load balance below (₹1/day) to restore daily access';

                if (trialInfoAlert) {
                    trialInfoAlert.style.display = 'flex';
                    if (trialAlertTitle) trialAlertTitle.textContent = '30-Day Free Trial Completed';
                    if (trialAlertDesc) trialAlertDesc.textContent = `Your 30-day complimentary access has finished. Load balance below (from ₹1) to reactivate access to all academic handbooks and books.`;
                }
            }
        }

        // Update preview date
        updatePreviewDate();

        // Render passbook
        renderPassbook(wallet);
    };

    // Calculate Preview Expiry for amount to top-up
    const updatePreviewDate = () => {
        const wallet = loadWallet();
        const now = Date.now();
        const trialStart = wallet.trialStartDate || now;
        const trialEnd = trialStart + TRIAL_MS;
        const isTrialActive = now < trialEnd;

        const currentPaidDays = Math.floor((wallet.balance || 0) / 1);
        const addDays = Math.max(0, parseInt(customAmountInput.value, 10) || 0);
        const totalPaidDays = currentPaidDays + addDays;

        if (isTrialActive) {
            const baseDate = new Date(trialEnd);
            const futureDate = new Date(baseDate.getTime() + (totalPaidDays * 24 * 60 * 60 * 1000));
            if (previewExpiryDate) {
                previewExpiryDate.textContent = formatISTDateShort(futureDate) + ' (05:00 AM IST)';
            }
        } else {
            if (totalPaidDays > 0) {
                const latest5AM = getLatest5AMBoundary();
                const futureDate = new Date(latest5AM.getTime() + (totalPaidDays * 24 * 60 * 60 * 1000));
                if (previewExpiryDate) {
                    previewExpiryDate.textContent = formatISTDateShort(futureDate) + ' (05:00 AM IST)';
                }
            } else {
                if (previewExpiryDate) previewExpiryDate.textContent = '—';
            }
        }
    };

    // Render Passbook Ledger
    const renderPassbook = (wallet) => {
        const txns = wallet.transactions || [];
        let filtered = txns;

        if (currentPbFilter === 'credit') {
            filtered = txns.filter(t => t.type === 'credit');
        } else if (currentPbFilter === 'debit') {
            filtered = txns.filter(t => t.type === 'debit');
        }

        if (filtered.length === 0) {
            passbookTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="passbook-empty">
                        <ion-icon name="receipt-outline"></ion-icon>
                        <p>No transactions found in this view. Load your balance to start your transaction ledger.</p>
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        filtered.forEach(txn => {
            const isCredit = txn.type === 'credit';
            const badgeClass = isCredit ? 'badge-credit' : 'badge-debit';
            const badgeText = isCredit ? 'Top-Up' : 'Daily Charge';
            const sign = isCredit ? '+' : '−';
            const amtClass = isCredit ? 'text-credit' : 'text-debit';

            html += `
                <tr class="passbook-row">
                    <td class="pb-col-date">${txn.date}</td>
                    <td class="pb-col-note">
                        <strong>${txn.note}</strong>
                    </td>
                    <td class="pb-col-ref">
                        <code>${txn.refId || txn.id}</code>
                    </td>
                    <td class="pb-col-type">
                        <span class="badge-pb-type ${badgeClass}">${badgeText}</span>
                    </td>
                    <td class="pb-col-amt ${amtClass}">
                        ${sign}₹${Number(txn.amount).toFixed(2)}
                    </td>
                    <td class="pb-col-balance">
                        <strong>₹${Number(txn.balanceAfter).toFixed(2)}</strong>
                    </td>
                </tr>
            `;
        });

        passbookTableBody.innerHTML = html;
    };

    // Amount Preset selection
    amountPresets.forEach(chip => {
        chip.addEventListener('click', () => {
            amountPresets.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            const amt = parseInt(chip.dataset.amount, 10);
            selectedAmount = amt;
            customAmountInput.value = amt;
            topupErrorAlert.style.display = 'none';

            payBtnText.textContent = `Proceed to Secure Pay (Razorpay) — ₹${amt}`;
            updatePreviewDate();
        });
    });

    // Custom Amount Input Change
    customAmountInput.addEventListener('input', () => {
        const val = parseInt(customAmountInput.value, 10);

        // Highlight preset if exact match
        amountPresets.forEach(chip => {
            if (parseInt(chip.dataset.amount, 10) === val) {
                chip.classList.add('active');
            } else {
                chip.classList.remove('active');
            }
        });

        if (isNaN(val) || val < 1 || val > 10000) {
            topupErrorAlert.style.display = 'flex';
            topupErrorMsg.textContent = 'Please enter an amount between ₹1 and ₹10,000.';
            btnProceedPayment.disabled = true;
            payBtnText.textContent = 'Invalid Amount';
        } else {
            topupErrorAlert.style.display = 'none';
            btnProceedPayment.disabled = false;
            selectedAmount = val;
            payBtnText.textContent = `Proceed to Secure Pay (Razorpay) — ₹${val}`;
        }

        updatePreviewDate();
    });

    // Passbook filter tabs
    pbFilterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            pbFilterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentPbFilter = tab.dataset.filter;
            updateWalletUI();
        });
    });

    // Launch Razorpay Checkout
    btnProceedPayment.addEventListener('click', () => {
        const amount = parseInt(customAmountInput.value, 10);
        if (isNaN(amount) || amount < 1 || amount > 10000) {
            topupErrorAlert.style.display = 'flex';
            topupErrorMsg.textContent = 'Please enter a valid recharge amount between ₹1 and ₹10,000.';
            return;
        }

        // Verify Razorpay is loaded
        if (typeof Razorpay === 'undefined') {
            alert('Razorpay Payment Gateway SDK is loading. Please check your internet connection and try again.');
            return;
        }

        const payerName = currentUser ? (currentUser.displayName || 'RSBK Member') : 'RSBK Member';
        const payerEmail = currentUser ? (currentUser.email || '') : '';

        // Configure Razorpay Checkout options
        const options = {
            key: RAZORPAY_KEY_ID,
            amount: amount * 100, // paise
            currency: 'INR',
            name: 'RSBK Online',
            description: `Wallet Top-Up: ₹${amount} (${amount} Days Access)`,
            image: 'https://rsbk-online.web.app/assets/books/dr_milind_photo.png',
            prefill: {
                name: payerName,
                email: payerEmail,
                contact: ''
            },
            notes: {
                purpose: 'Wallet Daily Membership',
                daily_rate: '1 INR per day at 5 AM IST',
                days_credited: amount,
                user_id: currentUser ? currentUser.uid : 'guest_user'
            },
            theme: {
                color: '#059669' // RSBK Emerald
            },
            modal: {
                backdropclose: false,
                escape: true,
                handleback: true,
                confirm_close: true,
                ondismiss: function () {
                    console.log('Razorpay modal closed by user');
                }
            },
            handler: function (response) {
                // Razorpay Payment Succeeded!
                console.log('Payment successful from Razorpay:', response);

                // Prepare verification payload
                const paymentPayload = {
                    paymentId: response.razorpay_payment_id,
                    orderId: response.razorpay_order_id || ('ORD-' + Date.now()),
                    signature: response.razorpay_signature || '',
                    amount: amount,
                    days: amount,
                    timestamp: Date.now(),
                    userName: payerName,
                    userEmail: payerEmail,
                    userId: currentUser ? currentUser.uid : 'user_' + Date.now()
                };

                // Store in sessionStorage for the confirmation waiting page
                sessionStorage.setItem('rsbk_pending_payment', JSON.stringify(paymentPayload));

                // Instantly redirect to the Payment Confirmation Waiting Page
                window.location.href = `payment-confirmation.html?payment_id=${encodeURIComponent(response.razorpay_payment_id)}&amount=${amount}`;
            }
        };

        try {
            const rzp = new Razorpay(options);
            rzp.on('payment.failed', function (response) {
                console.error('Payment failed:', response.error);
                topupErrorAlert.style.display = 'flex';
                topupErrorMsg.textContent = `Payment failed: ${response.error.description || 'Transaction was declined.'} (Code: ${response.error.code || 'ERR'})`;
            });
            rzp.open();
        } catch (err) {
            console.error('Error opening Razorpay checkout:', err);
            topupErrorAlert.style.display = 'flex';
            topupErrorMsg.textContent = 'Could not initiate Razorpay checkout. Please refresh the page and try again.';
        }
    });

    // Listen for Firebase User Authentication event
    window.addEventListener('rsbk-user-authenticated', (e) => {
        currentUser = e.detail;
        updateWalletUI();
    });

    // Initial render
    updateWalletUI();
});
