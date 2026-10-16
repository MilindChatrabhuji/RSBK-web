// Auto-load Features Module (Dark Mode, Global Search, PWA, Doctor Verification)
if (!document.querySelector('script[src*="features.js"]')) {
    const featScript = document.createElement('script');
    featScript.src = 'features.js?v=5.0';
    document.head.appendChild(featScript);
}

document.addEventListener('DOMContentLoaded', async () => {
    // Navbar scroll effect (Theme-aware via CSS class)
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Simple reveal animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.book-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });

    // Setup Mobile Navigation Toggle
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const navOverlay = document.getElementById('navOverlay');

    if (navToggle && navLinks) {
        const setMenuOpen = (isOpen) => {
            navLinks.classList.toggle('open', isOpen);
            navToggle.classList.toggle('active', isOpen);
            navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            if (navOverlay) navOverlay.classList.toggle('open', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        };

        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = navLinks.classList.contains('open');
            setMenuOpen(!isOpen);
        });

        if (navOverlay) {
            navOverlay.addEventListener('click', () => setMenuOpen(false));
        }

        // Close when clicking any nav link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => setMenuOpen(false));
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('open')) {
                setMenuOpen(false);
            }
        });

        // Close on window resize back to desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && navLinks.classList.contains('open')) {
                setMenuOpen(false);
            }
        });
    }

    // Admin Email Identification
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

    const checkIsAdmin = (email) => {
        if (!email) return false;
        return ADMIN_EMAILS.includes(email.toLowerCase().trim());
    };

    const checkIsUnlimitedVip = (email) => {
        if (!email) return false;
        return UNLIMITED_VIP_EMAILS.includes(email.toLowerCase().trim());
    };

    const cachedUserEmail = (localStorage.getItem('rsbk_user_email') || '').toLowerCase();
    const isCachedAdminUser = checkIsAdmin(cachedUserEmail) || localStorage.getItem('rsbk_is_admin') === 'true';
    const isCachedVipUser = checkIsUnlimitedVip(cachedUserEmail) || localStorage.getItem('rsbk_is_vip') === 'true';

    // Mount Right-Side Vertical Menubar (Home, Books, Membership, Profile, Admin)
    const renderRightVerticalMenubar = (isAdmin = false) => {
        let vMenubar = document.getElementById('rightVerticalMenubar');
        if (!vMenubar) {
            vMenubar = document.createElement('aside');
            vMenubar.id = 'rightVerticalMenubar';
            vMenubar.className = 'right-vertical-menubar';
            vMenubar.setAttribute('aria-label', 'Right Navigation Menubar');
            document.body.appendChild(vMenubar);
        }

        const path = window.location.pathname.toLowerCase();
        const isHome = path.endsWith('/') || path.endsWith('index.html') || path.endsWith('index') || (!path.includes('students') && !path.includes('teachers') && !path.includes('books') && !path.includes('videos') && !path.includes('forum') && !path.includes('membership') && !path.includes('profile') && !path.includes('payment') && !path.includes('admin'));
        const isStudents = path.includes('students');
        const isTeachers = path.includes('teachers');
        const isBooks = path.includes('books');
        const isVideos = path.includes('videos');
        const isForum = path.includes('forum');
        const isMembership = path.includes('membership');
        const isProfile = path.includes('profile');
        const isAdminPage = path.includes('admin');

        vMenubar.innerHTML = `
            <div class="vmenu-header">
                <span class="vmenu-badge">${isAdmin ? 'ADMIN' : 'MENU'}</span>
            </div>
            <nav class="vmenu-nav">
                <a href="index.html" class="vmenu-item ${isHome ? 'active' : ''}" title="Home">
                    <ion-icon name="home-outline"></ion-icon>
                    <span class="vmenu-text">Home</span>
                </a>
                <a href="students.html" class="vmenu-item ${isStudents ? 'active' : ''}" title="For Students">
                    <ion-icon name="school-outline"></ion-icon>
                    <span class="vmenu-text">Students</span>
                </a>
                <a href="teachers.html" class="vmenu-item ${isTeachers ? 'active' : ''}" title="For Teachers">
                    <ion-icon name="easel-outline"></ion-icon>
                    <span class="vmenu-text">Teachers</span>
                </a>
                <a href="books.html" class="vmenu-item ${isBooks ? 'active' : ''}" title="Books Archive">
                    <ion-icon name="library-outline"></ion-icon>
                    <span class="vmenu-text">Books</span>
                </a>
                <a href="videos.html" class="vmenu-item ${isVideos ? 'active' : ''}" title="Video Hub">
                    <ion-icon name="videocam-outline"></ion-icon>
                    <span class="vmenu-text">Videos</span>
                </a>
                <a href="forum.html" class="vmenu-item ${isForum ? 'active' : ''}" title="Discussion Forum">
                    <ion-icon name="chatbubbles-outline"></ion-icon>
                    <span class="vmenu-text">Forum</span>
                </a>
                <a href="membership.html" class="vmenu-item ${isMembership ? 'active' : ''}" title="Membership &amp; Wallet">
                    <ion-icon name="ribbon-outline"></ion-icon>
                    <span class="vmenu-text">Membership</span>
                </a>
                <a href="profile.html" class="vmenu-item ${isProfile ? 'active' : ''}" title="User Profile">
                    <ion-icon name="person-outline"></ion-icon>
                    <span class="vmenu-text">Profile</span>
                </a>
                ${isAdmin ? `
                <a href="admin.html" class="vmenu-item admin-link ${isAdminPage ? 'active' : ''}" title="Admin Panel">
                    <ion-icon name="shield-checkmark-outline"></ion-icon>
                    <span class="vmenu-text">Admin</span>
                </a>` : ''}
            </nav>
        `;
    };

    // Initial render using cache
    renderRightVerticalMenubar(isCachedAdminUser);

    // =========================================================================
    // Floating Visitor Counter (Lower Left Corner — 3 Equally Visible Categories)
    // 1. Total Website Visitors | 2. Live Website Users | 3. Registered Users
    // =========================================================================
    const initVisitorCounter = () => {
        if (document.getElementById('visitorCounterWidget')) return;

        // Clean up any legacy synthetic baseline counters
        if (localStorage.getItem('rsbk_total_visitors')) {
            localStorage.removeItem('rsbk_total_visitors');
        }

        // Retrieve actual counts from local storage cache
        let actualCount = parseInt(localStorage.getItem('rsbk_real_visitors'), 10);
        if (isNaN(actualCount) || actualCount < 0) {
            actualCount = 0;
        }

        let regCount = parseInt(localStorage.getItem('rsbk_registered_users_count'), 10);
        if (isNaN(regCount) || regCount < 0) {
            regCount = 15; // Known verified registered accounts baseline
        }

        // Create Widget DOM container
        const widget = document.createElement('div');
        widget.id = 'visitorCounterWidget';
        widget.className = 'visitor-counter-widget';
        widget.setAttribute('role', 'region');
        widget.setAttribute('aria-label', 'Website Analytics & Visitor Counter');

        // Restore minimized preference if stored
        const isMinimized = localStorage.getItem('rsbk_vc_minimized') === 'true';
        if (isMinimized) {
            widget.classList.add('minimized');
        }

        widget.innerHTML = `
            <div class="vc-card" id="vcCard">
                <div class="vc-top-row">
                    <div class="vc-header-title">
                        <span class="vc-pulse-dot"></span>
                        <span>RSBK Live Telemetry</span>
                    </div>
                    <button class="vc-toggle-btn" id="vcToggleBtn" type="button" title="Minimize / Expand Counter" aria-label="Minimize or Expand">
                        <ion-icon name="${isMinimized ? 'chevron-up-outline' : 'chevron-down-outline'}"></ion-icon>
                    </button>
                </div>
                
                <!-- Three Equally Visible Categories Grid -->
                <div class="vc-categories-grid">
                    <!-- Category 1: Total Website Visitors -->
                    <div class="vc-category-box" title="Total Website Visitors recorded till now">
                        <div class="vc-category-header">
                            <span class="vc-cat-badge visitors">
                                <ion-icon name="globe-outline"></ion-icon>
                            </span>
                            <span class="vc-cat-title">Total Visitors</span>
                        </div>
                        <div class="vc-cat-number" id="vcTotalVisitorsDisplay">${actualCount.toLocaleString('en-IN')}</div>
                        <div class="vc-cat-subtext">Website Hits</div>
                    </div>

                    <!-- Category 2: Live Website Users -->
                    <div class="vc-category-box highlight-live" title="Live Website Users actively browsing right now">
                        <div class="vc-category-header">
                            <span class="vc-cat-badge live">
                                <span class="vc-pulse-dot"></span>
                            </span>
                            <span class="vc-cat-title">Live Users</span>
                        </div>
                        <div class="vc-cat-number text-live" id="vcLiveUsersDisplay">1</div>
                        <div class="vc-cat-subtext">Online Now</div>
                    </div>

                    <!-- Category 3: Registered Users -->
                    <div class="vc-category-box" title="Total Registered Users (Google Authenticated)">
                        <div class="vc-category-header">
                            <span class="vc-cat-badge registered">
                                <ion-icon name="people-outline"></ion-icon>
                            </span>
                            <span class="vc-cat-title">Registered Users</span>
                        </div>
                        <div class="vc-cat-number text-registered" id="vcRegisteredUsersDisplay">${regCount.toLocaleString('en-IN')}</div>
                        <div class="vc-cat-subtext">Verified Accounts</div>
                    </div>
                </div>

                <!-- Minimized Strip (Equally visible categories) -->
                <div class="vc-minimized-strip">
                    <div class="vc-min-item" title="Total Website Visitors">
                        <ion-icon name="globe-outline"></ion-icon>
                        <b id="vcMinTotal">${actualCount.toLocaleString('en-IN')}</b>
                    </div>
                    <span class="vc-min-divider">|</span>
                    <div class="vc-min-item text-live" title="Live Users Online">
                        <span class="vc-pulse-dot"></span>
                        <b id="vcMinLive">1</b> Live
                    </div>
                    <span class="vc-min-divider">|</span>
                    <div class="vc-min-item text-registered" title="Registered Users">
                        <ion-icon name="people-outline"></ion-icon>
                        <b id="vcMinReg">${regCount.toLocaleString('en-IN')}</b> Reg
                    </div>
                </div>

                <div class="vc-footer-tooltip">
                    <ion-icon name="shield-checkmark-outline"></ion-icon>
                    <span>Verified Real-Time Portal Telemetry</span>
                </div>
            </div>
        `;

        document.body.appendChild(widget);

        // Toggle Minimize / Expand behavior
        const toggleBtn = document.getElementById('vcToggleBtn');
        const card = document.getElementById('vcCard');

        const toggleWidget = (e) => {
            if (e) e.stopPropagation();
            const minimizedNow = widget.classList.toggle('minimized');
            localStorage.setItem('rsbk_vc_minimized', minimizedNow ? 'true' : 'false');
            if (toggleBtn) {
                const icon = toggleBtn.querySelector('ion-icon');
                if (icon) {
                    icon.setAttribute('name', minimizedNow ? 'chevron-up-outline' : 'chevron-down-outline');
                }
            }
        };

        if (toggleBtn) {
            toggleBtn.addEventListener('click', toggleWidget);
        }

        if (card) {
            card.addEventListener('click', (e) => {
                if (widget.classList.contains('minimized')) {
                    toggleWidget(e);
                }
            });
        }
    };

    // Initialize Visitor Counter DOM
    initVisitorCounter();

    // Helper: IST Time formatting & 5:00 AM Boundary
    const getISTTime = (d = new Date()) => {
        const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
        return new Date(utc + (3600000 * 5.5));
    };

    const getLatest5AMBoundary = (now = new Date()) => {
        const istNow = getISTTime(now);
        const boundary = new Date(istNow);
        if (istNow.getHours() < 5) {
            boundary.setDate(boundary.getDate() - 1);
        }
        boundary.setHours(5, 0, 0, 0);
        return boundary;
    };

    const formatISTDateShort = (date) => {
        return new Intl.DateTimeFormat('en-IN', {
            timeZone: 'Asia/Kolkata',
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).format(date);
    };

    // Fast synchronous cached authentication & access restoration (Zero Flash)
    const isCachedAuth = localStorage.getItem('rsbk_auth_cached') === 'true';
    const cachedAccessValid = localStorage.getItem('rsbk_access_valid') === 'true';
    const cachedAccessType = localStorage.getItem('rsbk_access_type') || 'trial';
    const cachedTrialDays = localStorage.getItem('rsbk_trial_days_left') || '30';
    const cachedBalance = localStorage.getItem('rsbk_wallet_balance') || '0';
    const cachedName = localStorage.getItem('rsbk_user_name') || '';
    const cachedAvatar = localStorage.getItem('rsbk_user_avatar') || '';

    if (isCachedAuth) {
        document.documentElement.classList.add('auth-verified');
        document.body.classList.add('auth-verified');
        if (cachedAccessValid || isCachedVipUser) {
            document.documentElement.classList.add('access-granted');
            document.body.classList.add('access-granted');
        } else {
            document.body.classList.add('paywall-expired');
        }
    }

    // Determine Page Type
    const currentPath = window.location.pathname.toLowerCase();
    const isHomepage = currentPath.endsWith('/') || currentPath.endsWith('index.html') || currentPath.endsWith('index');
    const isMembershipPage = currentPath.includes('membership');
    const isConfirmationPage = currentPath.includes('payment-confirmation');
    const isProtectedContentPage = document.body.classList.contains('protected-page') && !isMembershipPage && !isConfirmationPage;

    // Helper: Build User Tier Pill HTML
    const buildUserTierPill = (type, trialDays, balance) => {
        if (type === 'trial') {
            return ''; // Removed from top navbar as requested
        } else if (type === 'paid') {
            return `<span class="user-tier-pill pro" id="userTierPill" title="Active Member"><ion-icon name="checkmark-circle"></ion-icon> ₹${Math.floor(balance)}</span>`;
        } else if (type === 'expired') {
            return `<a href="membership.html" class="user-tier-pill expired" id="userTierPill" title="Trial Expired · Recharge Wallet"><ion-icon name="alert-circle"></ion-icon> Top-Up</a>`;
        }
        return '';
    };

    // Mount Auth Widget into Navbar
    const authContainer = document.getElementById('authWidget') || document.querySelector('.auth-widget');
    if (authContainer) {
        authContainer.innerHTML = `
            <button id="googleSignInBtn" class="btn-google-signin" type="button" title="Sign in with Google" style="${isCachedAuth ? 'display: none !important;' : ''}">
                <svg class="google-icon" viewBox="0 0 24 24" width="18" height="18">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.3 0 6.08-1.09 8.1-2.96l-3.88-3.05c-1.08.72-2.45 1.16-4.22 1.16-3.24 0-5.98-2.18-6.96-5.11H1.05v3.14C3.06 21.2 7.22 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.04 14.04c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.32H1.05C.38 7.66 0 9.16 0 10.75s.38 3.09 1.05 4.43l3.99-3.14z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.22 0 3.06 2.8 1.05 6.82l3.99 3.14c.98-2.93 3.72-5.21 6.96-5.21z"/>
                </svg>
                <span>Sign in</span>
            </button>
            <div id="userProfileArea" class="user-profile-area" style="${isCachedAuth ? 'display: inline-flex !important;' : 'display: none;'}">
                <a href="profile.html" class="user-profile-link" title="Open Profile">
                    <img id="userAvatar" class="user-avatar" src="${cachedAvatar || ''}" alt="User" referrerpolicy="no-referrer" />
                    <span id="userName" class="user-name">${cachedName}</span>
                </a>
                <span id="navTierPillSlot">${isCachedAuth ? buildUserTierPill(cachedAccessType, cachedTrialDays, cachedBalance) : ''}</span>
                <button id="signOutBtn" class="btn-signout" type="button" title="Sign out">Sign out</button>
            </div>
        `;
    }

    // Ensure Auth Gate element exists on protected content pages
    let authGate = document.getElementById('authGate');
    if (isProtectedContentPage && !authGate) {
        authGate = document.createElement('div');
        authGate.id = 'authGate';
        authGate.className = 'auth-gate';
        if (isCachedAuth && cachedAccessValid) {
            authGate.style.display = 'none';
        }
        const mainEl = document.querySelector('.page-main');
        if (mainEl && mainEl.parentNode) {
            mainEl.parentNode.insertBefore(authGate, mainEl);
        } else {
            document.body.appendChild(authGate);
        }
    }

    // Central Access Evaluation: 30-Day Free Trial & Wallet Balance Rules
    const TRIAL_DURATION_DAYS = 30;
    const TRIAL_MS = TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000;

    const evaluateUserAccess = (user) => {
        if (!user) {
            return {
                hasAccess: false,
                status: 'unauthenticated',
                isTrialActive: false,
                trialDaysRemaining: 0,
                balance: 0,
                paidDaysRemaining: 0
            };
        }

        const uid = user.uid;
        const walletKey = `rsbk_wallet_${uid}`;
        let wallet = null;
        try {
            const raw = localStorage.getItem(walletKey);
            if (raw) wallet = JSON.parse(raw);
        } catch (e) {
            console.error('Error reading wallet:', e);
        }

        if (!wallet) {
            wallet = {
                balance: 0,
                trialStartDate: Date.now(),
                lastDeductedEpoch: null,
                transactions: []
            };
        }

        // Initialize 30-day trial start timestamp on first sign-in
        if (!wallet.trialStartDate) {
            const storedTrial = localStorage.getItem(`rsbk_trial_start_${uid}`);
            wallet.trialStartDate = storedTrial ? parseInt(storedTrial, 10) : Date.now();
        }
        localStorage.setItem(`rsbk_trial_start_${uid}`, wallet.trialStartDate.toString());

        const now = Date.now();

        // Check Unlimited VIP Lifetime Access
        const email = (user.email || '').toLowerCase().trim();
        const isUnlimitedVip = checkIsUnlimitedVip(email) || Boolean(wallet.isVip) || Boolean(user.isVip);

        if (isUnlimitedVip) {
            wallet.isVip = true;
            wallet.balance = Math.max(Number(wallet.balance) || 0, 9999);
            try {
                localStorage.setItem(walletKey, JSON.stringify(wallet));
                localStorage.setItem('rsbk_is_vip', 'true');
                localStorage.setItem('rsbk_access_valid', 'true');
                localStorage.setItem('rsbk_access_type', 'vip');
                localStorage.setItem('rsbk_trial_days_left', '9999');
                localStorage.setItem('rsbk_wallet_balance', '9999');
            } catch (e) {}

            return {
                hasAccess: true,
                status: 'vip',
                isVip: true,
                isTrialActive: true,
                trialDaysRemaining: 9999,
                trialStartDate: wallet.trialStartDate,
                trialEndDate: now + (3650 * 24 * 60 * 60 * 1000), // 10 years
                balance: 9999,
                paidDaysRemaining: 9999,
                wallet
            };
        }

        const trialEnd = wallet.trialStartDate + TRIAL_MS;
        const isTrialActive = now < trialEnd;
        const trialDaysRemaining = isTrialActive ? Math.max(1, Math.ceil((trialEnd - now) / (24 * 60 * 60 * 1000))) : 0;

        // Daily balance deductions apply ONLY after 30-day free trial has expired
        if (!isTrialActive && wallet.balance > 0) {
            const latest5AM = getLatest5AMBoundary(new Date(now)).getTime();
            if (!wallet.lastDeductedEpoch || wallet.lastDeductedEpoch < trialEnd) {
                wallet.lastDeductedEpoch = trialEnd;
            }

            if (latest5AM > wallet.lastDeductedEpoch) {
                const diffDays = Math.floor((latest5AM - wallet.lastDeductedEpoch) / (24 * 60 * 60 * 1000));
                if (diffDays > 0) {
                    const deduct = Math.min(diffDays, Math.floor(wallet.balance));
                    if (deduct > 0) {
                        wallet.balance = Math.max(0, wallet.balance - deduct);
                        if (!wallet.transactions) wallet.transactions = [];
                        const dedRecord = {
                            id: 'TXN-DED-' + Date.now(),
                            date: formatISTDateShort(new Date()) + ' (05:00 AM IST)',
                            rawDate: Date.now(),
                            userName: user.displayName || 'Member',
                            userEmail: user.email || '',
                            userId: user.uid,
                            type: 'debit',
                            amount: deduct,
                            note: `Daily Membership Charge (₹1/day × ${deduct} ${deduct === 1 ? 'day' : 'days'} at 5:00 AM IST)`,
                            refId: 'AUTO-IST-0500',
                            balanceAfter: wallet.balance
                        };
                        wallet.transactions.unshift(dedRecord);

                        try {
                            let gTxns = JSON.parse(localStorage.getItem('rsbk_global_transactions') || '[]');
                            gTxns.unshift(dedRecord);
                            localStorage.setItem('rsbk_global_transactions', JSON.stringify(gTxns));
                        } catch (e) {}
                    }
                    wallet.lastDeductedEpoch = latest5AM;
                }
            }
        }

        // Save updated wallet
        try {
            localStorage.setItem(walletKey, JSON.stringify(wallet));
        } catch (e) {}

        const balance = Math.max(0, wallet.balance || 0);
        const hasPaidAccess = balance >= 1;
        const hasAccess = isTrialActive || hasPaidAccess;

        let status = 'expired';
        if (isTrialActive) {
            status = 'trial';
        } else if (hasPaidAccess) {
            status = 'paid';
        }

        // Synchronize fast cache for zero-flash subpage navigation
        localStorage.setItem('rsbk_access_valid', hasAccess ? 'true' : 'false');
        localStorage.setItem('rsbk_access_type', status);
        localStorage.setItem('rsbk_trial_days_left', trialDaysRemaining.toString());
        localStorage.setItem('rsbk_wallet_balance', balance.toString());
        localStorage.setItem('rsbk_trial_end_epoch', trialEnd.toString());

        return {
            hasAccess,
            status, // 'trial' | 'paid' | 'expired'
            isTrialActive,
            trialDaysRemaining,
            trialStartDate: wallet.trialStartDate,
            trialEndDate: trialEnd,
            balance,
            paidDaysRemaining: Math.floor(balance / 1),
            wallet
        };
    };

    // Render Paywall UI & Enforce Page Gating
    const renderPaywall = (accessInfo, onGoogleSignIn) => {
        // Homepage and Wallet Management pages are never blocked
        if (!isProtectedContentPage) return;

        const gate = document.getElementById('authGate');
        const main = document.querySelector('.page-main');

        if (accessInfo.hasAccess) {
            if (gate) gate.style.display = 'none';
            if (main) main.style.display = 'block';
            document.body.classList.add('access-granted');
            document.body.classList.remove('auth-unverified', 'paywall-expired');
            return;
        }

        // Access denied: hide page content and show appropriate paywall
        if (main) main.style.display = 'none';
        if (gate) gate.style.display = 'flex';
        document.body.classList.remove('access-granted');

        if (accessInfo.status === 'unauthenticated') {
            document.body.classList.add('auth-unverified');
            document.body.classList.remove('paywall-expired');

            gate.innerHTML = `
                <div class="auth-gate-card paywall-card-trial">
                    <div class="paywall-trial-badge" style="background: rgba(16, 185, 129, 0.15); color: #059669; border-color: rgba(16, 185, 129, 0.3);">
                        <ion-icon name="sparkles"></ion-icon> 100% Free Academic Access
                    </div>
                    <div class="auth-gate-icon">
                        <ion-icon name="lock-open-outline" style="color: #059669;"></ion-icon>
                    </div>
                    <h2 class="auth-gate-title">Sign In with Google for Instant Free Access</h2>
                    <p class="auth-gate-desc">
                        Curriculum handbooks, cognitive assessment blueprints, ABQ question banks, and the complete reference books archive are completely free of charge for <strong>UG &amp; PG students, teachers, doctors, and everyone</strong>. Sign in with Google to read immediately.
                    </p>

                    <div class="paywall-features-list">
                        <div class="paywall-feature-item">
                            <ion-icon name="checkmark-circle"></ion-icon>
                            <span><strong>100% Free of Charge</strong> — Free registration with your Google account.</span>
                        </div>
                        <div class="paywall-feature-item">
                            <ion-icon name="checkmark-circle"></ion-icon>
                            <span><strong>Instant 1-Click Access</strong> — No passwords, forms, or payment details required.</span>
                        </div>
                        <div class="paywall-feature-item">
                            <ion-icon name="checkmark-circle"></ion-icon>
                            <span><strong>For Students, Teachers &amp; Everyone</strong> — NCISM aligned study and pedagogy materials.</span>
                        </div>
                    </div>

                    <button id="gateGoogleSignInBtn" class="btn-google-gate" type="button" title="Sign in with Google">
                        <svg class="google-icon" viewBox="0 0 24 24" width="20" height="20">
                            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                            <path fill="#34A853" d="M12 24c3.3 0 6.08-1.09 8.1-2.96l-3.88-3.05c-1.08.72-2.45 1.16-4.22 1.16-3.24 0-5.98-2.18-6.96-5.11H1.05v3.14C3.06 21.2 7.22 24 12 24z"/>
                            <path fill="#FBBC05" d="M5.04 14.04c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.32H1.05C.38 7.66 0 9.16 0 10.75s.38 3.09 1.05 4.43l3.99-3.14z"/>
                            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.22 0 3.06 2.8 1.05 6.82l3.99 3.14c.98-2.93 3.72-5.21 6.96-5.21z"/>
                        </svg>
                        <span>Continue with Google (Instant Free Access)</span>
                    </button>

                    <div class="auth-gate-footer">
                        <a href="index.html" class="auth-gate-back-link">
                            <ion-icon name="arrow-back-outline"></ion-icon> Return to Homepage
                        </a>
                    </div>
                </div>
            `;

            const gateBtn = document.getElementById('gateGoogleSignInBtn');
            if (gateBtn && onGoogleSignIn) {
                gateBtn.addEventListener('click', onGoogleSignIn);
            }
        } else if (accessInfo.status === 'expired') {
            document.body.classList.add('paywall-expired');
            document.body.classList.remove('auth-unverified');

            const trialEndDateStr = accessInfo.trialEndDate ? formatISTDateShort(new Date(accessInfo.trialEndDate)) : 'recently';

            gate.innerHTML = `
                <div class="auth-gate-card paywall-card-expired">
                    <div class="paywall-expired-badge">
                        <ion-icon name="time-outline"></ion-icon> 30-Day Free Trial Completed
                    </div>
                    <div class="auth-gate-icon icon-expired">
                        <ion-icon name="wallet-outline"></ion-icon>
                    </div>
                    <h2 class="auth-gate-title">Recharge Wallet to Continue Access</h2>
                    <p class="auth-gate-desc">
                        Your complimentary 30-day trial ended on <strong>${trialEndDateStr}</strong>. To maintain uninterrupted access to all curriculum handbooks, question banks, and reference books, please recharge your wallet.
                    </p>

                    <div class="paywall-pricing-box">
                        <div class="pricing-rate-main">
                            <span class="rate-currency">₹</span>
                            <span class="rate-amount">1</span>
                            <span class="rate-period">/ day</span>
                        </div>
                        <p class="rate-subtext">24-Hour Access · Auto-deducted daily at 5:00 AM IST</p>
                        <div class="rate-wallet-pill">
                            <span>Current Balance:</span> <strong>₹${Number(accessInfo.balance).toFixed(2)}</strong>
                        </div>
                    </div>

                    <a href="membership.html" class="btn-paywall-recharge" title="Recharge Wallet">
                        <ion-icon name="flash-outline"></ion-icon>
                        <span>Recharge Wallet (From ₹1)</span>
                    </a>

                    <div class="auth-gate-footer">
                        <a href="index.html" class="auth-gate-back-link">
                            <ion-icon name="arrow-back-outline"></ion-icon> Return to Homepage
                        </a>
                    </div>
                </div>
            `;
        }
    };

    // Initialize Firebase Services (Auth & Realtime Database)
    try {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
        const { getAuth, GoogleAuthProvider, signInWithPopup, signInWithCredential, signOut, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');
        const { getDatabase, ref, onValue, set, onDisconnect, runTransaction, push, update } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js');

        const firebaseConfig = {
            apiKey: "AIzaSyCZQqKCURGqMQ2LUl_XHOgscBmjs7Vj7ps",
            authDomain: "rsbk-online.firebaseapp.com",
            projectId: "rsbk-online",
            storageBucket: "rsbk-online.firebasestorage.app",
            messagingSenderId: "362985180438",
            appId: "1:362985180438:web:9802e4253a5f6b329ad437",
            databaseURL: "https://rsbk-online-default-rtdb.firebaseio.com"
        };

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getDatabase(app);

        // Expose Firebase Globally
        window.firebaseApp = app;
        window.firebaseAuth = auth;
        window.firebaseDb = db;
        window.firebaseRef = ref;
        window.firebaseOnValue = onValue;
        window.firebaseSet = set;
        window.firebasePush = push;
        window.firebaseUpdate = update;
        window.firebaseRunTransaction = runTransaction;

        // Realtime Presence (Live Online Active Users) & Cumulative Total Visits
        try {
            let liveSessionId = sessionStorage.getItem('rsbk_live_session_id');
            if (!liveSessionId) {
                liveSessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
                sessionStorage.setItem('rsbk_live_session_id', liveSessionId);
            }

            const myPresenceRef = ref(db, 'presence/' + liveSessionId);
            const connectedRef = ref(db, '.info/connected');

            onValue(connectedRef, (snap) => {
                if (snap.val() === true) {
                    onDisconnect(myPresenceRef).remove();
                    set(myPresenceRef, {
                        online: true,
                        ts: Date.now()
                    });
                }
            });

            // Category 2: Live Website Users (presence listener)
            const presenceGroupRef = ref(db, 'presence');
            const liveUsersDisplay = document.getElementById('vcLiveUsersDisplay');
            const minLiveEl = document.getElementById('vcMinLive');

            onValue(presenceGroupRef, (snapshot) => {
                const data = snapshot.val();
                const liveCount = Math.max(1, data ? Object.keys(data).length : 1);
                sessionStorage.setItem('rsbk_live_users', liveCount.toString());
                if (liveUsersDisplay) liveUsersDisplay.textContent = liveCount.toLocaleString('en-IN');
                if (minLiveEl) minLiveEl.textContent = liveCount.toLocaleString('en-IN');
            });

            window.addEventListener('beforeunload', () => {
                try {
                    set(myPresenceRef, null);
                } catch (e) {}
            });

            // Category 1: Cumulative Total Website Visitors
            const totalVisitsRef = ref(db, 'stats/totalVisits');
            const totalVisitorsDisplay = document.getElementById('vcTotalVisitorsDisplay');
            const minTotalEl = document.getElementById('vcMinTotal');

            onValue(totalVisitsRef, (snapshot) => {
                const total = snapshot.val();
                if (typeof total === 'number') {
                    const formatted = total.toLocaleString('en-IN');
                    localStorage.setItem('rsbk_real_visitors', total.toString());
                    if (totalVisitorsDisplay) totalVisitorsDisplay.textContent = formatted;
                    if (minTotalEl) minTotalEl.textContent = formatted;
                }
            });

            // Category 3: Registered Users (Realtime Database /users)
            const usersGroupRef = ref(db, 'users');
            const regUsersDisplay = document.getElementById('vcRegisteredUsersDisplay');
            const minRegEl = document.getElementById('vcMinReg');

            onValue(usersGroupRef, (snapshot) => {
                const data = snapshot.val();
                let regCount = 15;
                if (data && typeof data === 'object') {
                    regCount = Object.keys(data).length;
                }
                localStorage.setItem('rsbk_registered_users_count', regCount.toString());
                const formattedReg = regCount.toLocaleString('en-IN');
                if (regUsersDisplay) regUsersDisplay.textContent = formattedReg;
                if (minRegEl) minRegEl.textContent = formattedReg;
            });

            // Count visit strictly once per unique browser session
            const sessionCounted = sessionStorage.getItem('rsbk_session_counted');
            if (!sessionCounted) {
                sessionStorage.setItem('rsbk_session_counted', 'true');
                runTransaction(totalVisitsRef, (current) => (current || 0) + 1);
            }
        } catch (dbErr) {
            console.warn('Realtime Database tracking warning:', dbErr);
        }
        const provider = new GoogleAuthProvider();

        const signInBtn = document.getElementById('googleSignInBtn');
        const userProfileArea = document.getElementById('userProfileArea');
        const userAvatar = document.getElementById('userAvatar');
        const userName = document.getElementById('userName');
        const navTierPillSlot = document.getElementById('navTierPillSlot');
        const signOutBtn = document.getElementById('signOutBtn');

        const handleGoogleSignIn = async () => {
            try {
                await signInWithPopup(auth, provider);
            } catch (err) {
                if (err.code !== 'auth/popup-closed-by-user') {
                    console.error('Google Sign-In error:', err);
                    alert('Unable to sign in right now: ' + (err.message || 'Please try again.'));
                }
            }
        };

        if (signInBtn) {
            signInBtn.addEventListener('click', handleGoogleSignIn);
        }

        const heroSignInBtn = document.getElementById('heroGoogleSignInBtn');
        if (heroSignInBtn) {
            heroSignInBtn.addEventListener('click', handleGoogleSignIn);
        }

        // =========================================================================
        // Google One Tap Identity Services (Instant Zero-Click Google Prompt)
        // =========================================================================
        const initGoogleOneTap = (authInstance) => {
            if (localStorage.getItem('rsbk_auth_cached') === 'true') return;
            if (sessionStorage.getItem('rsbk_onetap_dismissed') === 'true') return;

            const clientId = "362985180438-r0cbhumpvkoclh6ghvohh65rsfitrcf9.apps.googleusercontent.com";

            if (!document.getElementById('googleGsiScript') && (!window.google || !window.google.accounts || !window.google.accounts.id)) {
                const gsiScript = document.createElement('script');
                gsiScript.id = 'googleGsiScript';
                gsiScript.src = 'https://accounts.google.com/gsi/client';
                gsiScript.async = true;
                gsiScript.defer = true;
                document.head.appendChild(gsiScript);
            }

            const triggerOneTap = () => {
                if (!window.google || !window.google.accounts || !window.google.accounts.id) return;
                try {
                    window.google.accounts.id.initialize({
                        client_id: clientId,
                        callback: async (response) => {
                            if (response && response.credential) {
                                try {
                                    const credential = GoogleAuthProvider.credential(response.credential);
                                    await signInWithCredential(authInstance, credential);
                                } catch (err) {
                                    console.error('One Tap credential exchange failed:', err);
                                }
                            }
                        },
                        auto_select: false,
                        cancel_on_tap_outside: true
                    });

                    window.google.accounts.id.prompt((notification) => {
                        if (notification.isDismissedMoment() || notification.isSkippedMoment()) {
                            sessionStorage.setItem('rsbk_onetap_dismissed', 'true');
                        }
                    });
                } catch (e) {
                    console.warn('Google One Tap note:', e);
                }
            };

            if (window.google && window.google.accounts) {
                triggerOneTap();
            } else {
                const checkGoogle = setInterval(() => {
                    if (window.google && window.google.accounts) {
                        clearInterval(checkGoogle);
                        triggerOneTap();
                    }
                }, 400);
                setTimeout(() => clearInterval(checkGoogle), 6000);
            }
        };

        // =========================================================================
        // Floating Sticky Guest Bar (Center Bottom on Scroll)
        // =========================================================================
        const initFloatingGuestBar = (onSignIn) => {
            if (localStorage.getItem('rsbk_auth_cached') === 'true') return;
            if (document.getElementById('floatingGuestBar')) return;

            const bar = document.createElement('div');
            bar.id = 'floatingGuestBar';
            bar.className = 'floating-guest-bar';
            bar.innerHTML = `
                <div class="guest-bar-content">
                    <div class="guest-bar-text">
                        <span class="guest-bar-title"><ion-icon name="sparkles"></ion-icon> 100% Free Academic Access</span>
                        <span class="guest-bar-desc">Sign in with Google to explore textbooks, ABQ question banks &amp; classical treatises!</span>
                    </div>
                    <button class="btn-guest-bar-google" id="guestBarGoogleBtn" type="button" title="Sign in with Google (100% Free)">
                        <svg class="google-icon" viewBox="0 0 24 24" width="18" height="18">
                            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                            <path fill="#34A853" d="M12 24c3.3 0 6.08-1.09 8.1-2.96l-3.88-3.05c-1.08.72-2.45 1.16-4.22 1.16-3.24 0-5.98-2.18-6.96-5.11H1.05v3.14C3.06 21.2 7.22 24 12 24z"/>
                            <path fill="#FBBC05" d="M5.04 14.04c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.32H1.05C.38 7.66 0 9.16 0 10.75s.38 3.09 1.05 4.43l3.99-3.14z"/>
                            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.22 0 3.06 2.8 1.05 6.82l3.99 3.14c.98-2.93 3.72-5.21 6.96-5.21z"/>
                        </svg>
                        <span>Sign in Free</span>
                    </button>
                    <button class="guest-bar-close" id="closeGuestBarBtn" type="button" title="Dismiss">&times;</button>
                </div>
            `;
            document.body.appendChild(bar);

            const barBtn = document.getElementById('guestBarGoogleBtn');
            if (barBtn && onSignIn) barBtn.addEventListener('click', onSignIn);

            const closeBtn = document.getElementById('closeGuestBarBtn');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    bar.classList.remove('visible');
                    sessionStorage.setItem('rsbk_guest_bar_dismissed', 'true');
                });
            }

            const checkScroll = () => {
                if (sessionStorage.getItem('rsbk_guest_bar_dismissed') === 'true' || localStorage.getItem('rsbk_auth_cached') === 'true') {
                    bar.classList.remove('visible');
                    return;
                }
                if (window.scrollY > 260) {
                    bar.classList.add('visible');
                } else {
                    bar.classList.remove('visible');
                }
            };

            window.addEventListener('scroll', checkScroll, { passive: true });
            checkScroll();
        };

        // =========================================================================
        // Exit-Intent & Gentle Inactivity Welcome Modal
        // =========================================================================
        const initGuestNudge = (onSignIn) => {
            if (localStorage.getItem('rsbk_auth_cached') === 'true') return;
            if (sessionStorage.getItem('rsbk_nudge_shown') === 'true') return;

            const showNudgeModal = () => {
                if (localStorage.getItem('rsbk_auth_cached') === 'true') return;
                if (sessionStorage.getItem('rsbk_nudge_shown') === 'true') return;
                if (document.getElementById('guestNudgeModal')) return;

                sessionStorage.setItem('rsbk_nudge_shown', 'true');

                const modal = document.createElement('div');
                modal.id = 'guestNudgeModal';
                modal.className = 'guest-nudge-modal';
                modal.innerHTML = `
                    <div class="guest-nudge-card">
                        <button class="nudge-close-btn" id="nudgeCloseBtn" type="button" title="Close">&times;</button>
                        <div class="nudge-icon-wrap">
                            <ion-icon name="sparkles"></ion-icon>
                        </div>
                        <h3 class="nudge-title">Welcome to RSBK Online!</h3>
                        <p class="nudge-desc">
                            Unlock full NCISM curriculum handbooks, Bloom's &amp; Miller's pedagogical series, question banks, and classical treatises free of charge.
                        </p>
                        <div class="nudge-perks">
                            <div class="nudge-perk-item">
                                <ion-icon name="checkmark-circle"></ion-icon>
                                <span>100% Free of Charge — No fees required</span>
                            </div>
                            <div class="nudge-perk-item">
                                <ion-icon name="checkmark-circle"></ion-icon>
                                <span>Instant 1-Click Sign-In with Google</span>
                            </div>
                            <div class="nudge-perk-item">
                                <ion-icon name="checkmark-circle"></ion-icon>
                                <span>For Students, Teachers, Doctors &amp; Everyone</span>
                            </div>
                        </div>
                        <button class="btn-nudge-google" id="nudgeGoogleSignInBtn" type="button">
                            <svg class="google-icon" viewBox="0 0 24 24" width="20" height="20">
                                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                                <path fill="#34A853" d="M12 24c3.3 0 6.08-1.09 8.1-2.96l-3.88-3.05c-1.08.72-2.45 1.16-4.22 1.16-3.24 0-5.98-2.18-6.96-5.11H1.05v3.14C3.06 21.2 7.22 24 12 24z"/>
                                <path fill="#FBBC05" d="M5.04 14.04c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.32H1.05C.38 7.66 0 9.16 0 10.75s.38 3.09 1.05 4.43l3.99-3.14z"/>
                                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.22 0 3.06 2.8 1.05 6.82l3.99 3.14c.98-2.93 3.72-5.21 6.96-5.21z"/>
                            </svg>
                            <span>Continue with Google (Instant Free Access)</span>
                        </button>
                        <button class="nudge-dismiss-link" id="nudgeDismissLink" type="button">Continue Browsing First</button>
                    </div>
                `;
                document.body.appendChild(modal);

                const dismiss = () => {
                    if (modal && modal.parentNode) modal.parentNode.removeChild(modal);
                };

                const closeBtn = document.getElementById('nudgeCloseBtn');
                const dismissLink = document.getElementById('nudgeDismissLink');
                const signBtn = document.getElementById('nudgeGoogleSignInBtn');

                if (closeBtn) closeBtn.addEventListener('click', dismiss);
                if (dismissLink) dismissLink.addEventListener('click', dismiss);
                if (signBtn && onSignIn) {
                    signBtn.addEventListener('click', () => {
                        dismiss();
                        onSignIn();
                    });
                }
            };

            // Inactivity trigger on homepage after 24 seconds
            if (isHomepage) {
                setTimeout(showNudgeModal, 24000);

                // Desktop exit-intent trigger
                const handleMouseLeave = (e) => {
                    if (e.clientY <= 5) {
                        document.removeEventListener('mouseleave', handleMouseLeave);
                        showNudgeModal();
                    }
                };
                setTimeout(() => {
                    document.addEventListener('mouseleave', handleMouseLeave);
                }, 6000);
            }
        };

        onAuthStateChanged(auth, (user) => {
            if (user) {
                const firstName = (user.displayName || user.email || 'User').split(' ')[0];
                const photo = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email || 'U')}&background=059669&color=fff`;

                // Clean up guest widgets immediately
                const heroGuestCTA = document.getElementById('heroGuestCTA');
                if (heroGuestCTA) heroGuestCTA.style.display = 'none';
                const floatingBar = document.getElementById('floatingGuestBar');
                if (floatingBar) floatingBar.remove();
                const nudgeModal = document.getElementById('guestNudgeModal');
                if (nudgeModal) nudgeModal.remove();

                localStorage.setItem('rsbk_auth_cached', 'true');
                localStorage.setItem('rsbk_user_name', firstName);
                localStorage.setItem('rsbk_user_avatar', photo);
                localStorage.setItem('rsbk_user_email', user.email || '');

                document.documentElement.classList.add('auth-verified');
                document.documentElement.classList.remove('auth-unverified');
                document.body.classList.add('auth-verified');
                document.body.classList.remove('auth-unverified');

                if (signInBtn) signInBtn.style.display = 'none';
                if (userProfileArea) userProfileArea.style.display = 'inline-flex';
                if (userAvatar) userAvatar.src = photo;
                if (userName) userName.textContent = firstName;

                // Evaluate 30-Day Free Trial & Wallet Status
                const accessInfo = evaluateUserAccess(user);

                // Update navbar tier pill
                if (navTierPillSlot) {
                    navTierPillSlot.innerHTML = buildUserTierPill(accessInfo.status, accessInfo.trialDaysRemaining, accessInfo.balance);
                }

                // Render or dismiss Paywall
                renderPaywall(accessInfo, handleGoogleSignIn);

                // Check Admin Access
                const userEmail = (user.email || '').toLowerCase().trim();
                const isAdmin = checkIsAdmin(userEmail);
                if (isAdmin) {
                    localStorage.setItem('rsbk_is_admin', 'true');
                    document.documentElement.classList.add('admin-authorized');
                } else {
                    localStorage.removeItem('rsbk_is_admin');
                    document.documentElement.classList.remove('admin-authorized');
                }
                renderRightVerticalMenubar(isAdmin);

                // Update / Register Member into rsbk_users_registry
                try {
                    let registry = JSON.parse(localStorage.getItem('rsbk_users_registry') || '[]');
                    let existingUser = registry.find(u => u.uid === user.uid || (u.email && u.email.toLowerCase() === userEmail));
                    const now = Date.now();
                    if (existingUser) {
                        existingUser.displayName = user.displayName || existingUser.displayName;
                        existingUser.email = user.email || existingUser.email;
                        existingUser.photoURL = photo || existingUser.photoURL;
                        existingUser.balance = accessInfo.balance;
                        existingUser.trialStartDate = accessInfo.trialStartDate;
                        existingUser.lastActive = now;
                    } else {
                        registry.push({
                            uid: user.uid,
                            displayName: user.displayName || 'RSBK Member',
                            email: user.email || '',
                            photoURL: photo,
                            role: isAdmin ? 'Platform Administrator' : (accessInfo.isVip || checkIsUnlimitedVip(userEmail) ? 'VIP Member (Unlimited Access)' : 'Registered Member'),
                            createdAt: now,
                            trialStartDate: accessInfo.trialStartDate || now,
                            balance: accessInfo.balance,
                            isVip: Boolean(isAdmin || accessInfo.isVip || checkIsUnlimitedVip(userEmail)),
                            lastActive: now
                        });

                        // Dispatch Automated Welcome Email (30-Day Free Trial Activated)
                        if (user.email && window.RSBK && window.RSBK.EmailService) {
                            window.RSBK.EmailService.sendNotification('welcome', {
                                recipientName: user.displayName || firstName,
                                recipientEmail: user.email,
                                details: {
                                    expiryDate: 'in 30 Days'
                                }
                            });
                        }
                    }
                    localStorage.setItem('rsbk_users_registry', JSON.stringify(registry));

                    // Realtime Database Cloud Sync for Global User Registry
                    if (db && ref && update && user && user.uid) {
                        try {
                            const userCloudData = {
                                uid: user.uid,
                                displayName: user.displayName || (existingUser ? existingUser.displayName : 'RSBK Member'),
                                email: user.email || '',
                                photoURL: photo || (existingUser ? existingUser.photoURL : ''),
                                role: isAdmin ? 'Platform Administrator' : (accessInfo.isVip || checkIsUnlimitedVip(userEmail) ? 'VIP Member (Unlimited Access)' : 'Registered Member'),
                                lastActive: now,
                                trialStartDate: accessInfo.trialStartDate || now,
                                balance: Number(accessInfo.balance) || 0,
                                isVip: Boolean(isAdmin || accessInfo.isVip || checkIsUnlimitedVip(userEmail)),
                                source: 'google'
                            };
                            if (!existingUser) {
                                userCloudData.createdAt = now;
                            }
                            update(ref(db, 'users/' + user.uid), userCloudData);
                        } catch (cloudErr) {
                            console.warn('Realtime database user sync warning:', cloudErr);
                        }
                    }

                    // Low Balance Alert Check (suppressed for VIP unlimited users)
                    const isLowBalance = !accessInfo.isVip && (
                        (accessInfo.status === 'trial' && accessInfo.trialDaysRemaining <= 3 && accessInfo.trialDaysRemaining > 0) ||
                        (accessInfo.status === 'paid' && accessInfo.balance <= 3 && accessInfo.balance > 0)
                    );
                    const alertKey = 'rsbk_low_bal_alert_' + user.uid;
                    const lastAlert = parseInt(localStorage.getItem(alertKey) || '0', 10);
                    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

                    if (isLowBalance && (now - lastAlert > ONE_WEEK_MS) && user.email && window.RSBK && window.RSBK.EmailService) {
                        localStorage.setItem(alertKey, now.toString());
                        const daysLeft = accessInfo.status === 'trial' ? accessInfo.trialDaysRemaining : Math.floor(accessInfo.balance);
                        const expDate = accessInfo.status === 'trial' 
                            ? new Date(now + daysLeft * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                            : new Date(now + daysLeft * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

                        window.RSBK.EmailService.sendNotification('low_balance', {
                            recipientName: user.displayName || firstName,
                            recipientEmail: user.email,
                            details: {
                                daysRemaining: daysLeft,
                                currentBalance: accessInfo.balance.toFixed(2),
                                expiryDate: expDate
                            }
                        });
                    }
                } catch (e) {
                    console.error('Error synchronizing user registry:', e);
                }

                // Check Doctor / Faculty Verification Status in Realtime Database
                try {
                    const docVerifRef = ref(db, 'doctor_verifications/' + user.uid);
                    onValue(docVerifRef, (snapshot) => {
                        const val = snapshot.val();
                        if (val) {
                            if (val.status === 'approved') {
                                localStorage.setItem('rsbk_doctor_verified', 'true');
                                localStorage.setItem('rsbk_verification_status', 'approved');
                            } else if (val.status === 'pending') {
                                localStorage.setItem('rsbk_doctor_verified', 'false');
                                localStorage.setItem('rsbk_verification_status', 'pending');
                            } else if (val.status === 'rejected') {
                                localStorage.setItem('rsbk_doctor_verified', 'false');
                                localStorage.setItem('rsbk_verification_status', 'rejected');
                            }
                            window.dispatchEvent(new CustomEvent('rsbk-verification-status-updated', { detail: val }));
                        }
                    });
                } catch (dvErr) {
                    console.log('Doctor verification RTDB sync:', dvErr);
                }

                // Realtime Sync for VIP Unlimited Lifetime Access from RTDB
                try {
                    const userLiveRef = ref(db, 'users/' + user.uid);
                    onValue(userLiveRef, (uSnap) => {
                        const uVal = uSnap.val();
                        if (uVal && (uVal.isVip || uVal.unlimitedAccess)) {
                            localStorage.setItem('rsbk_is_vip', 'true');
                            localStorage.setItem('rsbk_access_valid', 'true');
                            localStorage.setItem('rsbk_access_type', 'vip');
                            localStorage.setItem('rsbk_trial_days_left', '9999');
                            localStorage.setItem('rsbk_wallet_balance', '9999');

                            const walletKey = `rsbk_wallet_${user.uid}`;
                            try {
                                let w = { balance: 9999, isVip: true, transactions: [] };
                                const raw = localStorage.getItem(walletKey);
                                if (raw) w = JSON.parse(raw);
                                w.isVip = true;
                                w.balance = Math.max(Number(w.balance) || 0, 9999);
                                localStorage.setItem(walletKey, JSON.stringify(w));
                            } catch (e) {}

                            document.documentElement.classList.add('access-granted');
                            document.body.classList.add('access-granted');

                            if (navTierPillSlot) {
                                navTierPillSlot.innerHTML = buildUserTierPill('vip', 9999, 9999);
                            }
                            const paywall = document.getElementById('rsbkPaywallOverlay');
                            if (paywall) paywall.style.display = 'none';
                        }
                    });
                } catch (vipErr) {
                    console.log('User VIP live RTDB sync:', vipErr);
                }

                // Broadcast authentication and access detail
                window.dispatchEvent(new CustomEvent('rsbk-user-authenticated', { detail: { ...user, accessInfo } }));
            } else {
                localStorage.removeItem('rsbk_auth_cached');
                localStorage.removeItem('rsbk_user_name');
                localStorage.removeItem('rsbk_user_avatar');
                localStorage.removeItem('rsbk_user_email');
                localStorage.removeItem('rsbk_user_uid');
                localStorage.removeItem('rsbk_access_valid');
                localStorage.removeItem('rsbk_access_type');
                localStorage.removeItem('rsbk_is_admin');
                localStorage.removeItem('rsbk_doctor_verified');
                localStorage.removeItem('rsbk_verification_status');

                document.documentElement.classList.remove('auth-verified', 'access-granted', 'admin-authorized');
                document.documentElement.classList.add('auth-unverified');
                document.body.classList.remove('auth-verified', 'access-granted');
                document.body.classList.add('auth-unverified');

                renderRightVerticalMenubar(false);

                if (signInBtn) signInBtn.style.display = 'inline-flex';
                if (userProfileArea) userProfileArea.style.display = 'none';
                if (navTierPillSlot) navTierPillSlot.innerHTML = '';

                const accessInfo = evaluateUserAccess(null);
                renderPaywall(accessInfo, handleGoogleSignIn);

                window.dispatchEvent(new CustomEvent('rsbk-user-authenticated', { detail: null }));

                // Initialize high-converting guest engagement tools
                initGoogleOneTap(auth);
                initFloatingGuestBar(handleGoogleSignIn);
                initGuestNudge(handleGoogleSignIn);
            }
        });

        if (signOutBtn) {
            signOutBtn.addEventListener('click', async () => {
                try {
                    localStorage.removeItem('rsbk_auth_cached');
                    localStorage.removeItem('rsbk_user_name');
                    localStorage.removeItem('rsbk_user_avatar');
                    localStorage.removeItem('rsbk_user_email');
                    localStorage.removeItem('rsbk_user_uid');
                    localStorage.removeItem('rsbk_access_valid');
                    localStorage.removeItem('rsbk_access_type');
                    localStorage.removeItem('rsbk_is_admin');
                    localStorage.removeItem('rsbk_doctor_verified');
                    localStorage.removeItem('rsbk_verification_status');
                    document.documentElement.classList.remove('auth-verified', 'access-granted', 'admin-authorized');
                    document.documentElement.classList.add('auth-unverified');
                    document.body.classList.remove('auth-verified', 'access-granted');
                    document.body.classList.add('auth-unverified');
                    renderRightVerticalMenubar(false);
                    await signOut(auth);
                    window.location.href = 'index.html';
                } catch (err) {
                    console.error('Sign-Out error:', err);
                }
            });
        }
    } catch (e) {
        console.error('Failed to load Firebase Auth:', e);
    }

    // =========================================================================
    // Homepage Showcase Carousel Auto-Scroll Engine & Controls (Infinite Loop)
    // =========================================================================
    const initShowcaseCarousel = () => {
        const viewport = document.getElementById('showcaseCarouselViewport');
        const track = document.getElementById('showcaseCarouselTrack');
        const prevBtn = document.getElementById('showcasePrevBtn');
        const nextBtn = document.getElementById('showcaseNextBtn');
        const playPauseBtn = document.getElementById('showcasePlayPauseBtn');
        const playPauseIcon = document.getElementById('showcasePlayPauseIcon');
        const playPauseText = document.getElementById('showcasePlayPauseText');

        if (!viewport || !track) return;

        // Clone the original 5 cards twice to create Set 1, Set 2, and Set 3
        // This guarantees continuous cards even across ultra-wide / 4K displays
        const originalCards = Array.from(track.children);
        const originalCount = originalCards.length;

        // Set 2
        originalCards.forEach(card => {
            const clone = card.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            track.appendChild(clone);
        });

        // Set 3
        originalCards.forEach(card => {
            const clone = card.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            track.appendChild(clone);
        });

        let isPlaying = true;
        let isHovered = false;
        let isManualScrolling = false;
        let manualTimeout = null;
        let lastTimestamp = performance.now();
        const SCROLL_SPEED_PX_PER_SEC = 80; // Noticeable, smooth speed (~80px/sec) across all monitor refresh rates

        // Measure cycle width (the exact distance from card 0 to card [originalCount])
        const getCycleWidth = () => {
            if (track.children.length > originalCount && track.children[originalCount]) {
                const diff = track.children[originalCount].offsetLeft - track.children[0].offsetLeft;
                if (diff > 100) return diff;
            }
            return originalCount * 378;
        };

        const animateLoop = (currentTimestamp) => {
            const dt = Math.min((currentTimestamp - lastTimestamp) / 1000, 0.1);
            lastTimestamp = currentTimestamp;

            if (isPlaying && !isHovered && !isManualScrolling) {
                viewport.scrollLeft += SCROLL_SPEED_PX_PER_SEC * dt;
                
                const cycleWidth = getCycleWidth();
                if (cycleWidth > 0 && viewport.scrollLeft >= cycleWidth) {
                    viewport.scrollLeft -= cycleWidth;
                }
            }

            requestAnimationFrame(animateLoop);
        };

        requestAnimationFrame(animateLoop);

        // Pause on mouse hover / touch interaction
        viewport.addEventListener('mouseenter', () => { isHovered = true; });
        viewport.addEventListener('mouseleave', () => { isHovered = false; });
        viewport.addEventListener('touchstart', () => { isHovered = true; }, { passive: true });
        viewport.addEventListener('touchend', () => { 
            setTimeout(() => { isHovered = false; }, 800); 
        }, { passive: true });

        // Play / Pause Toggle
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                isPlaying = !isPlaying;
                if (isPlaying) {
                    if (playPauseIcon) playPauseIcon.setAttribute('name', 'pause-outline');
                    if (playPauseText) playPauseText.textContent = 'Pause';
                    playPauseBtn.classList.remove('paused');
                } else {
                    if (playPauseIcon) playPauseIcon.setAttribute('name', 'play-outline');
                    if (playPauseText) playPauseText.textContent = 'Play';
                    playPauseBtn.classList.add('paused');
                }
            });
        }

        // Left / Right Manual Movement Buttons (scroll 1 card step = 378px)
        const getCardStep = () => {
            if (track.children.length > 1) {
                const step = track.children[1].offsetLeft - track.children[0].offsetLeft;
                if (step > 100) return step;
            }
            return 378;
        };

        const handleManualNavigation = (direction) => {
            isManualScrolling = true;
            clearTimeout(manualTimeout);

            const cycleWidth = getCycleWidth();
            const step = getCardStep();

            if (direction === 'prev') {
                if (viewport.scrollLeft < step) {
                    viewport.scrollLeft += cycleWidth;
                }
                viewport.scrollBy({ left: -step, behavior: 'smooth' });
            } else {
                if (viewport.scrollLeft >= cycleWidth) {
                    viewport.scrollLeft -= cycleWidth;
                }
                viewport.scrollBy({ left: step, behavior: 'smooth' });
            }

            manualTimeout = setTimeout(() => {
                isManualScrolling = false;
                lastTimestamp = performance.now();
            }, 600);
        };

        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                handleManualNavigation('prev');
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                handleManualNavigation('next');
            });
        }
    };

    initShowcaseCarousel();

});
