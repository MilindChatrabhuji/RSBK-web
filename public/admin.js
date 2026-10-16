// =========================================================================
// RSBK Online — Administration & Governance Controller
// Strictly restricted to: dr.milindchatrabhuji@gmail.com (and alias milind.chatrabhuji@gmail.com)
// =========================================================================

document.addEventListener('DOMContentLoaded', async () => {
    const ADMIN_EMAILS = [
        'dr.milindchatrabhuji@gmail.com',
        'milind.chatrabhuji@gmail.com'
    ];

    // Unlimited VIP Lifetime Access Accounts (Never expire, zero daily deductions, no recharge needed)
    const UNLIMITED_VIP_EMAILS = [
        'milind.chatrabhuji@gmail.com',
        'dr.milindchatrabhuji@gmail.com',
        'milind.chatrabhuji32052@paruluniversity.com',
        'milind.chatrabhuji32052@paruluniversity.ac.in',
        'dr.smitachatrabhuji@gmail.com'
    ];

    const checkIsUnlimitedVip = (email) => {
        if (!email) return false;
        return UNLIMITED_VIP_EMAILS.includes(email.toLowerCase().trim());
    };

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

        // Add credits and daily debits for demo cohort members ONLY (never touch or duplicate admin)
        cohort.forEach(u => {
            if (u.email && ADMIN_EMAILS.includes(u.email.toLowerCase().trim())) {
                return; // SKIP ADMIN
            }

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

        if (!registry) registry = [];

        // Consolidate admin accounts (dr.milindchatrabhuji@gmail.com and milind.chatrabhuji@gmail.com are the same author)
        const activeAdminEmail = (currentAdminUser ? currentAdminUser.email : (localStorage.getItem('rsbk_user_email') || 'dr.milindchatrabhuji@gmail.com')).toLowerCase().trim();
        
        let adminRecord = null;
        const nonAdminMembers = [];

        registry.forEach(u => {
            if (!u || !u.email) return;
            const emailLower = u.email.toLowerCase().trim();
            if (ADMIN_EMAILS.includes(emailLower)) {
                if (!adminRecord) {
                    adminRecord = u;
                }
            } else {
                const alreadyExists = nonAdminMembers.some(ex => 
                    (ex.email && ex.email.toLowerCase().trim() === emailLower) ||
                    (ex.uid && ex.uid === u.uid)
                );
                if (!alreadyExists) {
                    nonAdminMembers.push(u);
                }
            }
        });

        if (!adminRecord) {
            adminRecord = {
                uid: currentAdminUser ? currentAdminUser.uid : 'admin_dr_milind',
                displayName: 'Milind Chatrabhuji',
                email: activeAdminEmail,
                photoURL: 'https://rsbk-online.web.app/assets/books/dr_milind_photo.png',
                role: 'Platform Administrator',
                createdAt: Date.now() - (60 * 24 * 60 * 60 * 1000),
                trialStartDate: Date.now() - (60 * 24 * 60 * 60 * 1000),
                balance: 5,
                isVip: true
            };
        } else {
            adminRecord.displayName = 'Milind Chatrabhuji';
            adminRecord.email = activeAdminEmail;
            adminRecord.role = 'Platform Administrator';
            adminRecord.isVip = true;
            adminRecord.balance = 5;
        }

        registry = [adminRecord, ...nonAdminMembers];

        // Also inspect localStorage for any real local users saved via rsbk_wallet_* keys
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('rsbk_wallet_')) {
                const uid = key.replace('rsbk_wallet_', '');
                if (uid && uid !== 'default_user' && uid !== adminRecord.uid) {
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
            const email = (u.email || '').toLowerCase().trim();
            const isVip = Boolean(u.isVip || u.unlimitedAccess || checkIsUnlimitedVip(email));
            const balance = isVip ? Math.max(Number(u.balance) || 0, 9999) : (Number(u.balance) || 0);
            const isPaidActive = balance >= 1;

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
                trialEndDate: isVip ? (now + (3650 * 24 * 60 * 60 * 1000)) : trialEnd,
                isTrialActive,
                trialDaysLeft: isVip ? '∞' : trialDaysLeft,
                balance,
                status,
                isVip
            };
        });

        // 2. Load Transactions: Gather genuine transactions and purge synthetic mock entries
        const genuineWalletTxns = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('rsbk_wallet_')) {
                try {
                    const w = JSON.parse(localStorage.getItem(key));
                    if (w && Array.isArray(w.transactions)) {
                        w.transactions.forEach(wt => {
                            if (wt && wt.amount) {
                                genuineWalletTxns.push(wt);
                            }
                        });
                    }
                } catch (e) {}
            }
        }

        let existingGlobal = [];
        try {
            const raw = localStorage.getItem('rsbk_global_transactions');
            if (raw) existingGlobal = JSON.parse(raw);
        } catch (e) {}

        const combinedTxns = [];

        // Add real wallet transactions, normalizing any VIP grants to complimentary type
        genuineWalletTxns.forEach(wt => {
            if ((wt.id && wt.id.startsWith('TXN-VIP-')) || (wt.refId && (wt.refId.startsWith('ADMIN-VIP') || wt.refId === 'ADMIN-VIP-ACTION'))) {
                wt.type = 'vip';
                wt.amount = 0;
                wt.refId = 'ADMIN-VIP-PASS';
                wt.balanceAfter = '∞';
            }
            combinedTxns.push(wt);
        });

        // Add legitimate global transactions, PURGING any synthetic TXN-RZP- entries and normalizing VIP grants
        if (Array.isArray(existingGlobal)) {
            existingGlobal.forEach(t => {
                if (t.id && t.id.startsWith('TXN-RZP-')) {
                    return; // PURGE MOCK DATA
                }
                if ((t.id && t.id.startsWith('TXN-VIP-')) || (t.refId && (t.refId.startsWith('ADMIN-VIP') || t.refId === 'ADMIN-VIP-ACTION'))) {
                    t.type = 'vip';
                    t.amount = 0;
                    t.refId = 'ADMIN-VIP-PASS';
                    t.balanceAfter = '∞';
                }
                combinedTxns.push(t);
            });
        }

        // If no transactions exist, ensure the real Rs 5 trial payment is present
        if (combinedTxns.length === 0) {
            combinedTxns.push({
                id: 'TXN-CR-REAL',
                date: formatISTDateTime(Date.now() - 3600000),
                rawDate: Date.now() - 3600000,
                userName: 'Milind Chatrabhuji',
                userEmail: activeAdminEmail,
                userId: adminRecord.uid,
                type: 'credit',
                amount: 5,
                note: 'Razorpay Live Top-Up Test (pay_TnfJ8OHI8mpvlS)',
                refId: 'pay_TnfJ8OHI8mpvlS',
                balanceAfter: 5
            });
        }

        // Strictly deduplicate by refId and ID
        const seenRefs = new Set();
        const seenIds = new Set();
        const cleanTxns = [];

        combinedTxns.forEach(t => {
            if (!t) return;
            const refKey = (t.refId && t.refId !== 'AUTO-IST-0500' && t.refId !== 'ADMIN-OVERRIDE') ? t.refId : t.id;
            if (seenRefs.has(refKey) || (t.id && seenIds.has(t.id))) {
                return; // Duplicate!
            }
            if (refKey) seenRefs.add(refKey);
            if (t.id) seenIds.add(t.id);
            cleanTxns.push(t);
        });

        allTransactions = cleanTxns;
        localStorage.setItem('rsbk_global_transactions', JSON.stringify(allTransactions));
        localStorage.setItem('rsbk_users_registry', JSON.stringify(allUsers));
    };

    // Save Users back to localStorage and sync to Firebase Realtime Database cloud
    const saveUsersRegistry = (singleUserToUpdate) => {
        try {
            localStorage.setItem('rsbk_users_registry', JSON.stringify(allUsers));
            if (window.firebaseDb && window.firebaseRef && window.firebaseUpdate) {
                if (singleUserToUpdate && singleUserToUpdate.uid) {
                    const uRef = window.firebaseRef(window.firebaseDb, 'users/' + singleUserToUpdate.uid);
                    window.firebaseUpdate(uRef, singleUserToUpdate);
                } else if (allUsers && allUsers.length > 0) {
                    const updatePayload = {};
                    allUsers.forEach(u => {
                        if (u && u.uid) {
                            updatePayload[u.uid] = {
                                uid: u.uid,
                                displayName: u.displayName || 'Member',
                                email: u.email || '',
                                photoURL: u.photoURL || '',
                                role: u.role || 'Registered Member',
                                createdAt: u.createdAt || Date.now(),
                                trialStartDate: u.trialStartDate || Date.now(),
                                balance: Number(u.balance) || 0,
                                isVip: Boolean(u.isVip),
                                isDoctorVerified: Boolean(u.isDoctorVerified)
                            };
                        }
                    });
                    const usersRef = window.firebaseRef(window.firebaseDb, 'users');
                    window.firebaseUpdate(usersRef, updatePayload);
                }
            }
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

        // Calculate Revenue strictly from genuine Razorpay credit transactions (excluding administrative VIP grants)
        const creditTxns = allTransactions.filter(t => 
            t.type === 'credit' && 
            (!t.id || !t.id.startsWith('TXN-VIP-')) && 
            (!t.refId || (!t.refId.startsWith('ADMIN-VIP') && t.refId !== 'ADMIN-VIP-ACTION'))
        );
        const grossRevenue = creditTxns.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

        // Calculate Ledger Inflow / Debits / Pool
        const debitTxns = allTransactions.filter(t => t.type === 'debit');
        const totalDebits = debitTxns.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        
        // Active wallet escrow pool only counts actual non-VIP member balances (VIP users have complimentary unlimited access)
        const activePool = allUsers
            .filter(u => !u.isVip && u.status !== 'vip')
            .reduce((sum, u) => sum + (Number(u.balance) || 0), 0);

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
        const vipMembers = allUsers.filter(u => u.isVip || u.status === 'vip').length;
        const countFilterVip = document.getElementById('countFilterVip');
        if (countFilterVip) countFilterVip.textContent = vipMembers;

        if (countFilterAll) countFilterAll.textContent = total;
        if (countFilterTrial) countFilterTrial.textContent = activeTrials;
        if (countFilterPaid) countFilterPaid.textContent = paidMembers;
        if (countFilterExpired) countFilterExpired.textContent = expiredMembers;

        const vipTxns = allTransactions.filter(t => t.type === 'vip' || (t.id && t.id.startsWith('TXN-VIP-')) || (t.refId && t.refId.startsWith('ADMIN-VIP')));
        const countTxnVip = document.getElementById('countTxnVip');
        if (countTxnVip) countTxnVip.textContent = vipTxns.length;

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
            if (activeMemberFilter === 'vip' && !u.isVip && u.status !== 'vip') return false;
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
                statusPillHtml = `<span class="badge-status vip" title="Lifetime Unlimited VIP Access (No recharge needed)"><ion-icon name="star"></ion-icon> Unlimited VIP</span>`;
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
                        ${u.status === 'vip' 
                            ? `<strong class="table-balance positive" title="Lifetime Unlimited VIP Access (No recharge needed)"><ion-icon name="infinite-outline" style="vertical-align: -2px; font-size: 1.15em;"></ion-icon> Unlimited</strong>` 
                            : `<strong class="table-balance ${u.balance > 0 ? 'positive' : 'zero'}">&#8377;${Number(u.balance).toFixed(2)}</strong>`
                        }
                    </td>
                    <td>
                        ${u.status === 'vip' 
                            ? `<span class="table-date">Never Expires</span><div class="table-subdate text-emerald">Lifetime Access</div>` 
                            : `<span class="table-date">${trialEndStr}</span>${u.isTrialActive ? `<div class="table-subdate text-emerald">${u.trialDaysLeft} days remaining</div>` : '<div class="table-subdate text-muted">Completed</div>'}`
                        }
                    </td>
                    <td style="text-align: right;">
                        <div class="table-actions-group">
                            <button class="btn-action-icon btn-action-vip ${u.isVip ? 'active-vip' : ''}" data-uid="${u.uid}" title="${u.isVip ? 'Manage Lifetime Unlimited VIP Access (Currently Active)' : 'Convert to Lifetime Unlimited VIP Access'}">
                                <ion-icon name="${u.isVip ? 'star' : 'star-outline'}"></ion-icon>
                            </button>
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
        document.querySelectorAll('.btn-action-vip').forEach(btn => {
            btn.addEventListener('click', () => {
                const uid = btn.dataset.uid;
                openLifetimeVipModal(uid);
            });
        });
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
            const isVip = t.type === 'vip' || (t.id && t.id.startsWith('TXN-VIP-')) || (t.refId && t.refId.startsWith('ADMIN-VIP'));
            if (activeTxnFilter === 'credit' && (t.type !== 'credit' || isVip)) return false;
            if (activeTxnFilter === 'debit' && t.type !== 'debit') return false;
            if (activeTxnFilter === 'vip' && !isVip) return false;

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
            const isVipTxn = t.type === 'vip' || (t.id && t.id.startsWith('TXN-VIP-')) || (t.refId && (t.refId.startsWith('ADMIN-VIP') || t.refId === 'ADMIN-VIP-ACTION'));
            const isCredit = t.type === 'credit' && !isVipTxn;
            
            let badgeClass = 'badge-txn-debit';
            let badgeIcon = 'arrow-up-circle';
            let badgeText = 'Debit (Daily)';
            let amountHtml = `<strong class="table-amount debit">-&#8377;${t.amount}</strong>`;

            if (isVipTxn) {
                badgeClass = 'badge-status vip';
                badgeIcon = 'star';
                badgeText = 'VIP Complimentary';
                amountHtml = `<span style="color: #059669; font-weight: 700;">&#8377;0 (Free)</span>`;
            } else if (isCredit) {
                badgeClass = 'badge-txn-credit';
                badgeIcon = 'arrow-down-circle';
                badgeText = 'Credit (Top-Up)';
                amountHtml = `<strong class="table-amount credit">+&#8377;${t.amount}</strong>`;
            }

            const balanceAfterFormatted = (isVipTxn || t.balanceAfter === '∞' || t.balanceAfter === 9999) 
                ? '<span style="color: #059669; font-weight: 700;">&#8734; Unlimited</span>' 
                : `&#8377;${Number(t.balanceAfter || 0).toFixed(2)}`;

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
                        ${amountHtml}
                    </td>
                    <td>
                        <code class="table-code-ref" title="Click to copy" onclick="navigator.clipboard.writeText('${t.refId}'); alert('Copied: ${t.refId}');">
                            ${t.refId || '—'}
                        </code>
                    </td>
                    <td><span class="table-note">${t.note || '—'}</span></td>
                    <td><span class="table-balance-after">${balanceAfterFormatted}</span></td>
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
    // Doctor & Faculty Verifications Queue (Admin Validation)
    // -------------------------------------------------------------
    let allVerifications = [];
    let activeVerifFilter = 'all';
    let currentCertUid = null;

    const loadVerifications = () => {
        try {
            const raw = localStorage.getItem('rsbk_pending_verifications');
            allVerifications = raw ? JSON.parse(raw) : [];
        } catch (e) {
            allVerifications = [];
        }
    };

    // Realtime Database synchronization for verifications
    const syncFirebaseVerifications = () => {
        if (window.firebaseDb && window.firebaseRef && window.firebaseOnValue) {
            try {
                const vRef = window.firebaseRef(window.firebaseDb, 'doctor_verifications');
                window.firebaseOnValue(vRef, (snapshot) => {
                    const data = snapshot.val();
                    if (data && typeof data === 'object') {
                        const fbList = Object.keys(data).map(k => ({
                            uid: k,
                            ...data[k]
                        }));

                        // Merge with local storage
                        const localRaw = localStorage.getItem('rsbk_pending_verifications');
                        const localList = localRaw ? JSON.parse(localRaw) : [];

                        const map = new Map();
                        localList.forEach(item => { if (item && item.uid) map.set(item.uid, item); });
                        fbList.forEach(item => { if (item && item.uid) map.set(item.uid, item); });

                        allVerifications = Array.from(map.values());
                        localStorage.setItem('rsbk_pending_verifications', JSON.stringify(allVerifications));
                        renderVerificationsTable();
                    }
                });
            } catch (err) {
                console.warn('Firebase verifications listener notice:', err);
            }
        }
    };

    // Realtime Database synchronization for all registered members
    const syncFirebaseUsers = () => {
        if (!window.firebaseDb || !window.firebaseRef || !window.firebaseOnValue) {
            setTimeout(syncFirebaseUsers, 500);
            return;
        }

        try {
            const uRef = window.firebaseRef(window.firebaseDb, 'users');
            window.firebaseOnValue(uRef, (snapshot) => {
                const data = snapshot.val();
                if (data && typeof data === 'object') {
                    let localList = [];
                    try {
                        const raw = localStorage.getItem('rsbk_users_registry');
                        if (raw) localList = JSON.parse(raw);
                    } catch (e) {}
                    if (!Array.isArray(localList)) localList = [];

                    const mergedMap = new Map();

                    // Seed with existing local users
                    localList.forEach(item => {
                        if (item && (item.email || item.uid)) {
                            const k = (item.email || item.uid).toLowerCase().trim();
                            mergedMap.set(k, item);
                        }
                    });

                    // Overlay and add all cloud users from Firebase
                    Object.keys(data).forEach(k => {
                        const cu = data[k];
                        if (cu && (cu.email || cu.uid)) {
                            const key = (cu.email || cu.uid || k).toLowerCase().trim();
                            const existing = mergedMap.get(key);
                            if (existing) {
                                mergedMap.set(key, {
                                    ...existing,
                                    ...cu,
                                    balance: cu.balance !== undefined ? cu.balance : existing.balance,
                                    trialStartDate: cu.trialStartDate || existing.trialStartDate
                                });
                            } else {
                                mergedMap.set(key, {
                                    uid: k,
                                    ...cu
                                });
                            }
                        }
                    });

                    const mergedList = Array.from(mergedMap.values());
                    localStorage.setItem('rsbk_users_registry', JSON.stringify(mergedList));

                    // Refresh in-memory store and re-render UI
                    loadPlatformData();
                    renderMembersTable();
                    updateMetricsUI();
                }
            });
        } catch (err) {
            console.warn('Firebase users listener notice:', err);
        }
    };

    // Open Doctor Certificate Audit Modal
    const openDocCertModal = (uid) => {
        currentCertUid = uid;
        const rec = allVerifications.find(v => v.uid === uid);
        if (!rec) return;

        const modal = document.getElementById('modalDocCertificate');
        if (!modal) return;

        const applicantEl = document.getElementById('docCertModalApplicant');
        const nameEl = document.getElementById('modalDocName');
        const emailEl = document.getElementById('modalDocEmail');
        const degreeEl = document.getElementById('modalDocDegree');
        const regNoEl = document.getElementById('modalDocRegNo');
        const instEl = document.getElementById('modalDocInst');
        const paymentEl = document.getElementById('modalDocPaymentId');
        const fileContainer = document.getElementById('modalDocFileContainer');
        const downloadBtn = document.getElementById('modalDocDownloadBtn');

        if (applicantEl) applicantEl.textContent = `Applicant: ${rec.name || 'Applicant'} (${rec.email || '—'})`;
        if (nameEl) nameEl.textContent = rec.name || 'Applicant';
        if (emailEl) emailEl.textContent = rec.email || '—';
        if (degreeEl) degreeEl.textContent = rec.degree || 'BAMS';
        if (regNoEl) regNoEl.textContent = rec.regNo || '—';
        if (instEl) instEl.textContent = rec.institution || '—';
        if (paymentEl) paymentEl.textContent = `₹100 Paid (${rec.paymentId || 'rzp_paid'})`;

        if (downloadBtn) {
            downloadBtn.href = rec.fileData || '#';
            downloadBtn.download = rec.fileName || `${(rec.name || 'doctor').replace(/\s+/g, '_')}_certificate`;
        }

        if (fileContainer) {
            fileContainer.innerHTML = '';
            if (!rec.fileData) {
                fileContainer.innerHTML = `<div style="color: #94a3b8; text-align: center;"><ion-icon name="document-outline" style="font-size: 3rem; margin-bottom: 0.5rem;"></ion-icon><p>No certificate file data attached.</p></div>`;
            } else if (rec.fileType === 'application/pdf' || (rec.fileData && rec.fileData.startsWith('data:application/pdf')) || (rec.fileName && rec.fileName.toLowerCase().endsWith('.pdf'))) {
                fileContainer.innerHTML = `<iframe src="${rec.fileData}" style="width: 100%; height: 480px; border: none; border-radius: 8px; background: #ffffff;"></iframe>`;
            } else {
                fileContainer.innerHTML = `<img src="${rec.fileData}" alt="${rec.name || 'Certificate'}" style="max-width: 100%; max-height: 480px; object-fit: contain; border-radius: 8px; box-shadow: 0 10px 40px rgba(0,0,0,0.6);">`;
            }
        }

        modal.style.display = 'flex';
    };

    const closeDocCertModal = () => {
        const modal = document.getElementById('modalDocCertificate');
        if (modal) modal.style.display = 'none';
        currentCertUid = null;
    };

    const modalDocCertEl = document.getElementById('modalDocCertificate');
    if (modalDocCertEl) {
        const closeBtn = document.getElementById('btnCloseDocCertModal');
        if (closeBtn) closeBtn.addEventListener('click', closeDocCertModal);
        modalDocCertEl.addEventListener('click', (e) => {
            if (e.target === modalDocCertEl) closeDocCertModal();
        });

        const approveModalBtn = document.getElementById('btnApproveFromModal');
        if (approveModalBtn) {
            approveModalBtn.addEventListener('click', () => {
                if (currentCertUid) approveDoctorVerification(currentCertUid);
            });
        }

        const rejectModalBtn = document.getElementById('btnRejectFromModal');
        if (rejectModalBtn) {
            rejectModalBtn.addEventListener('click', () => {
                if (currentCertUid) rejectDoctorVerification(currentCertUid);
            });
        }
    }

    const renderVerificationsTable = () => {
        loadVerifications();
        const tbody = document.getElementById('verificationsTableBody');
        const badgeEl = document.getElementById('tabBadgeVerifications');
        const countAll = document.getElementById('countVerifAll');
        const countPending = document.getElementById('countVerifPending');
        const countApproved = document.getElementById('countVerifApproved');
        const countRejected = document.getElementById('countVerifRejected');
        const summaryEl = document.getElementById('verifCountSummary');

        const pendingCount = allVerifications.filter(v => v.status === 'pending').length;
        const approvedCount = allVerifications.filter(v => v.status === 'approved').length;
        const rejectedCount = allVerifications.filter(v => v.status === 'rejected').length;

        if (badgeEl) badgeEl.textContent = pendingCount;
        if (countAll) countAll.textContent = allVerifications.length;
        if (countPending) countPending.textContent = pendingCount;
        if (countApproved) countApproved.textContent = approvedCount;
        if (countRejected) countRejected.textContent = rejectedCount;

        if (!tbody) return;

        const q = (document.getElementById('verifSearchInput') ? document.getElementById('verifSearchInput').value : '').toLowerCase().trim();

        const filtered = allVerifications.filter(v => {
            const matchesFilter = activeVerifFilter === 'all' || v.status === activeVerifFilter;
            if (!matchesFilter) return false;
            if (!q) return true;
            return (v.name || '').toLowerCase().includes(q) || (v.email || '').toLowerCase().includes(q) || (v.regNo || '').toLowerCase().includes(q) || (v.degree || '').toLowerCase().includes(q);
        });

        if (summaryEl) summaryEl.textContent = `Showing ${filtered.length} of ${allVerifications.length} verification requests`;

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">
                        <ion-icon name="shield-checkmark-outline" style="font-size: 2.5rem; opacity: 0.4; margin-bottom: 0.5rem;"></ion-icon>
                        <p style="font-weight: 600; margin: 0;">No doctor verification requests found in this view.</p>
                        <p style="font-size: 0.82rem; margin-top: 0.25rem;">When doctors submit their degree certificates with ₹100 fee on Profile, they will appear here for your audit.</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filtered.map(v => {
            const isPending = v.status === 'pending';
            const isApproved = v.status === 'approved';

            let statusBadge = '';
            if (isApproved) {
                statusBadge = '<span class="badge-doctor-verified"><ion-icon name="checkmark-done-circle"></ion-icon> Approved</span>';
            } else if (v.status === 'rejected') {
                statusBadge = '<span style="background: #ef4444; color: #fff; font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 50px;">Rejected</span>';
            } else {
                statusBadge = '<span style="background: #d97706; color: #fff; font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 50px;">Pending Review</span>';
            }

            return `
                <tr>
                    <td>
                        <strong style="color: var(--text-color); display: block;">${v.name || 'Applicant'}</strong>
                        <span style="font-size: 0.8rem; color: var(--text-muted);">${v.email || '—'}</span>
                    </td>
                    <td>
                        <strong style="color: var(--primary); display: block;">${v.degree || 'BAMS'}</strong>
                        <span style="font-size: 0.8rem; font-family: monospace; color: var(--text-muted);">Reg: ${v.regNo || '—'}</span>
                    </td>
                    <td>
                        <span style="font-size: 0.85rem; color: var(--text-color);">${v.institution || '—'}</span>
                    </td>
                    <td>
                        <span style="font-size: 0.85rem; font-weight: 700; color: #059669;">₹100 Paid</span>
                        <div style="font-size: 0.72rem; font-family: monospace; color: var(--text-muted);">${v.paymentId || 'rzp_paid'}</div>
                    </td>
                    <td>
                        ${v.fileData ? `
                            <button type="button" class="btn-admin-table-action btn-view-cert" data-uid="${v.uid}" style="font-size: 0.78rem; padding: 0.35rem 0.75rem; background: rgba(5, 150, 105, 0.1); color: #059669; border: 1px solid rgba(5, 150, 105, 0.25); border-radius: 6px; cursor: pointer; font-weight: 700;">
                                <ion-icon name="eye-outline"></ion-icon> Audit Certificate
                            </button>
                        ` : '<span style="color: var(--text-muted);">No file</span>'}
                    </td>
                    <td>${statusBadge}</td>
                    <td style="text-align: right; white-space: nowrap;">
                        ${isPending ? `
                            <button type="button" class="btn-admin-table-action btn-approve-doc" data-uid="${v.uid}" style="background: #059669; color: #fff; border: none; padding: 0.4rem 0.8rem; border-radius: 6px; font-weight: 700; cursor: pointer; margin-right: 0.35rem;">
                                <ion-icon name="checkmark"></ion-icon> Approve
                            </button>
                            <button type="button" class="btn-admin-table-action btn-reject-doc" data-uid="${v.uid}" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); padding: 0.4rem 0.6rem; border-radius: 6px; font-weight: 700; cursor: pointer;">
                                Reject
                            </button>
                        ` : (isApproved ? `
                            <span style="font-size: 0.8rem; color: #059669; font-weight: 700;">Badge Granted</span>
                        ` : `
                            <span style="font-size: 0.8rem; color: #ef4444; font-weight: 700;">Rejected</span>
                        `)}
                    </td>
                </tr>
            `;
        }).join('');

        // Wire Action Buttons
        tbody.querySelectorAll('.btn-approve-doc').forEach(btn => {
            btn.addEventListener('click', () => {
                const uid = btn.dataset.uid;
                approveDoctorVerification(uid);
            });
        });

        tbody.querySelectorAll('.btn-reject-doc').forEach(btn => {
            btn.addEventListener('click', () => {
                const uid = btn.dataset.uid;
                rejectDoctorVerification(uid);
            });
        });

        tbody.querySelectorAll('.btn-view-cert').forEach(btn => {
            btn.addEventListener('click', () => {
                const uid = btn.dataset.uid;
                openDocCertModal(uid);
            });
        });
    };

    const approveDoctorVerification = async (uid) => {
        const item = allVerifications.find(v => v.uid === uid);
        if (!item) return;

        if (!confirm(`Are you sure you want to approve credentials for ${item.name} (${item.degree}) and grant the official Verified Doctor Badge?`)) {
            return;
        }

        item.status = 'approved';
        item.approvedAt = new Date().toISOString();
        item.approvedBy = 'Dr. Milind Chatrabhuji';
        localStorage.setItem('rsbk_pending_verifications', JSON.stringify(allVerifications));

        // Update in Firebase Realtime Database
        try {
            if (window.firebaseDb && window.firebaseRef && window.firebaseUpdate) {
                const vRef = window.firebaseRef(window.firebaseDb, 'doctor_verifications/' + uid);
                await window.firebaseUpdate(vRef, {
                    status: 'approved',
                    approvedAt: new Date().toISOString(),
                    approvedBy: 'Academic Administration'
                });

                const uRef = window.firebaseRef(window.firebaseDb, 'users/' + uid);
                await window.firebaseUpdate(uRef, {
                    isDoctorVerified: true,
                    verificationStatus: 'approved'
                });
            }
        } catch (fbErr) {
            console.warn('Firebase update warning:', fbErr);
        }

        // Update in local user registry
        try {
            let registry = JSON.parse(localStorage.getItem('rsbk_users_registry') || '[]');
            let regUser = registry.find(u => u.uid === uid || (u.email && u.email.toLowerCase() === item.email.toLowerCase()));
            if (regUser) {
                regUser.isDoctorVerified = true;
                localStorage.setItem('rsbk_users_registry', JSON.stringify(registry));
            }
        } catch (e) {}

        // If user is currently stored in local user cache
        if (localStorage.getItem('rsbk_user_uid') === uid || (localStorage.getItem('rsbk_user_email') || '').toLowerCase() === item.email.toLowerCase()) {
            localStorage.setItem('rsbk_doctor_verified', 'true');
            localStorage.setItem('rsbk_verification_status', 'approved');
        }

        // Dispatch email notification
        if (item.email && window.RSBK && window.RSBK.EmailService) {
            window.RSBK.EmailService.sendNotification('doctor_verification_approved', {
                recipientName: item.name,
                recipientEmail: item.email,
                details: {
                    degree: item.degree,
                    regNo: item.regNo,
                    approvedAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                }
            });
        }

        alert(`Credentials Verified!\n\n${item.name} has been granted the Verified Doctor Badge.`);
        renderVerificationsTable();
        closeDocCertModal();
    };

    const rejectDoctorVerification = async (uid) => {
        const item = allVerifications.find(v => v.uid === uid);
        if (!item) return;

        const reason = prompt('Please enter reason for rejection (e.g. illegible council registration scan, registration number not found on NCISM portal):', 'Registration proof could not be validated');
        if (!reason) return;

        item.status = 'rejected';
        item.rejectionReason = reason;
        item.rejectedAt = new Date().toISOString();
        localStorage.setItem('rsbk_pending_verifications', JSON.stringify(allVerifications));

        // Update in Firebase Realtime Database
        try {
            if (window.firebaseDb && window.firebaseRef && window.firebaseUpdate) {
                const vRef = window.firebaseRef(window.firebaseDb, 'doctor_verifications/' + uid);
                await window.firebaseUpdate(vRef, {
                    status: 'rejected',
                    rejectionReason: reason,
                    rejectedAt: new Date().toISOString()
                });

                const uRef = window.firebaseRef(window.firebaseDb, 'users/' + uid);
                await window.firebaseUpdate(uRef, {
                    isDoctorVerified: false,
                    verificationStatus: 'rejected'
                });
            }
        } catch (fbErr) {
            console.warn('Firebase rejection update warning:', fbErr);
        }

        // Dispatch email notification
        if (item.email && window.RSBK && window.RSBK.EmailService) {
            window.RSBK.EmailService.sendNotification('doctor_verification_rejected', {
                recipientName: item.name,
                recipientEmail: item.email,
                details: {
                    reason: reason
                }
            });
        }

        alert(`Application for ${item.name} has been rejected.`);
        renderVerificationsTable();
        closeDocCertModal();
    };

    // Filters for Verifications Table
    const verifFilterChips = document.querySelectorAll('#verifFilterGroup .filter-chip');
    verifFilterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            verifFilterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            activeVerifFilter = chip.dataset.vfilter;
            renderVerificationsTable();
        });
    });

    const verifSearchInput = document.getElementById('verifSearchInput');
    if (verifSearchInput) {
        verifSearchInput.addEventListener('input', () => {
            renderVerificationsTable();
        });
    }

    const btnRefreshVerif = document.getElementById('btnRefreshVerifications');
    if (btnRefreshVerif) {
        btnRefreshVerif.addEventListener('click', () => {
            renderVerificationsTable();
        });
    }

    // Initial render & Realtime sync
    setTimeout(() => {
        renderVerificationsTable();
        syncFirebaseVerifications();
        syncFirebaseUsers();
    }, 600);

    // -------------------------------------------------------------
    // Modal 1: Adjust Balance
    // -------------------------------------------------------------
    const openAdjustBalanceModal = (uid) => {
        selectedUserForAction = allUsers.find(u => u.uid === uid);
        if (!selectedUserForAction) return;

        adjustModalUserLabel.textContent = `Member: ${selectedUserForAction.displayName} (${selectedUserForAction.email})`;
        adjustModalCurrentBalance.innerHTML = selectedUserForAction.isVip 
            ? '<span style="color: #059669; font-weight: 700;"><ion-icon name="infinite-outline" style="vertical-align: -2px;"></ion-icon> Unlimited VIP Access (No recharge needed)</span>' 
            : `&#8377;${Number(selectedUserForAction.balance).toFixed(2)}`;
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
            const role = newMemberRole.value.trim() || 'Registered Member';

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
    // Modal 6: Convert Any User to Lifetime Unlimited VIP Access
    // -------------------------------------------------------------
    const modalConvertLifetimeVip = document.getElementById('modalConvertLifetimeVip');
    const vipModalUserLabel = document.getElementById('vipModalUserLabel');
    const vipModalCurrentStatusText = document.getElementById('vipModalCurrentStatusText');
    const vipModalStatusBadge = document.getElementById('vipModalStatusBadge');
    const btnToggleGrantVip = document.getElementById('btnToggleGrantVip');
    const btnToggleRevokeVip = document.getElementById('btnToggleRevokeVip');
    const vipReasonInput = document.getElementById('vipReasonInput');
    const btnCloseVipModal = document.getElementById('btnCloseVipModal');
    const btnCancelVipModal = document.getElementById('btnCancelVipModal');
    const btnConfirmVipAction = document.getElementById('btnConfirmVipAction');
    const btnOpenVipFromAdjust = document.getElementById('btnOpenVipFromAdjust');

    let currentVipSelectedUser = null;
    let vipActionType = 'grant'; // 'grant' or 'revoke'

    const openLifetimeVipModal = (uid) => {
        currentVipSelectedUser = allUsers.find(u => u.uid === uid);
        if (!currentVipSelectedUser) return;

        if (vipModalUserLabel) {
            vipModalUserLabel.textContent = `Member: ${currentVipSelectedUser.displayName || 'Member'} (${currentVipSelectedUser.email || '—'})`;
        }

        const isCurrentlyVip = Boolean(currentVipSelectedUser.isVip || currentVipSelectedUser.status === 'vip');

        if (vipModalCurrentStatusText) {
            vipModalCurrentStatusText.textContent = isCurrentlyVip 
                ? '⭐ Active Lifetime VIP Pass (Never Expires · No Recharge Needed)' 
                : (currentVipSelectedUser.status === 'trial' 
                    ? `30-Day Free Trial (${currentVipSelectedUser.trialDaysLeft} days left)` 
                    : (currentVipSelectedUser.status === 'paid' ? `Paid Member (₹${Number(currentVipSelectedUser.balance).toFixed(2)})` : 'Trial Expired (₹0.00)'));
        }

        if (vipModalStatusBadge) {
            vipModalStatusBadge.className = isCurrentlyVip ? 'badge-status vip' : 'badge-status trial';
            vipModalStatusBadge.innerHTML = isCurrentlyVip 
                ? '<ion-icon name="star"></ion-icon> VIP Pass' 
                : '<ion-icon name="sparkles"></ion-icon> Standard Member';
        }

        // Set action toggle based on current state
        if (isCurrentlyVip) {
            vipActionType = 'grant';
            if (btnToggleGrantVip) btnToggleGrantVip.classList.add('active');
            if (btnToggleRevokeVip) btnToggleRevokeVip.classList.remove('active');
            if (vipReasonInput) vipReasonInput.value = 'Lifetime VIP Unlimited Access maintained by Admin';
        } else {
            vipActionType = 'grant';
            if (btnToggleGrantVip) btnToggleGrantVip.classList.add('active');
            if (btnToggleRevokeVip) btnToggleRevokeVip.classList.remove('active');
            if (vipReasonInput) vipReasonInput.value = 'Complimentary Lifetime Academic Access granted by Admin';
        }

        if (modalConvertLifetimeVip) modalConvertLifetimeVip.style.display = 'flex';
    };

    const closeLifetimeVipModal = () => {
        if (modalConvertLifetimeVip) modalConvertLifetimeVip.style.display = 'none';
        currentVipSelectedUser = null;
    };

    if (btnToggleGrantVip) {
        btnToggleGrantVip.addEventListener('click', () => {
            vipActionType = 'grant';
            btnToggleGrantVip.classList.add('active');
            if (btnToggleRevokeVip) btnToggleRevokeVip.classList.remove('active');
            if (vipReasonInput) vipReasonInput.value = 'Complimentary Lifetime Academic Access granted by Admin';
        });
    }

    if (btnToggleRevokeVip) {
        btnToggleRevokeVip.addEventListener('click', () => {
            vipActionType = 'revoke';
            btnToggleRevokeVip.classList.add('active');
            if (btnToggleGrantVip) btnToggleGrantVip.classList.remove('active');
            if (vipReasonInput) vipReasonInput.value = 'Reverted from Lifetime VIP to standard access';
        });
    }

    if (btnCloseVipModal) btnCloseVipModal.addEventListener('click', closeLifetimeVipModal);
    if (btnCancelVipModal) btnCancelVipModal.addEventListener('click', closeLifetimeVipModal);

    if (btnConfirmVipAction) {
        btnConfirmVipAction.addEventListener('click', async () => {
            if (!currentVipSelectedUser) return;

            const isGranting = (vipActionType === 'grant');
            const targetUser = currentVipSelectedUser;
            const reason = (vipReasonInput ? vipReasonInput.value.trim() : '') || (isGranting ? 'Lifetime Unlimited Access granted' : 'Reverted to Standard Access');

            // 1. Update in-memory user record
            targetUser.isVip = isGranting;
            targetUser.unlimitedAccess = isGranting;
            targetUser.status = isGranting ? 'vip' : 'paid';
            targetUser.trialDaysLeft = isGranting ? '∞' : targetUser.trialDaysLeft;
            targetUser.balance = isGranting ? 9999 : (targetUser.balance || 0);
            if (isGranting) {
                targetUser.role = 'VIP Member (Unlimited Access)';
            } else {
                targetUser.role = 'Registered Member';
            }

            // 2. Persist to Firebase Realtime Database
            try {
                if (window.firebaseDb && window.firebaseRef && window.firebaseUpdate) {
                    const uRef = window.firebaseRef(window.firebaseDb, 'users/' + targetUser.uid);
                    await window.firebaseUpdate(uRef, {
                        isVip: isGranting,
                        unlimitedAccess: isGranting,
                        balance: isGranting ? 9999 : targetUser.balance,
                        role: isGranting ? 'VIP Member (Unlimited Access)' : 'Registered Member',
                        vipGrantedAt: isGranting ? Date.now() : null,
                        vipGrantedBy: isGranting ? 'Platform Administration' : null,
                        lastModified: Date.now()
                    });
                }
            } catch (fbErr) {
                console.warn('Firebase VIP update warning:', fbErr);
            }

            // 3. Persist to Local Storage User Registry
            try {
                let registry = JSON.parse(localStorage.getItem('rsbk_users_registry') || '[]');
                let regIdx = registry.findIndex(u => u.uid === targetUser.uid || (u.email && targetUser.email && u.email.toLowerCase() === targetUser.email.toLowerCase()));
                if (regIdx !== -1) {
                    registry[regIdx].isVip = isGranting;
                    registry[regIdx].unlimitedAccess = isGranting;
                    registry[regIdx].balance = isGranting ? 9999 : registry[regIdx].balance;
                    registry[regIdx].role = isGranting ? 'VIP Member (Unlimited Access)' : 'Registered Member';
                    localStorage.setItem('rsbk_users_registry', JSON.stringify(registry));
                }
            } catch (e) {}

            // 4. Update individual wallet in localStorage
            const walletKey = `rsbk_wallet_${targetUser.uid}`;
            try {
                let w = { balance: isGranting ? 9999 : 0, isVip: isGranting, transactions: [] };
                const existingRaw = localStorage.getItem(walletKey);
                if (existingRaw) w = JSON.parse(existingRaw);
                w.isVip = isGranting;
                w.balance = isGranting ? 9999 : w.balance;
                localStorage.setItem(walletKey, JSON.stringify(w));
            } catch (e) {}

            // 5. If this is the current active session user on this browser, update active keys
            const activeUid = localStorage.getItem('rsbk_user_uid');
            const activeEmail = (localStorage.getItem('rsbk_user_email') || '').toLowerCase().trim();
            if (activeUid === targetUser.uid || (targetUser.email && activeEmail === targetUser.email.toLowerCase().trim())) {
                localStorage.setItem('rsbk_is_vip', isGranting ? 'true' : 'false');
                if (isGranting) {
                    localStorage.setItem('rsbk_access_valid', 'true');
                    localStorage.setItem('rsbk_access_type', 'vip');
                    localStorage.setItem('rsbk_wallet_balance', '9999');
                    localStorage.setItem('rsbk_trial_days_left', '9999');
                }
            }

            // 6. Record Audit Transaction (Complimentary VIP Pass - Not Revenue)
            const txnRecord = {
                id: 'TXN-VIP-' + Date.now(),
                date: formatISTDateTime(Date.now()),
                rawDate: Date.now(),
                userName: targetUser.displayName || 'Member',
                userEmail: targetUser.email || '—',
                userId: targetUser.uid,
                type: 'vip',
                amount: 0,
                note: isGranting 
                    ? `Admin converted member to Lifetime Unlimited VIP Access (${reason}) — Complimentary (₹0)` 
                    : `Admin reverted VIP Access (${reason})`,
                refId: 'ADMIN-VIP-PASS',
                balanceAfter: '∞'
            };
            allTransactions.unshift(txnRecord);
            saveGlobalTransactions();

            // 7. Update UI
            updateMetricsUI();
            renderMembersTable();
            renderTransactionsTable();
            closeLifetimeVipModal();

            alert(isGranting 
                ? `Success!\n\n${targetUser.displayName} (${targetUser.email}) has been converted to Lifetime Unlimited Access.\n\nThey now have permanent complimentary access with zero daily deductions and will never need to recharge.` 
                : `Updated!\n\nVIP access for ${targetUser.displayName} has been reverted.`);
        });
    }

    // Connect shortcut button in Adjust Balance modal
    if (btnOpenVipFromAdjust) {
        btnOpenVipFromAdjust.addEventListener('click', () => {
            if (selectedUserForAction) {
                const uid = selectedUserForAction.uid;
                closeAdjustModal();
                openLifetimeVipModal(uid);
            }
        });
    }

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

    // =========================================================================
    // VIDEO HUB MANAGEMENT (ADMIN PANEL)
    // =========================================================================
    let adminBuiltInVideos = [];
    let adminCustomVideos = [];
    let adminAllVideos = [];
    let activeAdminVideoFilter = 'all';

    const tabBadgeVideos = document.getElementById('tabBadgeVideos');
    const adminVideoUrl = document.getElementById('adminVideoUrl');
    const adminVideoTitle = document.getElementById('adminVideoTitle');
    const adminVideoCategory = document.getElementById('adminVideoCategory');
    const adminVideoReference = document.getElementById('adminVideoReference');
    const adminVideoDesc = document.getElementById('adminVideoDesc');
    const adminVideoTags = document.getElementById('adminVideoTags');
    const adminVideoDuration = document.getElementById('adminVideoDuration');
    const btnPublishAdminVideo = document.getElementById('btnPublishAdminVideo');
    const adminVideoLiveThumb = document.getElementById('adminVideoLiveThumb');
    const adminVideoPreviewPlaceholder = document.getElementById('adminVideoPreviewPlaceholder');
    const adminVideoDetectedId = document.getElementById('adminVideoDetectedId');
    const adminVideoSearchInput = document.getElementById('adminVideoSearchInput');
    const adminVideoFilterChips = document.querySelectorAll('#adminVideoFilterGroup .filter-chip');
    const adminVideosTableBody = document.getElementById('adminVideosTableBody');
    const countAdminVideosAll = document.getElementById('countAdminVideosAll');
    const countAdminVideosCustom = document.getElementById('countAdminVideosCustom');
    const countAdminVideosRasa = document.getElementById('countAdminVideosRasa');
    const countAdminVideosBhaishajya = document.getElementById('countAdminVideosBhaishajya');

    const extractYouTubeId = (input) => {
        if (!input) return null;
        input = input.trim();
        if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
        const match = input.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    // Public YouTube Title Auto-fetcher
    const fetchYouTubeTitle = async (ytId) => {
        try {
            const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${ytId}`);
            if (res.ok) {
                const data = await res.json();
                if (data && data.title) return data.title;
            }
        } catch (e) {}
        return '';
    };

    // Live YouTube link preview & auto-title population
    const adminVideoLiveCard = document.getElementById('adminVideoLiveCard');
    if (adminVideoUrl) {
        const updateThumbPreview = async () => {
            const ytId = extractYouTubeId(adminVideoUrl.value);
            if (ytId) {
                if (adminVideoLiveCard) adminVideoLiveCard.style.display = 'flex';
                if (adminVideoLiveThumb) {
                    adminVideoLiveThumb.src = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
                }
                if (adminVideoDetectedId) adminVideoDetectedId.textContent = `YouTube ID: ${ytId}`;

                // Auto-fetch title from YouTube oEmbed if title is empty
                if (adminVideoTitle && (!adminVideoTitle.value || adminVideoTitle.value.startsWith('RSBK Video:'))) {
                    adminVideoTitle.placeholder = 'Fetching title from YouTube...';
                    const ytTitle = await fetchYouTubeTitle(ytId);
                    if (ytTitle) {
                        adminVideoTitle.value = ytTitle;
                    } else {
                        adminVideoTitle.placeholder = 'Enter video title';
                        if (!adminVideoTitle.value) adminVideoTitle.value = `RSBK Practical Video (${ytId})`;
                    }
                }
            } else {
                if (adminVideoLiveCard) adminVideoLiveCard.style.display = 'none';
                if (adminVideoLiveThumb) adminVideoLiveThumb.src = '';
                if (adminVideoDetectedId) adminVideoDetectedId.textContent = '';
                if (adminVideoTitle) adminVideoTitle.value = '';
            }
        };

        adminVideoUrl.addEventListener('input', updateThumbPreview);
        adminVideoUrl.addEventListener('paste', () => setTimeout(updateThumbPreview, 100));
    }

    const loadAdminVideos = async () => {
        try {
            const resp = await fetch('videos-data.json?v=' + Date.now());
            if (resp.ok) {
                adminBuiltInVideos = await resp.json();
            }
        } catch (e) {
            adminBuiltInVideos = [];
        }

        try {
            const raw = localStorage.getItem('rsbk_custom_videos');
            adminCustomVideos = raw ? JSON.parse(raw) : [];
            if (!Array.isArray(adminCustomVideos)) adminCustomVideos = [];
        } catch (e) {
            adminCustomVideos = [];
        }

        combineAdminVideos();
    };

    const syncFirebaseVideos = () => {
        if (window.firebaseDb && window.firebaseRef && window.firebaseOnValue) {
            try {
                const vRef = window.firebaseRef(window.firebaseDb, 'videos');
                window.firebaseOnValue(vRef, (snapshot) => {
                    const data = snapshot.val();
                    if (data && typeof data === 'object') {
                        const fbVideos = Object.keys(data).map(k => ({
                            id: k,
                            ...data[k]
                        }));

                        const map = new Map();
                        adminCustomVideos.forEach(v => { if (v && v.id) map.set(v.id, v); });
                        fbVideos.forEach(v => { if (v && v.id) map.set(v.id, v); });

                        adminCustomVideos = Array.from(map.values());
                        localStorage.setItem('rsbk_custom_videos', JSON.stringify(adminCustomVideos));
                        combineAdminVideos();
                    }
                });
            } catch (err) {
                console.warn('Firebase videos sync warning:', err);
            }
        }
    };

    const combineAdminVideos = () => {
        const map = new Map();
        adminBuiltInVideos.forEach(v => {
            if (v && v.id) map.set(v.id, { ...v, isBuiltIn: true });
        });
        adminCustomVideos.forEach(v => {
            if (v && (v.id || v.youtubeId)) {
                const key = v.id || ('vid_custom_' + v.youtubeId);
                map.set(key, { ...v, isCustom: true });
            }
        });
        adminAllVideos = Array.from(map.values());
        renderAdminVideos();
    };

    const renderAdminVideos = () => {
        const total = adminAllVideos.length;
        const customCount = adminAllVideos.filter(v => v.isCustom).length;
        const rasaCount = adminAllVideos.filter(v => v.category === 'rasashastra').length;
        const bhaishajyaCount = adminAllVideos.filter(v => v.category === 'bhaishajya-kalpana').length;

        if (tabBadgeVideos) tabBadgeVideos.textContent = total;
        if (countAdminVideosAll) countAdminVideosAll.textContent = total;
        if (countAdminVideosCustom) countAdminVideosCustom.textContent = customCount;
        if (countAdminVideosRasa) countAdminVideosRasa.textContent = rasaCount;
        if (countAdminVideosBhaishajya) countAdminVideosBhaishajya.textContent = bhaishajyaCount;

        if (!adminVideosTableBody) return;

        const query = (adminVideoSearchInput ? adminVideoSearchInput.value : '').toLowerCase().trim();

        const filtered = adminAllVideos.filter(v => {
            if (activeAdminVideoFilter === 'custom' && !v.isCustom) return false;
            if (activeAdminVideoFilter === 'rasashastra' && v.category !== 'rasashastra') return false;
            if (activeAdminVideoFilter === 'bhaishajya-kalpana' && v.category !== 'bhaishajya-kalpana') return false;

            if (query) {
                const title = (v.title || '').toLowerCase();
                const desc = (v.description || '').toLowerCase();
                const tags = Array.isArray(v.tags) ? v.tags.join(' ').toLowerCase() : '';
                return title.includes(query) || desc.includes(query) || tags.includes(query);
            }
            return true;
        });

        if (filtered.length === 0) {
            adminVideosTableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
                        <ion-icon name="videocam-off-outline" style="font-size: 2rem; color: #ef4444; display: block; margin: 0 auto 0.5rem;"></ion-icon>
                        No videos matching current search or filter.
                    </td>
                </tr>
            `;
            return;
        }

        adminVideosTableBody.innerHTML = filtered.map(v => {
            const ytId = v.youtubeId || extractYouTubeId(v.youtubeUrl);
            const thumbUrl = v.thumbnail || `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
            const isCustom = !!v.isCustom;

            let catLabel = 'Rasashastra';
            if (v.category === 'bhaishajya-kalpana') catLabel = 'Bhaishajya Kalpana';
            else if (v.category === 'equipment') catLabel = 'Yantras & Quality';
            else if (v.category === 'lectures') catLabel = 'Theory / Lectures';

            return `
                <tr>
                    <td>
                        <a href="https://youtu.be/${ytId}" target="_blank" title="Watch on YouTube" style="display: block; width: 84px; aspect-ratio: 16/9; border-radius: 6px; overflow: hidden; background: #000; position: relative;">
                            <img src="${thumbUrl}" alt="${v.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://img.youtube.com/vi/${ytId}/0.jpg'">
                            <span style="position: absolute; inset: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: #fff;">
                                <ion-icon name="play" style="font-size: 1.2rem;"></ion-icon>
                            </span>
                        </a>
                    </td>
                    <td>
                        <strong style="color: var(--text-color); font-size: 0.95rem; display: block;">${v.title}</strong>
                        ${v.reference ? `<span style="font-size: 0.78rem; color: var(--text-muted);"><ion-icon name="bookmark-outline" style="vertical-align: -1px;"></ion-icon> ${v.reference}</span>` : ''}
                        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem;">
                            <code>ID: ${ytId}</code> ${v.duration ? `· <ion-icon name="time-outline" style="vertical-align: -1px;"></ion-icon> ${v.duration}` : ''}
                        </div>
                    </td>
                    <td>
                        <span class="video-category-badge cat-${v.category || 'rasashastra'}">${catLabel}</span>
                    </td>
                    <td>
                        ${isCustom 
                            ? `<span class="admin-video-pill-custom"><ion-icon name="star"></ion-icon> Custom Added</span>` 
                            : `<span class="admin-video-pill-builtin">Built-In Dataset</span>`}
                    </td>
                    <td style="text-align: right; white-space: nowrap;">
                        <a href="videos.html?v=${v.id || ytId}" target="_blank" class="btn-table-action" title="View in Video Hub" style="display: inline-flex; align-items: center; gap: 0.25rem;">
                            <ion-icon name="eye-outline"></ion-icon> Preview
                        </a>
                        ${isCustom ? `
                            <button class="btn-table-action danger btn-delete-custom-video" data-id="${v.id}" type="button" title="Remove Video" style="margin-left: 0.35rem;">
                                <ion-icon name="trash-outline"></ion-icon>
                            </button>
                        ` : ''}
                    </td>
                </tr>
            `;
        }).join('');
    };

    // Filter chip clicks
    adminVideoFilterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            adminVideoFilterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            activeAdminVideoFilter = chip.getAttribute('data-filter') || 'all';
            renderAdminVideos();
        });
    });

    if (adminVideoSearchInput) {
        adminVideoSearchInput.addEventListener('input', () => {
            renderAdminVideos();
        });
    }

    // Publish New Video Click Handler (Simple 1-Box Link Add)
    if (btnPublishAdminVideo) {
        btnPublishAdminVideo.addEventListener('click', async () => {
            const rawUrl = (adminVideoUrl ? adminVideoUrl.value : '').trim();
            const ytId = extractYouTubeId(rawUrl);

            if (!ytId) {
                alert('Please paste a valid YouTube video link (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...).');
                if (adminVideoUrl) adminVideoUrl.focus();
                return;
            }

            // Get title from input or fetch directly from YouTube oEmbed
            let title = (adminVideoTitle ? adminVideoTitle.value : '').trim();
            if (!title) {
                btnPublishAdminVideo.disabled = true;
                btnPublishAdminVideo.innerHTML = '<ion-icon name="hourglass-outline"></ion-icon> <span>Fetching...</span>';
                title = await fetchYouTubeTitle(ytId);
                btnPublishAdminVideo.disabled = false;
                btnPublishAdminVideo.innerHTML = '<ion-icon name="add-circle"></ion-icon> <span>Add Video</span>';
            }

            if (!title) {
                title = `RSBK Practical Video (${ytId})`;
            }

            // Detect category based on title keywords
            const lowerTitle = title.toLowerCase();
            let category = 'rasashastra';
            let categoryLabel = 'Rasashastra Practicals';

            if (lowerTitle.includes('sneha') || lowerTitle.includes('taila') || lowerTitle.includes('ghrita') || lowerTitle.includes('asava') || lowerTitle.includes('arishta') || lowerTitle.includes('kwatha') || lowerTitle.includes('kashaya') || lowerTitle.includes('avaleha') || lowerTitle.includes('vati') || lowerTitle.includes('churna') || lowerTitle.includes('bhaishajya')) {
                category = 'bhaishajya-kalpana';
                categoryLabel = 'Bhaishajya Kalpana Practicals';
            } else if (lowerTitle.includes('yantra') || lowerTitle.includes('musha') || lowerTitle.includes('puta') || lowerTitle.includes('pariksha') || lowerTitle.includes('testing') || lowerTitle.includes('xrd') || lowerTitle.includes('sem')) {
                category = 'equipment';
                categoryLabel = 'Yantras & Quality Control';
            } else if (lowerTitle.includes('lecture') || lowerTitle.includes('syllabus') || lowerTitle.includes('ncism') || lowerTitle.includes('history') || lowerTitle.includes('theory')) {
                category = 'lectures';
                categoryLabel = 'Theory & Expert Lectures';
            }

            const newVideoId = 'vid_custom_' + Date.now();
            const newVideo = {
                id: newVideoId,
                youtubeId: ytId,
                youtubeUrl: `https://www.youtube.com/watch?v=${ytId}`,
                title: title,
                category: category,
                categoryLabel: categoryLabel,
                reference: 'Curated by Administration',
                description: 'Authentic practical video added from YouTube.',
                tags: [categoryLabel, 'Practical', 'RSBK'],
                duration: '',
                source: 'Added by Administrator',
                dateAdded: new Date().toISOString(),
                addedBy: currentAdminUser ? (currentAdminUser.email || 'Admin') : 'Admin',
                isCustom: true
            };

            // 1. Save to local storage
            adminCustomVideos.unshift(newVideo);
            localStorage.setItem('rsbk_custom_videos', JSON.stringify(adminCustomVideos));

            // 2. Persist to Firebase Realtime Database cloud
            if (window.firebaseDb && window.firebaseRef && window.firebaseUpdate) {
                try {
                    const vRef = window.firebaseRef(window.firebaseDb, 'videos/' + newVideoId);
                    await window.firebaseUpdate(vRef, newVideo);
                } catch (fbErr) {
                    console.warn('Firebase video sync notice:', fbErr);
                }
            }

            // 3. Clear inputs & reset UI
            if (adminVideoUrl) adminVideoUrl.value = '';
            if (adminVideoTitle) adminVideoTitle.value = '';
            if (adminVideoLiveCard) adminVideoLiveCard.style.display = 'none';

            combineAdminVideos();
            alert(`Video "${title}" successfully added!\nIt is now live on our website's Video Hub.`);
        });
    }

    // Table action: Delete Custom Video delegation
    if (adminVideosTableBody) {
        adminVideosTableBody.addEventListener('click', async (e) => {
            const delBtn = e.target.closest('.btn-delete-custom-video');
            if (delBtn) {
                const vidId = delBtn.getAttribute('data-id');
                const target = adminCustomVideos.find(v => v.id === vidId);
                const title = target ? target.title : 'this video';

                const confirmed = confirm(`Are you sure you want to remove "${title}" from the website's Video Hub?`);
                if (!confirmed) return;

                // 1. Remove from local list & localStorage
                adminCustomVideos = adminCustomVideos.filter(v => v.id !== vidId);
                localStorage.setItem('rsbk_custom_videos', JSON.stringify(adminCustomVideos));

                // 2. Remove from Firebase Realtime Database
                if (window.firebaseDb && window.firebaseRef && window.firebaseSet) {
                    try {
                        const vRef = window.firebaseRef(window.firebaseDb, 'videos/' + vidId);
                        await window.firebaseSet(vRef, null);
                    } catch (fbErr) {
                        console.warn('Firebase video delete notice:', fbErr);
                    }
                }

                combineAdminVideos();
                alert('Video has been removed from the live Video Hub.');
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
        syncFirebaseUsers();
        syncFirebaseVerifications();
        loadAdminVideos();
        syncFirebaseVideos();
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
