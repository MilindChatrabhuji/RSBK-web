// ===================================================
// RSBK Online — Scholar Membership & Wallet Controller
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
        const uid = currentUser && currentUser.uid ? currentUser.uid : 'default_scholar';
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
                lastDeductedEpoch: null,
                transactions: []
            };
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

    // Process Daily Deductions (₹1 / day at 5:00 AM IST)
    const processDailyDeductions = (wallet) => {
        if (!wallet.balance || wallet.balance <= 0) return wallet;

        const latest5AM = getLatest5AMBoundary();
        const latest5AMEpoch = latest5AM.getTime();

        if (!wallet.lastDeductedEpoch) {
            // Initialize anchor
            wallet.lastDeductedEpoch = latest5AMEpoch;
            saveWallet(wallet);
            return wallet;
        }

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

        const balance = Math.max(0, wallet.balance || 0);
        const daysRemaining = Math.floor(balance / 1);

        // Display user info
        if (currentUser) {
            walletUserName.textContent = currentUser.displayName || currentUser.email || 'Verified Scholar';
        } else {
            walletUserName.textContent = 'Scholar Account (Sign In with Google to Sync)';
        }

        // Metrics
        walletBalanceNumber.textContent = balance.toFixed(2);
        walletDaysRemaining.textContent = daysRemaining;

        // Expiry calculation
        if (daysRemaining > 0) {
            walletStatusBadge.className = 'wallet-status-badge active';
            walletStatusText.textContent = 'Active Scholar';

            const latest5AM = getLatest5AMBoundary();
            const expiryDate = new Date(latest5AM.getTime() + (daysRemaining * 24 * 60 * 60 * 1000));
            walletValidUntil.textContent = formatISTDate(expiryDate);
            walletDaysSubtext.textContent = `Full access unlocked for ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'}`;
        } else {
            walletStatusBadge.className = 'wallet-status-badge inactive';
            walletStatusText.textContent = 'Top-Up Required';
            walletValidUntil.textContent = 'No active balance';
            walletDaysSubtext.textContent = 'Load balance starting at ₹1 to activate daily access';
        }

        // Update preview date
        updatePreviewDate();

        // Render passbook
        renderPassbook(wallet);
    };

    // Calculate Preview Expiry for amount to top-up
    const updatePreviewDate = () => {
        const wallet = loadWallet();
        const currentDays = Math.floor((wallet.balance || 0) / 1);
        const addDays = Math.max(0, parseInt(customAmountInput.value, 10) || 0);
        const totalDays = currentDays + addDays;

        if (totalDays > 0) {
            const latest5AM = getLatest5AMBoundary();
            const futureDate = new Date(latest5AM.getTime() + (totalDays * 24 * 60 * 60 * 1000));
            if (previewExpiryDate) {
                previewExpiryDate.textContent = formatISTDateShort(futureDate) + ' (05:00 AM IST)';
            }
        } else {
            if (previewExpiryDate) previewExpiryDate.textContent = '—';
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
                        <p>No transactions found in this view. Load your balance to start your scholar ledger.</p>
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

        const scholarName = currentUser ? (currentUser.displayName || 'RSBK Scholar') : 'RSBK Scholar';
        const scholarEmail = currentUser ? (currentUser.email || '') : '';

        // Configure Razorpay Checkout options
        const options = {
            key: RAZORPAY_KEY_ID,
            amount: amount * 100, // paise
            currency: 'INR',
            name: 'RSBK Online',
            description: `Scholar Wallet Top-Up: ₹${amount} (${amount} Days Access)`,
            image: 'https://rsbk-online.web.app/assets/books/dr_milind_photo.png',
            prefill: {
                name: scholarName,
                email: scholarEmail,
                contact: ''
            },
            notes: {
                purpose: 'Scholar Wallet Daily Membership',
                daily_rate: '1 INR per day at 5 AM IST',
                days_credited: amount,
                user_id: currentUser ? currentUser.uid : 'guest_scholar'
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
                    scholarName: scholarName,
                    scholarEmail: scholarEmail,
                    userId: currentUser ? currentUser.uid : 'scholar_' + Date.now()
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
