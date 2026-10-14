// =========================================================================
// RSBK Online — Administration & Governance Controller
// Strictly restricted to: dr.milindchatrabhuji@gmail.com (and alias milind.chatrabhuji@gmail.com)
// =========================================================================

document.addEventListener('DOMContentLoaded', async () => {
    const ADMIN_EMAILS = [
        'dr.milindchatrabhuji@gmail.com',
        'milind.chatrabhuji@gmail.com'
    ];

    let currentAdminUser = null;
    let allUsers = [];
    let allTransactions = [];
    let selectedUserForAction = null;
    let activeMemberFilter = 'all';
    let activeTxnFilter = 'all';

    // State Elements
    const adminLoadingState = document.getElementById('adminLoadingState');
    const adminSignInState = document.getElementById('adminSignInState');
    const adminDeniedState = document.getElementById('adminDeniedState');
    const adminDashboardContent = document.getElementById('adminDashboardContent');
    const deniedUserEmail = document.getElementById('deniedUserEmail');
    const adminSignInPromptBtn = document.getElementById('adminSignInPromptBtn');
    const adminSwitchAccountBtn = document.getElementById('adminSwitchAccountBtn');

    // Hero & Clock
    const adminClockIST = document.getElementById('adminClockIST');
    const adminWelcomeName = document.getElementById('adminWelcomeName');
    const btnExportAllData = document.getElementById('btnExportAllData');
    const btnRefreshData = document.getElementById('btnRefreshData');

    // Metrics Elements
    const statTotalUsers = document.getElementById('statTotalUsers');
    const statActiveTrials = document.getElementById('statActiveTrials');
    const statPaidMembers = document.getElementById('statPaidMembers');
    const statExpiredUsers = document.getElementById('statExpiredUsers');
    const statTotalRevenue = document.getElementById('statTotalRevenue');
    const statTopupCountSubtext = document.getElementById('statTopupCountSubtext');
    const statNewTodayCount = document.getElementById('statNewTodayCount');

    // Tab Badges & Navigation
    const tabButtons = document.querySelectorAll('.admin-tab-btn');
    const tabContents = document.querySelectorAll('.admin-tab-content');
    const tabBadgeMembers = document.getElementById('tabBadgeMembers');
    const tabBadgeTxns = document.getElementById('tabBadgeTxns');

    // Member Management Elements
    const memberSearchInput = document.getElementById('memberSearchInput');
    const clearMemberSearch = document.getElementById('clearMemberSearch');
    const memberFilterChips = document.querySelectorAll('#memberFilterGroup .filter-chip');
    const membersTableBody = document.getElementById('membersTableBody');
    const memberCountSummary = document.getElementById('memberCountSummary');
    const btnOpenAddMemberModal = document.getElementById('btnOpenAddMemberModal');

    const countFilterAll = document.getElementById('countFilterAll');
    const countFilterTrial = document.getElementById('countFilterTrial');
    const countFilterPaid = document.getElementById('countFilterPaid');
    const countFilterExpired = document.getElementById('countFilterExpired');

    // Financials Elements
    const txnSearchInput = document.getElementById('txnSearchInput');
    const txnFilterChips = document.querySelectorAll('#txnFilterGroup .filter-chip');
    const transactionsTableBody = document.getElementById('transactionsTableBody');
    const txnCountSummary = document.getElementById('txnCountSummary');
    const btnExportLedgerCSV = document.getElementById('btnExportLedgerCSV');
    const countTxnAll = document.getElementById('countTxnAll');
    const countTxnCredit = document.getElementById('countTxnCredit');
    const countTxnDebit = document.getElementById('countTxnDebit');

    const ledgerTotalInflow = document.getElementById('ledgerTotalInflow');
    const ledgerTotalDebits = document.getElementById('ledgerTotalDebits');
    const ledgerActivePool = document.getElementById('ledgerActivePool');

    // Settings & Data Tools
    const btnExportFullJSON = document.getElementById('btnExportFullJSON');
    const btnSeedDemoCohort = document.getElementById('btnSeedDemoCohort');
    const btnResetRegistry = document.getElementById('btnResetRegistry');

    // Modals
    const modalAdjustBalance = document.getElementById('modalAdjustBalance');
    const btnCloseAdjustModal = document.getElementById('btnCloseAdjustModal');
    const btnCancelAdjust = document.getElementById('btnCancelAdjust');
    const btnConfirmAdjust = document.getElementById('btnConfirmAdjust');
    const adjustModalUserLabel = document.getElementById('adjustModalUserLabel');
    const adjustModalCurrentBalance = document.getElementById('adjustModalCurrentBalance');
    const adjustAmountInput = document.getElementById('adjustAmountInput');
    const adjustReasonInput = document.getElementById('adjustReasonInput');
    const btnToggleCredit = document.getElementById('btnToggleCredit');
    const btnToggleDebit = document.getElementById('btnToggleDebit');
    let balanceAdjustType = 'credit';

    const modalExtendTrial = document.getElementById('modalExtendTrial');
    const btnCloseExtendModal = document.getElementById('btnCloseExtendModal');
    const btnCancelExtend = document.getElementById('btnCancelExtend');
    const btnConfirmExtend = document.getElementById('btnConfirmExtend');
    const extendModalUserLabel = document.getElementById('extendModalUserLabel');
    const extendModalCurrentStatus = document.getElementById('extendModalCurrentStatus');
    const extendDaysInput = document.getElementById('extendDaysInput');
    const extendReasonInput = document.getElementById('extendReasonInput');
    const presetDayButtons = document.querySelectorAll('.preset-day-btn');

    const modalAddMember = document.getElementById('modalAddMember');
    const btnCloseAddMemberModal = document.getElementById('btnCloseAddMemberModal');
    const btnCancelAddMember = document.getElementById('btnCancelAddMember');
    const btnConfirmAddMember = document.getElementById('btnConfirmAddMember');
    const newMemberName = document.getElementById('newMemberName');
    const newMemberEmail = document.getElementById('newMemberEmail');
    const newMemberTrialDays = document.getElementById('newMemberTrialDays');
    const newMemberBalance = document.getElementById('newMemberBalance');
    const newMemberRole = document.getElementById('newMemberRole');

    const modalUserPassbook = document.getElementById('modalUserPassbook');
    const btnClosePassbookModal = document.getElementById('btnClosePassbookModal');
    const btnClosePassbookModalBtn = document.getElementById('btnClosePassbookModalBtn');
    const passbookModalUserLabel = document.getElementById('passbookModalUserLabel');
    const pbModalBalance = document.getElementById('pbModalBalance');
    const pbModalTotalCredited = document.getElementById('pbModalTotalCredited');
    const pbModalTotalDebited = document.getElementById('pbModalTotalDebited');
    const userPassbookTableBody = document.getElementById('userPassbookTableBody');

    // -------------------------------------------------------------
    // Helper: Indian Standard Time (IST) Helpers
    // -------------------------------------------------------------
    const getISTTime = (d = new Date()) => {
        const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
        return new Date(utc + (3600000 * 5.5));
    };

    const formatISTDateTime = (epochOrDate) => {
        if (!epochOrDate) return '—';
        const d = new Date(epochOrDate);
        return new Intl.DateTimeFormat('en-IN', {
            timeZone: 'Asia/Kolkata',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).format(d) + ' IST';
    };

    const formatISTDateOnly = (epochOrDate) => {
        if (!epochOrDate) return '—';
        const d = new Date(epochOrDate);
        return new Intl.DateTimeFormat('en-IN', {
            timeZone: 'Asia/Kolkata',
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).format(d);
    };

    // Live Clock Runner
    const startISTClock = () => {
        const update = () => {
            const now = new Date();
            if (adminClockIST) {
                adminClockIST.innerHTML = `<ion-icon name="time-outline"></ion-icon> ${formatISTDateTime(now)}`;
            }
        };
        update();
        setInterval(update, 1000);
    };

    // -------------------------------------------------------------
    // Tab Switching
    // -------------------------------------------------------------
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.tab;
            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetContent = document.getElementById(targetId);
            if (targetContent) targetContent.classList.add('active');
        });
    });

    // -------------------------------------------------------------
    // Seed Realistic Academic Cohort Data
    // (Used when first initializing or when admin requests demo cohort)
    // -------------------------------------------------------------
    const generateDemoCohort = () => {
        const now = Date.now();
        const DAY = 24 * 60 * 60 * 1000;

        return [
            {
                uid: 'usr_pg_001',
                displayName: 'Dr. Ananya Sharma',
                email: 'ananya.sharma.rsbk@gmail.com',
                photoURL: 'https://images.unsplash.com/photo-1594824813637-88981e97669d?auto=format&fit=crop&w=160&q=80',
                role: 'MD Scholar (Rasa Shastra), NIA Jaipur',
                createdAt: now - (8 * DAY),
                trialStartDate: now - (8 * DAY),
                balance: 180,
                isVip: false
            },
            {
                uid: 'usr_pg_002',
                displayName: 'Dr. Rahul V. Deshmukh',
                email: 'dr.deshmukh.ayur@gmail.com',
                photoURL: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=160&q=80',
                role: 'Associate Professor, Podar Ayurved Medical College, Mumbai',
                createdAt: now - (45 * DAY),
                trialStartDate: now - (45 * DAY),
                balance: 365,
                isVip: false
            },
            {
                uid: 'usr_pg_003',
                displayName: 'Dr. Meera Krishnan',
                email: 'meera.krishnan.bhu@gmail.com',
                photoURL: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=160&q=80',
                role: 'Senior Research Fellow, Dept of Rasa Shastra, IMS BHU',
                createdAt: now - (14 * DAY),
                trialStartDate: now - (14 * DAY),
                balance: 50,
                isVip: false
            },
            {
                uid: 'usr_ug_004',
                displayName: 'Pooja Patil',
                email: 'pooja.patil.bams@gmail.com',
                photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80',
                role: 'BAMS Final Year Scholar, Govt Ayurved College, Nanded',
                createdAt: now - (22 * DAY),
                trialStartDate: now - (22 * DAY),
                balance: 0,
                isVip: false
            },
            {
                uid: 'usr_pg_005',
                displayName: 'Dr. Siddharth Joshi',
                email: 'siddharth.joshi.jamnagar@gmail.com',
                photoURL: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=160&q=80',
                role: 'PhD Scholar, ITRA Jamnagar (Gujarat Ayurved University)',
                createdAt: now - (35 * DAY),
                trialStartDate: now - (35 * DAY),
                balance: 0,
                isVip: false
            },
            {
                uid: 'usr_faculty_006',
                displayName: 'Dr. Sunita K. Hegde',
                email: 'sunita.hegde.sdm@gmail.com',
                photoURL: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=160&q=80',
                role: 'Professor & HOD, SDM College of Ayurveda, Udupi',
                createdAt: now - (60 * DAY),
                trialStartDate: now - (60 * DAY),
                balance: 730,
                isVip: true
            },
            {
                uid: 'usr_ug_007',
                displayName: 'Aditya Narayan Nair',
                email: 'aditya.nair.kerala@gmail.com',
                photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
                role: 'BAMS 3rd Professional, VPSV Ayurveda College, Kottakkal',
                createdAt: now - (3 * DAY),
                trialStartDate: now - (3 * DAY),
                balance: 0,
                isVip: false
            },
            {
                uid: 'usr_pg_008',
                displayName: 'Dr. Rajeshwari Sengupta',
                email: 'rajeshwari.sengupta.cal@gmail.com',
                photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80',
                role: 'PG Scholar, JB Roy State Ayurvedic Medical College, Kolkata',
                createdAt: now - (19 * DAY),
                trialStartDate: now - (19 * DAY),
                balance: 90,
                isVip: false
            },
            {
                uid: 'usr_ug_009',
                displayName: 'Karanvir Singh Chawla',
                email: 'karanvir.chawla@gmail.com',
                photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
                role: 'Ayurveda Scholar, Dayanand Ayurvedic College, Jalandhar',
                createdAt: now - (32 * DAY),
                trialStartDate: now - (32 * DAY),
                balance: 0,
                isVip: false
            },
            {
                uid: 'usr_pg_010',
                displayName: 'Dr. Tanvi Parekh',
                email: 'tanvi.parekh.aiia@gmail.com',
                photoURL: 'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=160&q=80',
                role: 'Resident Medical Officer, All India Institute of Ayurveda (AIIA), New Delhi',
                createdAt: now - (12 * DAY),
                trialStartDate: now - (12 * DAY),
                balance: 120,
                isVip: false
            }
        ];
    };

    const generateDemoTransactions = (cohort) => {
        const now = Date.now();
        const DAY = 24 * 60 * 60 * 1000;
        const txns = [];

        // Sample real trial transaction from Razorpay (capturing the user's Rs 5 trial!)
        txns.push({
            id: 'TXN-RZP-9001',
            date: formatISTDateTime(now - (2 * 3600 * 1000)),
            rawDate: now - (2 * 3600 * 1000),
            userName: 'Dr. Milind Chatrabhuji (Author)',
            userEmail: 'dr.milindchatrabhuji@gmail.com',
            userId: 'admin_dr_milind',
            type: 'credit',
            amount: 5,
            note: 'Razorpay Live Top-Up Test (+5 Days Access)',
            refId: 'pay_TnfJ8OHI8mpvlS',
            balanceAfter: 5
        });

        // Add credits and daily debits for cohort members
        cohort.forEach(u => {
            if (u.balance > 0) {
                txns.push({
                    id: 'TXN-RZP-' + Math.floor(10000 + Math.random() * 90000),
                    date: formatISTDateTime(u.createdAt + (2 * 3600 * 1000)),
                    rawDate: u.createdAt + (2 * 3600 * 1000),
                    userName: u.displayName,
                    userEmail: u.email,
                    userId: u.uid,
                    type: 'credit',
                    amount: u.balance,
                    note: `Razorpay Online Top-Up (+${u.balance} Days Access)`,
                    refId: 'pay_' + Math.random().toString(36).substring(2, 16),
                    balanceAfter: u.balance
                });
            }

            // If user has been registered for more than 30 days, add daily debits
            const trialEnd = u.trialStartDate + (30 * DAY);
            if (now > trialEnd && u.balance > 0) {
                const daysPast = Math.min(5, Math.floor((now - trialEnd) / DAY));
                for (let i = 1; i <= daysPast; i++) {
                    txns.push({
                        id: 'TXN-DED-' + Math.floor(10000 + Math.random() * 90000),
                        date: formatISTDateOnly(trialEnd + (i * DAY)) + ' (05:00 AM IST)',
                        rawDate: trialEnd + (i * DAY),
                        userName: u.displayName,
                        userEmail: u.email,
                        userId: u.uid,
                        type: 'debit',
                        amount: 1,
                        note: 'Daily Membership Maintenance (₹1/day at 5:00 AM IST)',
                        refId: 'AUTO-IST-0500',
                        balanceAfter: u.balance - i
                    });
                }
            }
        });

        return txns.sort((a, b) => b.rawDate - a.rawDate);
    };

    // -------------------------------------------------------------
    // Data Loading & Central Store Aggregation
    // -------------------------------------------------------------
    const loadPlatformData = () => {
        // 1. Load User Registry
        let registry = [];
        try {
            const raw = localStorage.getItem('rsbk_users_registry');
            if (raw) registry = JSON.parse(raw);
        } catch (e) {
            console.error('Error loading users registry:', e);
        }

        // If registry is empty or missing, seed initial cohort
        if (!registry || registry.length === 0) {
            registry = generateDemoCohort();
            localStorage.setItem('rsbk_users_registry', JSON.stringify(registry));
        }

        // Ensure Dr. Milind Chatrabhuji is always registered as Super Admin
        const adminEmail = (currentAdminUser ? currentAdminUser.email : 'dr.milindchatrabhuji@gmail.com').toLowerCase();
        let adminRecord = registry.find(u => u.email && u.email.toLowerCase() === adminEmail);
        if (!adminRecord) {
            adminRecord = {
                uid: currentAdminUser ? currentAdminUser.uid : 'admin_dr_milind',
                displayName: 'Dr. Milind Chatrabhuji',
                email: adminEmail,
                photoURL: 'https://rsbk-online.web.app/assets/books/dr_milind_photo.png',
                role: 'Platform Owner & Author (Super Admin)',
                createdAt: Date.now() - (60 * 24 * 60 * 60 * 1000),
                trialStartDate: Date.now() - (60 * 24 * 60 * 60 * 1000),
                balance: 9999,
                isVip: true
            };
            registry.unshift(adminRecord);
            localStorage.setItem('rsbk_users_registry', JSON.stringify(registry));
        }

        // Also inspect localStorage for any real local users saved via rsbk_wallet_* keys
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('rsbk_wallet_')) {
                const uid = key.replace('rsbk_wallet_', '');
                if (uid && uid !== 'default_user') {
                    try {
                        const walletData = JSON.parse(localStorage.getItem(key));
                        let existing = registry.find(u => u.uid === uid);
                        if (existing) {
                            existing.balance = walletData.balance !== undefined ? walletData.balance : existing.balance;
                            if (walletData.trialStartDate) existing.trialStartDate = walletData.trialStartDate;
                        }
                    } catch (e) {}
                }
            }
        }

        // Evaluate access status for each member
        const now = Date.now();
        const TRIAL_MS = 30 * 24 * 60 * 60 * 1000;

        allUsers = registry.map(u => {
            const trialStart = u.trialStartDate || u.createdAt || now;
            const trialEnd = trialStart + TRIAL_MS;
            const isTrialActive = now < trialEnd;
            const trialDaysLeft = isTrialActive ? Math.max(1, Math.ceil((trialEnd - now) / (24 * 60 * 60 * 1000))) : 0;
            const balance = Number(u.balance) || 0;
            const isPaidActive = balance >= 1;
            const isVip = Boolean(u.isVip);

            let status = 'expired';
            if (isVip) {
                status = 'vip';
            } else if (isTrialActive) {
                status = 'trial';
            } else if (isPaidActive) {
                status = 'paid';
            }

            return {
                ...u,
                trialStartDate: trialStart,
                trialEndDate: trialEnd,
                isTrialActive,
                trialDaysLeft,
                balance,
                status
            };
        });

        // 2. Load Global Transactions
        let txns = [];
        try {
            const raw = localStorage.getItem('rsbk_global_transactions');
            if (raw) txns = JSON.parse(raw);
        } catch (e) {
            console.error('Error loading transactions:', e);
        }

        if (!txns || txns.length === 0) {
            txns = generateDemoTransactions(allUsers);
            localStorage.setItem('rsbk_global_transactions', JSON.stringify(txns));
        }

        allTransactions = txns;
    };

    // Save Users back to localStorage
    const saveUsersRegistry = () => {
        try {
            localStorage.setItem('rsbk_users_registry', JSON.stringify(allUsers));
        } catch (e) {
            console.error('Error saving registry:', e);
        }
    };

    // Save Transactions back to localStorage
    const saveGlobalTransactions = () => {
        try {
            localStorage.setItem('rsbk_global_transactions', JSON.stringify(allTransactions));
        } catch (e) {
            console.error('Error saving transactions:', e);
        }
    };

    // -------------------------------------------------------------
    // Render Analytics Overview & Metric Tiles
    // -------------------------------------------------------------
    const updateMetricsUI = () => {
        const total = allUsers.length;
        const activeTrials = allUsers.filter(u => u.status === 'trial').length;
        const paidMembers = allUsers.filter(u => u.status === 'paid' || u.status === 'vip').length;
        const expiredMembers = allUsers.filter(u => u.status === 'expired').length;

        // Calculate Revenue from credit transactions
        const creditTxns = allTransactions.filter(t => t.type === 'credit');
        const grossRevenue = creditTxns.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

        // Calculate Ledger Inflow / Debits / Pool
        const debitTxns = allTransactions.filter(t => t.type === 'debit');
        const totalDebits = debitTxns.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        const activePool = allUsers.reduce((sum, u) => sum + (Number(u.balance) || 0), 0);

        if (statTotalUsers) statTotalUsers.textContent = total;
        if (statActiveTrials) statActiveTrials.textContent = activeTrials;
        if (statPaidMembers) statPaidMembers.textContent = paidMembers;
        if (statExpiredUsers) statExpiredUsers.textContent = expiredMembers;
        if (statTotalRevenue) statTotalRevenue.innerHTML = `&#8377;${grossRevenue.toLocaleString('en-IN')}`;
        if (statTopupCountSubtext) statTopupCountSubtext.textContent = `${creditTxns.length} Razorpay Top-ups recorded`;
        if (statNewTodayCount) statNewTodayCount.textContent = `+${Math.min(total, 4)}`;

        // Tab Badges
        if (tabBadgeMembers) tabBadgeMembers.textContent = total;
        if (tabBadgeTxns) tabBadgeTxns.textContent = allTransactions.length;

        // Ledger Strip
        if (ledgerTotalInflow) ledgerTotalInflow.innerHTML = `&#8377;${grossRevenue.toLocaleString('en-IN')}`;
        if (ledgerTotalDebits) ledgerTotalDebits.innerHTML = `&#8377;${totalDebits.toLocaleString('en-IN')}`;
        if (ledgerActivePool) ledgerActivePool.innerHTML = `&#8377;${activePool.toLocaleString('en-IN')}`;

        // Filter Counts
        if (countFilterAll) countFilterAll.textContent = total;
        if (countFilterTrial) countFilterTrial.textContent = activeTrials;
        if (countFilterPaid) countFilterPaid.textContent = paidMembers;
        if (countFilterExpired) countFilterExpired.textContent = expiredMembers;

        if (countTxnAll) countTxnAll.textContent = allTransactions.length;
        if (countTxnCredit) countTxnCredit.textContent = creditTxns.length;
        if (countTxnDebit) countTxnDebit.textContent = debitTxns.length;
    };

    // -------------------------------------------------------------
    // Render Members Table
    // -------------------------------------------------------------
    const renderMembersTable = () => {
        if (!membersTableBody) return;

        const query = (memberSearchInput ? memberSearchInput.value : '').toLowerCase().trim();

        const filtered = allUsers.filter(u => {
            // Status Filter
            if (activeMemberFilter === 'trial' && u.status !== 'trial') return false;
            if (activeMemberFilter === 'paid' && u.status !== 'paid' && u.status !== 'vip') return false;
            if (activeMemberFilter === 'expired' && u.status !== 'expired') return false;

            // Search Filter
            if (query) {
                const name = (u.displayName || '').toLowerCase();
                const email = (u.email || '').toLowerCase();
                const role = (u.role || '').toLowerCase();
                const uid = (u.uid || '').toLowerCase();
                return name.includes(query) || email.includes(query) || role.includes(query) || uid.includes(query);
            }
            return true;
        });

        if (filtered.length === 0) {
            membersTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="table-empty-row">
                        <ion-icon name="search-outline"></ion-icon>
                        <p>No members found matching your search or filter criteria.</p>
                    </td>
                </tr>
            `;
            if (memberCountSummary) memberCountSummary.textContent = `Showing 0 of ${allUsers.length} members`;
            return;
        }

        membersTableBody.innerHTML = filtered.map(u => {
            const avatar = u.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.displayName || 'U')}&background=059669&color=fff`;
            const joinedDateStr = formatISTDateOnly(u.createdAt);
            const trialEndStr = formatISTDateOnly(u.trialEndDate);

            let statusPillHtml = '';
            if (u.status === 'vip') {
                statusPillHtml = `<span class="badge-status vip" title="Lifetime VIP Pass"><ion-icon name="star"></ion-icon> VIP Bypass</span>`;
            } else if (u.status === 'trial') {
                statusPillHtml = `<span class="badge-status trial" title="30-Day Free Trial"><ion-icon name="sparkles"></ion-icon> Trial (${u.trialDaysLeft}d left)</span>`;
            } else if (u.status === 'paid') {
                statusPillHtml = `<span class="badge-status paid" title="Paid Member"><ion-icon name="checkmark-circle"></ion-icon> Paid Active</span>`;
            } else {
                statusPillHtml = `<span class="badge-status expired" title="Trial Expired · Needs Top-Up"><ion-icon name="alert-circle"></ion-icon> Expired (&#8377;0)</span>`;
            }

            const isAdminRow = (u.email && ADMIN_EMAILS.includes(u.email.toLowerCase()));

            return `
                <tr data-uid="${u.uid}">
                    <td>
                        <div class="member-cell-profile">
                            <img src="${avatar}" alt="${u.displayName || 'User'}" class="table-avatar" referrerpolicy="no-referrer">
                            <div class="member-cell-info">
                                <strong class="member-name">
                                    ${u.displayName || 'Member'}
                                    ${isAdminRow ? '<span class="pill-admin-tag">Admin</span>' : ''}
                                </strong>
                                <span class="member-email">${u.email || '—'}</span>
                                ${u.role ? `<span class="member-role">${u.role}</span>` : ''}
                            </div>
                        </div>
                    </td>
                    <td><span class="table-date">${joinedDateStr}</span></td>
                    <td>${statusPillHtml}</td>
                    <td>
                        <strong class="table-balance ${u.balance > 0 ? 'positive' : 'zero'}">&#8377;${Number(u.balance).toFixed(2)}</strong>
                    </td>
                    <td>
                        <span class="table-date">${trialEndStr}</span>
                        ${u.isTrialActive ? `<div class="table-subdate text-emerald">${u.trialDaysLeft} days remaining</div>` : '<div class="table-subdate text-muted">Completed</div>'}
                    </td>
                    <td style="text-align: right;">
                        <div class="table-actions-group">
                            <button class="btn-action-icon btn-action-balance" data-uid="${u.uid}" title="Adjust Wallet Balance">
                                <ion-icon name="wallet-outline"></ion-icon>
                            </button>
                            <button class="btn-action-icon btn-action-trial" data-uid="${u.uid}" title="Extend Free Trial">
                                <ion-icon name="calendar-outline"></ion-icon>
                            </button>
                            <button class="btn-action-icon btn-action-passbook" data-uid="${u.uid}" title="View Individual Passbook">
                                <ion-icon name="receipt-outline"></ion-icon>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        if (memberCountSummary) {
            memberCountSummary.textContent = `Showing ${filtered.length} of ${allUsers.length} registered members`;
        }

        // Attach action click listeners
        document.querySelectorAll('.btn-action-balance').forEach(btn => {
            btn.addEventListener('click', () => {
                const uid = btn.dataset.uid;
                openAdjustBalanceModal(uid);
            });
        });

        document.querySelectorAll('.btn-action-trial').forEach(btn => {
            btn.addEventListener('click', () => {
                const uid = btn.dataset.uid;
                openExtendTrialModal(uid);
            });
        });

        document.querySelectorAll('.btn-action-passbook').forEach(btn => {
            btn.addEventListener('click', () => {
                const uid = btn.dataset.uid;
                openUserPassbookModal(uid);
            });
        });
    };

    // -------------------------------------------------------------
    // Render Transactions Table
    // -------------------------------------------------------------
    const renderTransactionsTable = () => {
        if (!transactionsTableBody) return;

        const query = (txnSearchInput ? txnSearchInput.value : '').toLowerCase().trim();

        const filtered = allTransactions.filter(t => {
            if (activeTxnFilter === 'credit' && t.type !== 'credit') return false;
            if (activeTxnFilter === 'debit' && t.type !== 'debit') return false;

            if (query) {
                const id = (t.id || '').toLowerCase();
                const name = (t.userName || '').toLowerCase();
                const email = (t.userEmail || '').toLowerCase();
                const note = (t.note || '').toLowerCase();
                const ref = (t.refId || '').toLowerCase();
                return id.includes(query) || name.includes(query) || email.includes(query) || note.includes(query) || ref.includes(query);
            }
            return true;
        });

        if (filtered.length === 0) {
            transactionsTableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="table-empty-row">
                        <ion-icon name="receipt-outline"></ion-icon>
                        <p>No transactions found matching your search or filter.</p>
                    </td>
                </tr>
            `;
            if (txnCountSummary) txnCountSummary.textContent = `Showing 0 of ${allTransactions.length} transactions`;
            return;
        }

        transactionsTableBody.innerHTML = filtered.map(t => {
            const isCredit = t.type === 'credit';
            const badgeClass = isCredit ? 'badge-txn-credit' : 'badge-txn-debit';
            const badgeIcon = isCredit ? 'arrow-down-circle' : 'arrow-up-circle';
            const badgeText = isCredit ? 'Credit (Top-Up)' : 'Debit (Daily)';
            const amountFormatted = isCredit ? `+&#8377;${t.amount}` : `-&#8377;${t.amount}`;

            return `
                <tr>
                    <td><code class="table-code">${t.id}</code></td>
                    <td><span class="table-date">${t.date}</span></td>
                    <td>
                        <div class="table-member-cell">
                            <strong>${t.userName || 'Member'}</strong>
                            <span class="member-email">${t.userEmail || '—'}</span>
                        </div>
                    </td>
                    <td>
                        <span class="${badgeClass}">
                            <ion-icon name="${badgeIcon}"></ion-icon> ${badgeText}
                        </span>
                    </td>
                    <td>
                        <strong class="table-amount ${isCredit ? 'credit' : 'debit'}">${amountFormatted}</strong>
                    </td>
                    <td>
                        <code class="table-code-ref" title="Click to copy" onclick="navigator.clipboard.writeText('${t.refId}'); alert('Copied: ${t.refId}');">
                            ${t.refId || '—'}
                        </code>
                    </td>
                    <td><span class="table-note">${t.note || '—'}</span></td>
                    <td><span class="table-balance-after">&#8377;${Number(t.balanceAfter || 0).toFixed(2)}</span></td>
                </tr>
            `;
        }).join('');

        if (txnCountSummary) {
            txnCountSummary.textContent = `Showing ${filtered.length} of ${allTransactions.length} total transactions`;
        }
    };

    // -------------------------------------------------------------
    // Search & Filter Events
    // -------------------------------------------------------------
    if (memberSearchInput) {
        memberSearchInput.addEventListener('input', () => {
            if (clearMemberSearch) {
                clearMemberSearch.style.display = memberSearchInput.value.length > 0 ? 'inline-flex' : 'none';
            }
            renderMembersTable();
        });
    }

    if (clearMemberSearch) {
        clearMemberSearch.addEventListener('click', () => {
            memberSearchInput.value = '';
            clearMemberSearch.style.display = 'none';
            renderMembersTable();
        });
    }

    memberFilterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            memberFilterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            activeMemberFilter = chip.dataset.filter;
            renderMembersTable();
        });
    });

    if (txnSearchInput) {
        txnSearchInput.addEventListener('input', () => {
            renderTransactionsTable();
        });
    }

    txnFilterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            txnFilterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            activeTxnFilter = chip.dataset.filter;
            renderTransactionsTable();
        });
    });

    // -------------------------------------------------------------
    // Modal 1: Adjust Balance
    // -------------------------------------------------------------
    const openAdjustBalanceModal = (uid) => {
        selectedUserForAction = allUsers.find(u => u.uid === uid);
        if (!selectedUserForAction) return;

        adjustModalUserLabel.textContent = `Member: ${selectedUserForAction.displayName} (${selectedUserForAction.email})`;
        adjustModalCurrentBalance.innerHTML = `&#8377;${Number(selectedUserForAction.balance).toFixed(2)}`;
        adjustAmountInput.value = '';
        adjustReasonInput.value = '';
        balanceAdjustType = 'credit';
        btnToggleCredit.classList.add('active');
        btnToggleDebit.classList.remove('active');

        modalAdjustBalance.style.display = 'flex';
    };

    btnToggleCredit.addEventListener('click', () => {
        balanceAdjustType = 'credit';
        btnToggleCredit.classList.add('active');
        btnToggleDebit.classList.remove('active');
    });

    btnToggleDebit.addEventListener('click', () => {
        balanceAdjustType = 'debit';
        btnToggleDebit.classList.add('active');
        btnToggleCredit.classList.remove('active');
    });

    const closeAdjustModal = () => {
        modalAdjustBalance.style.display = 'none';
        selectedUserForAction = null;
    };

    btnCloseAdjustModal.addEventListener('click', closeAdjustModal);
    btnCancelAdjust.addEventListener('click', closeAdjustModal);

    btnConfirmAdjust.addEventListener('click', () => {
        if (!selectedUserForAction) return;

        const amount = parseFloat(adjustAmountInput.value);
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount greater than ₹0.');
            return;
        }

        const reason = adjustReasonInput.value.trim() || 'Admin manual balance adjustment';
        const prevBal = Number(selectedUserForAction.balance) || 0;
        let newBal = prevBal;

        if (balanceAdjustType === 'credit') {
            newBal = prevBal + amount;
        } else {
            newBal = Math.max(0, prevBal - amount);
        }

        selectedUserForAction.balance = newBal;

        // Record in Global Transactions
        const txnRecord = {
            id: 'TXN-ADM-' + Date.now(),
            date: formatISTDateTime(Date.now()),
            rawDate: Date.now(),
            userName: selectedUserForAction.displayName,
            userEmail: selectedUserForAction.email,
            userId: selectedUserForAction.uid,
            type: balanceAdjustType,
            amount: amount,
            note: `${reason} (${balanceAdjustType === 'credit' ? 'Credited' : 'Debited'} by Admin)`,
            refId: 'ADMIN-OVERRIDE',
            balanceAfter: newBal
        };

        allTransactions.unshift(txnRecord);
        saveGlobalTransactions();

        // Also update individual wallet in localStorage if present
        const walletKey = `rsbk_wallet_${selectedUserForAction.uid}`;
        try {
            let w = { balance: newBal, transactions: [] };
            const existingRaw = localStorage.getItem(walletKey);
            if (existingRaw) w = JSON.parse(existingRaw);
            w.balance = newBal;
            if (!w.transactions) w.transactions = [];
            w.transactions.unshift(txnRecord);
            localStorage.setItem(walletKey, JSON.stringify(w));
        } catch (e) {}

        saveUsersRegistry();
        updateMetricsUI();
        renderMembersTable();
        renderTransactionsTable();
        closeAdjustModal();

        alert(`Wallet balance for ${selectedUserForAction.displayName} updated to ₹${newBal.toFixed(2)}.`);
    });

    // -------------------------------------------------------------
    // Modal 2: Extend Free Trial
    // -------------------------------------------------------------
    const openExtendTrialModal = (uid) => {
        selectedUserForAction = allUsers.find(u => u.uid === uid);
        if (!selectedUserForAction) return;

        extendModalUserLabel.textContent = `Member: ${selectedUserForAction.displayName} (${selectedUserForAction.email})`;
        const currentEndStr = formatISTDateOnly(selectedUserForAction.trialEndDate);
        extendModalCurrentStatus.textContent = selectedUserForAction.isTrialActive 
            ? `Active (${selectedUserForAction.trialDaysLeft} days remaining · Expires ${currentEndStr})`
            : `Expired on ${currentEndStr}`;
        extendDaysInput.value = '30';
        extendReasonInput.value = '';

        modalExtendTrial.style.display = 'flex';
    };

    presetDayButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            presetDayButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            extendDaysInput.value = btn.dataset.days;
        });
    });

    const closeExtendModal = () => {
        modalExtendTrial.style.display = 'none';
        selectedUserForAction = null;
    };

    btnCloseExtendModal.addEventListener('click', closeExtendModal);
    btnCancelExtend.addEventListener('click', closeExtendModal);

    btnConfirmExtend.addEventListener('click', () => {
        if (!selectedUserForAction) return;

        const days = parseInt(extendDaysInput.value, 10);
        if (isNaN(days) || days <= 0) {
            alert('Please enter a valid number of days to extend.');
            return;
        }

        const now = Date.now();
        const DAY_MS = 24 * 60 * 60 * 1000;
        const currentEnd = selectedUserForAction.trialEndDate || now;
        const baseEpoch = currentEnd > now ? currentEnd : now;
        const newTrialEnd = baseEpoch + (days * DAY_MS);

        // Calculate synthetic trial start date so (trialStartDate + 30 days) matches newTrialEnd
        const syntheticStart = newTrialEnd - (30 * DAY_MS);
        selectedUserForAction.trialStartDate = syntheticStart;
        selectedUserForAction.trialEndDate = newTrialEnd;
        selectedUserForAction.isTrialActive = true;
        selectedUserForAction.trialDaysLeft = Math.ceil((newTrialEnd - now) / DAY_MS);
        selectedUserForAction.status = 'trial';

        // Persist to user's local key
        localStorage.setItem(`rsbk_trial_start_${selectedUserForAction.uid}`, syntheticStart.toString());
        const walletKey = `rsbk_wallet_${selectedUserForAction.uid}`;
        try {
            const raw = localStorage.getItem(walletKey);
            if (raw) {
                const w = JSON.parse(raw);
                w.trialStartDate = syntheticStart;
                localStorage.setItem(walletKey, JSON.stringify(w));
            }
        } catch (e) {}

        saveUsersRegistry();
        updateMetricsUI();
        renderMembersTable();
        closeExtendModal();

        alert(`Extended 30-Day Free Trial for ${selectedUserForAction.displayName} by ${days} days until ${formatISTDateOnly(newTrialEnd)}.`);
    });

    // -------------------------------------------------------------
    // Modal 3: Add / Register New Member
    // -------------------------------------------------------------
    if (btnOpenAddMemberModal) {
        btnOpenAddMemberModal.addEventListener('click', () => {
            newMemberName.value = '';
            newMemberEmail.value = '';
            newMemberTrialDays.value = '30';
            newMemberBalance.value = '0';
            newMemberRole.value = '';
            modalAddMember.style.display = 'flex';
        });
    }

    const closeAddMemberModal = () => {
        modalAddMember.style.display = 'none';
    };

    if (btnCloseAddMemberModal) btnCloseAddMemberModal.addEventListener('click', closeAddMemberModal);
    if (btnCancelAddMember) btnCancelAddMember.addEventListener('click', closeAddMemberModal);

    if (btnConfirmAddMember) {
        btnConfirmAddMember.addEventListener('click', () => {
            const name = newMemberName.value.trim();
            const email = newMemberEmail.value.trim().toLowerCase();
            const trialDays = parseInt(newMemberTrialDays.value, 10) || 30;
            const balance = parseFloat(newMemberBalance.value) || 0;
            const role = newMemberRole.value.trim() || 'Ayurvedic Scholar';

            if (!name || !email || !email.includes('@')) {
                alert('Please enter a valid full name and Google email address.');
                return;
            }

            // Check if already registered
            if (allUsers.some(u => u.email && u.email.toLowerCase() === email)) {
                alert(`Member with email ${email} is already registered.`);
                return;
            }

            const now = Date.now();
            const DAY_MS = 24 * 60 * 60 * 1000;
            const uid = 'usr_' + Date.now().toString(36);
            const trialEnd = now + (trialDays * DAY_MS);
            const syntheticStart = trialEnd - (30 * DAY_MS);

            const newUser = {
                uid,
                displayName: name,
                email,
                photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=059669&color=fff`,
                role,
                createdAt: now,
                trialStartDate: syntheticStart,
                trialEndDate: trialEnd,
                isTrialActive: trialDays > 0,
                trialDaysLeft: trialDays,
                balance: balance,
                isVip: false,
                status: trialDays > 0 ? 'trial' : (balance >= 1 ? 'paid' : 'expired')
            };

            allUsers.unshift(newUser);

            // Record initial balance transaction if balance > 0
            if (balance > 0) {
                const txnRecord = {
                    id: 'TXN-INIT-' + Date.now(),
                    date: formatISTDateTime(now),
                    rawDate: now,
                    userName: name,
                    userEmail: email,
                    userId: uid,
                    type: 'credit',
                    amount: balance,
                    note: 'Initial Account Wallet Grant (Admin)',
                    refId: 'ADMIN-GRANT',
                    balanceAfter: balance
                };
                allTransactions.unshift(txnRecord);
                saveGlobalTransactions();
            }

            saveUsersRegistry();
            updateMetricsUI();
            renderMembersTable();
            renderTransactionsTable();
            closeAddMemberModal();

            alert(`Member ${name} (${email}) has been successfully registered!`);
        });
    }

    // -------------------------------------------------------------
    // Modal 4: View User Passbook
    // -------------------------------------------------------------
    const openUserPassbookModal = (uid) => {
        const user = allUsers.find(u => u.uid === uid);
        if (!user) return;

        passbookModalUserLabel.textContent = `Member: ${user.displayName} (${user.email})`;
        pbModalBalance.innerHTML = `&#8377;${Number(user.balance).toFixed(2)}`;

        // Filter transactions for this user
        const userTxns = allTransactions.filter(t => t.userId === uid || (t.userEmail && t.userEmail.toLowerCase() === user.email.toLowerCase()));

        const totalCred = userTxns.filter(t => t.type === 'credit').reduce((s, t) => s + (Number(t.amount) || 0), 0);
        const totalDeb = userTxns.filter(t => t.type === 'debit').reduce((s, t) => s + (Number(t.amount) || 0), 0);

        pbModalTotalCredited.innerHTML = `&#8377;${totalCred}`;
        pbModalTotalDebited.innerHTML = `&#8377;${totalDeb}`;

        if (userTxns.length === 0) {
            userPassbookTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="table-empty-row">
                        <ion-icon name="receipt-outline"></ion-icon>
                        <p>No transactions recorded yet for this member.</p>
                    </td>
                </tr>
            `;
        } else {
            userPassbookTableBody.innerHTML = userTxns.map(t => {
                const isCredit = t.type === 'credit';
                return `
                    <tr>
                        <td><span class="table-date">${t.date}</span></td>
                        <td>
                            <span class="${isCredit ? 'badge-txn-credit' : 'badge-txn-debit'}">
                                ${isCredit ? 'Credit' : 'Debit'}
                            </span>
                        </td>
                        <td>
                            <strong class="table-amount ${isCredit ? 'credit' : 'debit'}">
                                ${isCredit ? '+' : '-'}₹${t.amount}
                            </strong>
                        </td>
                        <td><code class="table-code-ref">${t.refId || '—'}</code></td>
                        <td><span class="table-note">${t.note || '—'}</span></td>
                        <td><span class="table-balance-after">₹${Number(t.balanceAfter || 0).toFixed(2)}</span></td>
                    </tr>
                `;
            }).join('');
        }

        modalUserPassbook.style.display = 'flex';
    };

    const closePassbookModal = () => {
        modalUserPassbook.style.display = 'none';
    };

    if (btnClosePassbookModal) btnClosePassbookModal.addEventListener('click', closePassbookModal);
    if (btnClosePassbookModalBtn) btnClosePassbookModalBtn.addEventListener('click', closePassbookModal);

    // -------------------------------------------------------------
    // Export CSV Ledger
    // -------------------------------------------------------------
    if (btnExportLedgerCSV) {
        btnExportLedgerCSV.addEventListener('click', () => {
            if (allTransactions.length === 0) {
                alert('No transactions recorded to export.');
                return;
            }

            const headers = ['Transaction ID', 'Date & Time (IST)', 'Member Name', 'Member Email', 'Type', 'Amount (INR)', 'Gateway Ref ID', 'Note / Description', 'Balance After (INR)'];
            
            const rows = allTransactions.map(t => [
                `"${t.id || ''}"`,
                `"${t.date || ''}"`,
                `"${(t.userName || '').replace(/"/g, '""')}"`,
                `"${(t.userEmail || '').replace(/"/g, '""')}"`,
                `"${t.type || ''}"`,
                t.amount || 0,
                `"${(t.refId || '').replace(/"/g, '""')}"`,
                `"${(t.note || '').replace(/"/g, '""')}"`,
                t.balanceAfter || 0
            ]);

            const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            const todayStr = formatISTDateOnly(new Date()).replace(/\s+/g, '_');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', `RSBK_Online_Ledger_${todayStr}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    // -------------------------------------------------------------
    // Export Full System JSON Backup
    // -------------------------------------------------------------
    const exportFullJSON = () => {
        const payload = {
            exportDate: formatISTDateTime(Date.now()),
            portal: 'RSBK Online (rsbk-online.web.app)',
            author: 'Dr. Milind Chatrabhuji',
            membersCount: allUsers.length,
            transactionsCount: allTransactions.length,
            users: allUsers,
            transactions: allTransactions
        };

        const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
        const link = document.createElement('a');
        const todayStr = formatISTDateOnly(new Date()).replace(/\s+/g, '_');
        link.setAttribute('href', jsonStr);
        link.setAttribute('download', `RSBK_System_Backup_${todayStr}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (btnExportAllData) btnExportAllData.addEventListener('click', exportFullJSON);
    if (btnExportFullJSON) btnExportFullJSON.addEventListener('click', exportFullJSON);

    // Refresh Sync Data
    if (btnRefreshData) {
        btnRefreshData.addEventListener('click', () => {
            loadPlatformData();
            updateMetricsUI();
            renderMembersTable();
            renderTransactionsTable();
            alert('Platform data successfully synchronized with local registry.');
        });
    }

    // Seed Demo Cohort Button
    if (btnSeedDemoCohort) {
        btnSeedDemoCohort.addEventListener('click', () => {
            const confirmed = confirm('This will supplement your registry with 10 realistic Ayurvedic PG scholars, faculty members, and UG students across India. Proceed?');
            if (confirmed) {
                const demoCohort = generateDemoCohort();
                demoCohort.forEach(d => {
                    if (!allUsers.some(u => u.email === d.email)) {
                        allUsers.push(d);
                    }
                });
                const demoTxns = generateDemoTransactions(allUsers);
                demoTxns.forEach(dt => {
                    if (!allTransactions.some(t => t.id === dt.id)) {
                        allTransactions.push(dt);
                    }
                });
                saveUsersRegistry();
                saveGlobalTransactions();
                updateMetricsUI();
                renderMembersTable();
                renderTransactionsTable();
                alert('Academic demonstration cohort successfully populated!');
            }
        });
    }

    // Reset Registry Button
    if (btnResetRegistry) {
        btnResetRegistry.addEventListener('click', () => {
            const confirmed = confirm('WARNING: Are you sure you want to reset demo data? This will clear test members and transactions, leaving only Dr. Milind Chatrabhuji.');
            if (confirmed) {
                localStorage.removeItem('rsbk_users_registry');
                localStorage.removeItem('rsbk_global_transactions');
                allUsers = [];
                allTransactions = [];
                loadPlatformData();
                updateMetricsUI();
                renderMembersTable();
                renderTransactionsTable();
                alert('Registry has been reset to clean state.');
            }
        });
    }

    // -------------------------------------------------------------
    // Authentication & Access Verification Logic
    // -------------------------------------------------------------
    const showState = (stateName) => {
        if (adminLoadingState) adminLoadingState.style.display = (stateName === 'loading') ? 'flex' : 'none';
        if (adminSignInState) adminSignInState.style.display = (stateName === 'signin') ? 'flex' : 'none';
        if (adminDeniedState) adminDeniedState.style.display = (stateName === 'denied') ? 'flex' : 'none';
        if (adminDashboardContent) adminDashboardContent.style.display = (stateName === 'authorized') ? 'block' : 'none';
    };

    const verifyAdminAccess = (user) => {
        if (!user) {
            showState('signin');
            return;
        }

        const email = (user.email || '').toLowerCase().trim();
        const isAdmin = ADMIN_EMAILS.includes(email);

        if (!isAdmin) {
            if (deniedUserEmail) deniedUserEmail.textContent = user.email || 'Current Account';
            showState('denied');
            return;
        }

        // AUTHORIZED!
        currentAdminUser = user;
        if (adminWelcomeName) {
            adminWelcomeName.textContent = user.displayName || 'Dr. Milind Chatrabhuji';
        }

        // Cache admin authorization
        localStorage.setItem('rsbk_is_admin', 'true');
        document.documentElement.classList.add('admin-authorized');

        // Reveal Dashboard
        showState('authorized');
        startISTClock();
        loadPlatformData();
        updateMetricsUI();
        renderMembersTable();
        renderTransactionsTable();
    };

    // Listen for Firebase Auth event dispatched from script.js
    window.addEventListener('rsbk-user-authenticated', (e) => {
        verifyAdminAccess(e.detail);
    });

    // Handle prompt sign-in button
    if (adminSignInPromptBtn) {
        adminSignInPromptBtn.addEventListener('click', () => {
            const googleSignInBtn = document.getElementById('googleSignInBtn');
            if (googleSignInBtn) {
                googleSignInBtn.click();
            } else {
                alert('Initializing Google authentication...');
            }
        });
    }

    // Handle switch account
    if (adminSwitchAccountBtn) {
        adminSwitchAccountBtn.addEventListener('click', () => {
            const signOutBtn = document.getElementById('signOutBtn');
            if (signOutBtn) {
                signOutBtn.click();
            } else {
                localStorage.clear();
                window.location.reload();
            }
        });
    }

    // Fast check: if cached user is already admin
    const cachedEmail = (localStorage.getItem('rsbk_user_email') || '').toLowerCase();
    if (localStorage.getItem('rsbk_auth_cached') === 'true' && ADMIN_EMAILS.includes(cachedEmail)) {
        verifyAdminAccess({
            displayName: localStorage.getItem('rsbk_user_name') || 'Dr. Milind Chatrabhuji',
            email: cachedEmail,
            uid: 'admin_cached'
        });
    } else if (localStorage.getItem('rsbk_auth_cached') === 'true' && cachedEmail && !ADMIN_EMAILS.includes(cachedEmail)) {
        verifyAdminAccess({
            displayName: localStorage.getItem('rsbk_user_name') || 'User',
            email: cachedEmail,
            uid: 'user_cached'
        });
    } else {
        // Wait up to 2 seconds for Firebase auth before defaulting to signin state
        setTimeout(() => {
            if (!currentAdminUser && adminLoadingState && adminLoadingState.style.display === 'flex') {
                showState('signin');
            }
        }, 2200);
    }
});
