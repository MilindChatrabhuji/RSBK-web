/**
 * RSBK Online — Features Module (features.js)
 * Implements:
 * 1. Dark Mode Toggle with persistence
 * 2. Global Quick Search (Ctrl + K / Spotlight Search)
 * 3. Progressive Web App (PWA) Service Worker & Install Prompt
 * 4. Verified Doctor / Faculty Badge Application, Razorpay (₹100), and Admin Queue
 */

(function () {
    // Immediate Theme Initialization (prevents flash of white)
    const savedTheme = localStorage.getItem('rsbk_theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    // Auto-load Email Notification Service if missing
    if (!document.querySelector('script[src*="email-service.js"]')) {
        const es = document.createElement('script');
        es.src = 'email-service.js?v=5.0';
        document.head.appendChild(es);
    }

    // Auto-inject PWA Manifest & Icons if missing in Head
    if (!document.querySelector('link[rel="manifest"]')) {
        const man = document.createElement('link');
        man.rel = 'manifest';
        man.href = '/manifest.json';
        document.head.appendChild(man);
    }
    if (!document.querySelector('link[rel="icon"]')) {
        const fav = document.createElement('link');
        fav.rel = 'icon';
        fav.type = 'image/png';
        fav.href = '/favicon.png';
        document.head.appendChild(fav);
    }

    document.addEventListener('DOMContentLoaded', () => {
        initThemeToggle();
        initGlobalSearch();
        initPWA();
        initDoctorVerification();
    });

    // =========================================================================
    // 1. Dark Mode Toggle
    // =========================================================================
    function initThemeToggle() {
        const navActions = document.querySelector('.nav-actions');
        if (!navActions) return;

        // Create or get theme toggle button
        let themeBtn = document.getElementById('navThemeToggleBtn');
        if (!themeBtn) {
            themeBtn = document.createElement('button');
            themeBtn.id = 'navThemeToggleBtn';
            themeBtn.className = 'nav-action-btn theme-toggle-btn';
            themeBtn.type = 'button';
            themeBtn.setAttribute('title', 'Toggle Dark / Light Mode (Click or Press Alt+T)');
            themeBtn.setAttribute('aria-label', 'Toggle Dark or Light Mode');

            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            themeBtn.innerHTML = `<ion-icon name="${currentTheme === 'dark' ? 'sunny-outline' : 'moon-outline'}" id="themeToggleIcon"></ion-icon>`;

            // Insert before the auth widget or mobile toggle
            const authWidget = document.getElementById('authWidget');
            if (authWidget) {
                navActions.insertBefore(themeBtn, authWidget);
            } else {
                navActions.prepend(themeBtn);
            }
        }

        const updateThemeUI = (theme) => {
            const icon = document.getElementById('themeToggleIcon');
            if (icon) {
                icon.setAttribute('name', theme === 'dark' ? 'sunny-outline' : 'moon-outline');
            }
            // Update meta theme-color for mobile browsers
            let metaTheme = document.querySelector('meta[name="theme-color"]');
            if (!metaTheme) {
                metaTheme = document.createElement('meta');
                metaTheme.name = 'theme-color';
                document.head.appendChild(metaTheme);
            }
            metaTheme.content = theme === 'dark' ? '#0b1120' : '#059669';
        };

        const toggleTheme = () => {
            const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('rsbk_theme', next);
            updateThemeUI(next);
        };

        themeBtn.addEventListener('click', toggleTheme);

        // Shortcut: Alt + T
        document.addEventListener('keydown', (e) => {
            if (e.altKey && (e.key === 't' || e.key === 'T')) {
                toggleTheme();
            }
        });

        updateThemeUI(document.documentElement.getAttribute('data-theme') || 'light');
    }

    // =========================================================================
    // 2. Global Quick Search (Ctrl + K)
    // =========================================================================
    const SEARCH_DATABASE = [
        // Curriculum Handbooks
        { title: "Volume 1: Bloom's Taxonomy — AyUG-RB", category: "handbooks", url: "teachers-ug.html", desc: "Cognitive domain hierarchy L1 to L6 for Second Professional BAMS (36 Units · 268 Objectives)." },
        { title: "Volume 2: Miller's Pyramid — AyUG-RB", category: "handbooks", url: "teachers-ug.html", desc: "Clinical & laboratory competency assessment framework for Second Professional BAMS." },
        { title: "Volume 3: Bloom's Taxonomy — AYPG-AB-RB", category: "handbooks", url: "teachers-pg-sem2.html", desc: "Applied Basics of Rasa Shastra & Bhaishajya Kalpana (MD/MS Sem II · 8 Modules · 42 Units)." },
        { title: "Volume 4: Miller's Pyramid — AYPG-AB-RB", category: "handbooks", url: "teachers-pg-sem2.html", desc: "Competency blueprints for postgraduate scholars in practical pharmaceutics." },
        { title: "Volume 5: Bloom's Taxonomy — AYPG-RB", category: "handbooks", url: "teachers-pg-sem3-6.html", desc: "Specialty volumes across Semesters III–VI covering Papers I to IV (32 Modules · 577 Objectives)." },
        { title: "Volume 6: Miller's Pyramid — AYPG-RB", category: "handbooks", url: "teachers-pg-sem3-6.html", desc: "Instrumental methods, research protocols, XRD, SEM-EDX, and OECD safety studies." },
        
        // Student Books
        { title: "PG Sem II Textbook — Applied Basics of RSBK", category: "students", url: "students.html", desc: "Module-wise & Unit-wise study notes for MD/MS Ayurveda Semester II." },
        { title: "ABQ Question Bank — Applied Basics of RSBK", category: "students", url: "students.html", desc: "53 Case-based ABQs, 10 Analytical LAQs & 1 fully solved university question paper." },
        { title: "Companion Workbook — Applied Basics of RSBK", category: "students", url: "students.html", desc: "Structured self-assessment worksheets, laboratory protocols, and viva prep." },
        
        // Ayurvedic Formulations & Core Technical Terms
        { title: "Parada (Mercury) & Ashtasamskara", category: "terms", url: "books.html", desc: "Classical purification, 8 primary samskaras, Hingula-sambhav Parada, and mercurial bonds." },
        { title: "Gandhaka Shodhana & Kajjali Kalpana", category: "terms", url: "books.html", desc: "Sulfur purification techniques, black sulfide of mercury (Kajjali), and Bandha classification." },
        { title: "Kupipakwa Rasayana (Rasasindura, Samirapannaga)", category: "terms", url: "books.html", desc: "Valuka Yantra thermal grading: Mridu, Madhyama, and Tivragni temperature curves." },
        { title: "Abhraka Bhasma & Dhanyabhraka Shodhana", category: "terms", url: "books.html", desc: "Nischandrika test, Varitaratva, Rekhapurnatva, and multi-puta calcination cycles." },
        { title: "Swarna Bhasma & Tamra Bhasma Standardization", category: "terms", url: "books.html", desc: "Apunarbhava, Niruttha, modern XRD phase identification, and ICP-MS quantification." },
        { title: "Puta System & Temperature Gradients", category: "terms", url: "books.html", desc: "Mahaputa, Gajaputa, Varahaputa, Kukkutaputa, Kapotaputa thermal measurements." },
        { title: "Bhasma Pariksha (Classical & Instrumental Quality Control)", category: "terms", url: "books.html", desc: "Varitara, Rekhapurna, Unama, Apunarbhava, Niruttha, and modern spectroscopy." },
        { title: "Sneha Kalpana (Ghrita & Taila Paka Lakshana)", category: "terms", url: "books.html", desc: "Mridu, Madhyama, Khara paka criteria, Fenia-shanti, Phenodgama, and rancidity indices." },
        { title: "Asava & Arishta Sandhana Kalpana", category: "terms", url: "books.html", desc: "Biomedical fermentation, self-generated alcohol, Dhataki pushpa, and alcohol quantification." },
        
        // Platform Pages & Portals
        { title: "Academic Discussion Forum", category: "pages", url: "forum.html", desc: "Ask questions, share clinical cases, upload lab attachments, and discuss classical shlokas." },
        { title: "Membership & Wallet (Fair ₹1/Day Access)", category: "pages", url: "membership.html", desc: "Transparent prepaid wallet, Razorpay recharge, daily 5 AM deductions, and 30-day trial." },
        { title: "User Profile & Voluntary Academic Focus", category: "pages", url: "profile.html", desc: "Manage academic designation, university affiliation, and Doctor Verification badge." },
        { title: "Books Archive & Treatise Showcase", category: "pages", url: "books.html", desc: "Comprehensive catalog of authored books and research handbooks by Dr. Milind Chatrabhuji." },
        { title: "Undergraduate (UG) Handbooks Portal", category: "pages", url: "teachers-ug.html", desc: "Second Professional BAMS pedagogical handbooks mapped to NCISM curricula." },
        { title: "Postgraduate (PG) Handbooks Portal", category: "pages", url: "teachers-pg.html", desc: "MD/MS Ayurveda curriculum taxonomy handbooks for faculty and researchers." }
    ];

    function initGlobalSearch() {
        const navActions = document.querySelector('.nav-actions');
        if (!navActions) return;

        // Mount Search Trigger Button in Nav
        let searchBtn = document.getElementById('navGlobalSearchBtn');
        if (!searchBtn) {
            searchBtn = document.createElement('button');
            searchBtn.id = 'navGlobalSearchBtn';
            searchBtn.className = 'nav-action-btn search-trigger-btn';
            searchBtn.type = 'button';
            searchBtn.setAttribute('title', 'Quick Search (Ctrl + K)');
            searchBtn.setAttribute('aria-label', 'Open Global Quick Search');
            searchBtn.innerHTML = `
                <ion-icon name="search-outline"></ion-icon>
                <span class="search-trigger-label">Search</span>
                <span class="search-key-badge">Ctrl K</span>
            `;

            const authWidget = document.getElementById('authWidget');
            if (authWidget) {
                navActions.insertBefore(searchBtn, authWidget);
            } else {
                navActions.prepend(searchBtn);
            }
        }

        // Mount Search Modal in DOM
        let searchModal = document.getElementById('globalSearchModal');
        if (!searchModal) {
            searchModal = document.createElement('div');
            searchModal.id = 'globalSearchModal';
            searchModal.className = 'global-search-backdrop';
            searchModal.setAttribute('role', 'dialog');
            searchModal.setAttribute('aria-modal', 'true');
            searchModal.setAttribute('aria-label', 'Global Quick Search');
            searchModal.innerHTML = `
                <div class="global-search-window">
                    <div class="global-search-header">
                        <ion-icon name="search-outline"></ion-icon>
                        <input type="text" id="globalSearchInput" class="global-search-input" placeholder="Search books, terms (Bhasma, Shodhana), topics, or pages..." autocomplete="off">
                        <button type="button" class="global-search-close-btn" id="btnCloseGlobalSearch" title="Close (Esc)">ESC</button>
                    </div>
                    <div class="search-category-bar">
                        <button type="button" class="search-cat-pill active" data-cat="all">All</button>
                        <button type="button" class="search-cat-pill" data-cat="handbooks">Handbooks</button>
                        <button type="button" class="search-cat-pill" data-cat="students">Student Books</button>
                        <button type="button" class="search-cat-pill" data-cat="terms">Drugs &amp; Terms</button>
                        <button type="button" class="search-cat-pill" data-cat="pages">Pages</button>
                    </div>
                    <div class="global-search-results" id="globalSearchResults">
                        <!-- Populated dynamically -->
                    </div>
                    <div class="global-search-footer">
                        <span>Showing search results across RSBK Online</span>
                        <div class="search-shortcuts">
                            <span class="shortcut-pill"><kbd>&uarr;</kbd><kbd>&darr;</kbd> Navigate</span>
                            <span class="shortcut-pill"><kbd>&crarr;</kbd> Open</span>
                            <span class="shortcut-pill"><kbd>ESC</kbd> Close</span>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(searchModal);
        }

        const input = document.getElementById('globalSearchInput');
        const resultsContainer = document.getElementById('globalSearchResults');
        const catPills = searchModal.querySelectorAll('.search-cat-pill');
        let activeCat = 'all';
        let selectedIndex = 0;
        let currentMatches = [];

        const openSearch = () => {
            searchModal.classList.add('open');
            input.value = '';
            activeCat = 'all';
            catPills.forEach(p => p.classList.toggle('active', p.dataset.cat === 'all'));
            performSearch('');
            setTimeout(() => input.focus(), 50);
            document.body.style.overflow = 'hidden';
        };

        const closeSearch = () => {
            searchModal.classList.remove('open');
            document.body.style.overflow = '';
        };

        searchBtn.addEventListener('click', openSearch);
        document.getElementById('btnCloseGlobalSearch').addEventListener('click', closeSearch);

        searchModal.addEventListener('click', (e) => {
            if (e.target === searchModal) closeSearch();
        });

        // Keyboard Shortcut: Ctrl + K or Cmd + K
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
                e.preventDefault();
                if (searchModal.classList.contains('open')) {
                    closeSearch();
                } else {
                    openSearch();
                }
            } else if (e.key === 'Escape' && searchModal.classList.contains('open')) {
                closeSearch();
            } else if (searchModal.classList.contains('open')) {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    selectedIndex = (selectedIndex + 1) % Math.max(1, currentMatches.length);
                    updateSelectedResult();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    selectedIndex = (selectedIndex - 1 + currentMatches.length) % Math.max(1, currentMatches.length);
                    updateSelectedResult();
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    if (currentMatches[selectedIndex]) {
                        window.location.href = currentMatches[selectedIndex].url;
                    }
                }
            }
        });

        // Category Filter Clicks
        catPills.forEach(pill => {
            pill.addEventListener('click', () => {
                catPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                activeCat = pill.dataset.cat;
                performSearch(input.value);
            });
        });

        // Live input search
        input.addEventListener('input', (e) => {
            performSearch(e.target.value);
        });

        function performSearch(query) {
            const q = query.trim().toLowerCase();
            currentMatches = SEARCH_DATABASE.filter(item => {
                const matchesCat = activeCat === 'all' || item.category === activeCat;
                if (!matchesCat) return false;
                if (!q) return true;
                return item.title.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
            });

            selectedIndex = 0;
            renderSearchResults();
        }

        function renderSearchResults() {
            if (currentMatches.length === 0) {
                resultsContainer.innerHTML = `
                    <div class="search-empty-state">
                        <ion-icon name="search-outline"></ion-icon>
                        <p>No results found matching your query. Try searching for <strong>Bhasma</strong>, <strong>Bloom's</strong>, <strong>Handbook</strong>, or <strong>Forum</strong>.</p>
                    </div>
                `;
                return;
            }

            const getIcon = (cat) => {
                if (cat === 'handbooks') return 'ribbon-outline';
                if (cat === 'students') return 'school-outline';
                if (cat === 'terms') return 'flask-outline';
                return 'browsers-outline';
            };

            const getCatLabel = (cat) => {
                if (cat === 'handbooks') return 'Teacher Handbook';
                if (cat === 'students') return 'Student Curriculum';
                if (cat === 'terms') return 'Drug & Technical Term';
                return 'Platform Portal';
            };

            resultsContainer.innerHTML = currentMatches.map((item, idx) => `
                <a href="${item.url}" class="search-result-item ${idx === selectedIndex ? 'selected' : ''}" data-index="${idx}">
                    <div class="search-item-icon">
                        <ion-icon name="${getIcon(item.category)}"></ion-icon>
                    </div>
                    <div class="search-item-info">
                        <div class="search-item-meta">${getCatLabel(item.category)}</div>
                        <div class="search-item-title">${item.title}</div>
                        <div class="search-item-desc">${item.desc}</div>
                    </div>
                    <ion-icon name="chevron-forward-outline" style="font-size: 1.1rem; color: var(--text-muted); opacity: 0.6; align-self: center;"></ion-icon>
                </a>
            `).join('');

            resultsContainer.querySelectorAll('.search-result-item').forEach(el => {
                el.addEventListener('mouseenter', () => {
                    selectedIndex = parseInt(el.dataset.index, 10);
                    updateSelectedResult();
                });
            });
        }

        function updateSelectedResult() {
            const items = resultsContainer.querySelectorAll('.search-result-item');
            items.forEach((item, idx) => {
                item.classList.toggle('selected', idx === selectedIndex);
                if (idx === selectedIndex) {
                    item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                }
            });
        }
    }

    // =========================================================================
    // 3. Progressive Web App (PWA) Support
    // =========================================================================
    function initPWA() {
        // Register Service Worker
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then((reg) => {
                        console.log('RSBK PWA ServiceWorker registered with scope:', reg.scope);
                    })
                    .catch((err) => {
                        console.warn('RSBK PWA ServiceWorker registration failed:', err);
                    });
            });
        }

        // Install Prompt Capture
        let deferredPrompt = null;
        const navActions = document.querySelector('.nav-actions');

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;

            if (!navActions) return;
            let pwaBtn = document.getElementById('navPwaInstallBtn');
            if (!pwaBtn) {
                pwaBtn = document.createElement('button');
                pwaBtn.id = 'navPwaInstallBtn';
                pwaBtn.className = 'nav-action-btn pwa-install-btn';
                pwaBtn.type = 'button';
                pwaBtn.setAttribute('title', 'Install RSBK Online App onto your Device');
                pwaBtn.innerHTML = `
                    <ion-icon name="download-outline"></ion-icon>
                    <span class="pwa-btn-text">Install App</span>
                `;

                const authWidget = document.getElementById('authWidget');
                if (authWidget) {
                    navActions.insertBefore(pwaBtn, authWidget);
                } else {
                    navActions.prepend(pwaBtn);
                }

                pwaBtn.addEventListener('click', async () => {
                    if (deferredPrompt) {
                        deferredPrompt.prompt();
                        const { outcome } = await deferredPrompt.userChoice;
                        console.log('User PWA install prompt response:', outcome);
                        deferredPrompt = null;
                        pwaBtn.style.display = 'none';
                    }
                });
            } else {
                pwaBtn.style.display = 'inline-flex';
            }
        });

        window.addEventListener('appinstalled', () => {
            console.log('RSBK Online PWA was installed successfully!');
            const pwaBtn = document.getElementById('navPwaInstallBtn');
            if (pwaBtn) pwaBtn.style.display = 'none';
        });
    }

    // =========================================================================
    // 4. Verified Doctor / Faculty Badge System
    // =========================================================================
    function initDoctorVerification() {
        const isProfilePage = window.location.pathname.includes('profile');
        const isAdminPage = window.location.pathname.includes('admin');

        // Check if user is verified doctor in localStorage cache
        const isDoctorVerified = localStorage.getItem('rsbk_doctor_verified') === 'true';
        const verificationStatus = localStorage.getItem('rsbk_verification_status') || 'none';

        // Render Doctor Badge on Profile Page if relevant
        if (isProfilePage) {
            setupProfileVerificationUI(isDoctorVerified, verificationStatus);
        }

        // Render Verification Management on Admin Page if relevant
        if (isAdminPage) {
            setupAdminVerificationQueue();
        }
    }

    function setupProfileVerificationUI(isDoctorVerified, verificationStatus) {
        const badgeRow = document.querySelector('.profile-badge-row');
        if (badgeRow && isDoctorVerified) {
            let docBadge = document.getElementById('doctorVerifiedBadge');
            if (!docBadge) {
                docBadge = document.createElement('span');
                docBadge.id = 'doctorVerifiedBadge';
                docBadge.className = 'badge-doctor-verified';
                docBadge.innerHTML = `<ion-icon name="checkmark-done-circle"></ion-icon> Verified Doctor / Faculty`;
                badgeRow.appendChild(docBadge);
            }
        }

        // Mount Application Card in Profile if not verified
        const formNotice = document.querySelector('.profile-notice');
        if (formNotice && !document.getElementById('doctorVerificationCard')) {
            const card = document.createElement('div');
            card.id = 'doctorVerificationCard';
            card.className = 'doctor-verification-card';

            if (isDoctorVerified) {
                card.innerHTML = `
                    <div class="dvc-content">
                        <div class="dvc-icon" style="background: linear-gradient(135deg, #059669 0%, #0d9488 100%);">
                            <ion-icon name="shield-checkmark"></ion-icon>
                        </div>
                        <div class="dvc-text">
                            <h3>Verified Doctor / Faculty Status Active</h3>
                            <p>Your degree credentials have been verified by Dr. Milind Chatrabhuji. The <strong>Verified Doctor</strong> badge is displayed on your profile and across your academic forum discussions.</p>
                        </div>
                    </div>
                    <span class="badge-doctor-verified" style="font-size: 0.95rem; padding: 0.6rem 1.25rem;">
                        <ion-icon name="checkmark-done-circle"></ion-icon> Active Credentials
                    </span>
                `;
            } else if (verificationStatus === 'pending') {
                card.innerHTML = `
                    <div class="dvc-content">
                        <div class="dvc-icon" style="background: linear-gradient(135deg, #d97706 0%, #b45309 100%);">
                            <ion-icon name="hourglass-outline"></ion-icon>
                        </div>
                        <div class="dvc-text">
                            <h3>Verification Application Under Review</h3>
                            <p>Your degree certificate and ₹100 verification fee have been received. Dr. Milind Chatrabhuji will review your certificate credentials within 24–48 hours to grant your badge.</p>
                        </div>
                    </div>
                    <span class="badge-verification-pending" style="font-size: 0.92rem; padding: 0.6rem 1.25rem;">
                        <ion-icon name="time-outline"></ion-icon> Pending Admin Approval
                    </span>
                `;
            } else {
                card.innerHTML = `
                    <div class="dvc-content">
                        <div class="dvc-icon">
                            <ion-icon name="school-outline"></ion-icon>
                        </div>
                        <div class="dvc-text">
                            <h3>Apply for Verified Doctor / Faculty Badge</h3>
                            <p>Upload your BAMS, MD/MS, or PhD degree certificate to get an official <strong>Verified Doctor / Faculty</strong> checkmark on your profile and forum contributions. (Requires ₹100 one-time verification fee &amp; manual admin approval).</p>
                        </div>
                    </div>
                    <button type="button" class="btn-apply-doctor-badge" id="btnOpenDoctorVerificationModal">
                        <ion-icon name="shield-checkmark-outline"></ion-icon>
                        <span>Apply for Badge (₹100)</span>
                    </button>
                `;
            }

            formNotice.parentNode.insertBefore(card, formNotice.nextSibling);

            const openBtn = document.getElementById('btnOpenDoctorVerificationModal');
            if (openBtn) {
                openBtn.addEventListener('click', openVerificationModal);
            }
        }
    }

    function openVerificationModal() {
        let modal = document.getElementById('doctorVerificationModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'doctorVerificationModal';
            modal.className = 'verification-modal-overlay';
            modal.setAttribute('role', 'dialog');
            modal.innerHTML = `
                <div class="verification-modal-box">
                    <div class="vmb-header">
                        <div class="vmb-title-wrap">
                            <ion-icon name="shield-checkmark" class="vmb-icon"></ion-icon>
                            <div>
                                <h3>Apply for Doctor / Faculty Badge</h3>
                                <p style="font-size: 0.84rem; color: var(--text-muted); margin: 0;">Verified credentials for RSBK Online scholars &amp; faculty</p>
                            </div>
                        </div>
                        <button type="button" class="vmb-close-btn" id="btnCloseDocModal">&times;</button>
                    </div>

                    <div class="vmb-fee-banner">
                        <div>
                            <strong>One-Time Verification Fee:</strong>
                            <div style="font-size: 0.8rem; color: var(--text-muted);">Includes manual council certificate audit</div>
                        </div>
                        <strong>₹100</strong>
                    </div>

                    <form id="docVerificationForm" onsubmit="return false;">
                        <div class="form-group" style="margin-bottom: 1rem;">
                            <label style="display: block; font-size: 0.85rem; font-weight: 700; margin-bottom: 0.35rem;">Highest Medical Degree / Qualification *</label>
                            <input type="text" id="docDegreeInput" class="admin-form-input" placeholder="e.g. BAMS, MD (Ayu) Rasa Shastra, PhD" required style="width: 100%; padding: 0.75rem 1rem; border: 1px solid var(--card-border); border-radius: 10px;">
                        </div>

                        <div class="form-group" style="margin-bottom: 1rem;">
                            <label style="display: block; font-size: 0.85rem; font-weight: 700; margin-bottom: 0.35rem;">State / Central Registration Number *</label>
                            <input type="text" id="docRegNoInput" class="admin-form-input" placeholder="e.g. GAU-12345 or NCISM-Reg-98765" required style="width: 100%; padding: 0.75rem 1rem; border: 1px solid var(--card-border); border-radius: 10px;">
                        </div>

                        <div class="form-group" style="margin-bottom: 1rem;">
                            <label style="display: block; font-size: 0.85rem; font-weight: 700; margin-bottom: 0.35rem;">Affiliated College, University or Hospital *</label>
                            <input type="text" id="docInstInput" class="admin-form-input" placeholder="e.g. Parul Institute of Ayurved, Vadodara" required style="width: 100%; padding: 0.75rem 1rem; border: 1px solid var(--card-border); border-radius: 10px;">
                        </div>

                        <div class="form-group" style="margin-bottom: 1.5rem;">
                            <label style="display: block; font-size: 0.85rem; font-weight: 700; margin-bottom: 0.35rem;">Upload Degree Certificate or Registration Proof (PDF or Image, Max 10MB) *</label>
                            <input type="file" id="docFileInput" accept="image/*,application/pdf" required style="width: 100%; padding: 0.65rem; border: 1px dashed var(--card-border); border-radius: 10px;">
                            <div id="docFilePreview" style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.35rem;">Accepted: PDF, JPG, PNG</div>
                        </div>

                        <button type="submit" id="btnSubmitDocVerification" class="btn-proceed-pay" style="width: 100%; max-width: 100%;">
                            <ion-icon name="lock-closed"></ion-icon>
                            <span>Pay ₹100 via Razorpay &amp; Submit</span>
                            <ion-icon name="arrow-forward-outline"></ion-icon>
                        </button>
                    </form>
                </div>
            `;
            document.body.appendChild(modal);

            document.getElementById('btnCloseDocModal').addEventListener('click', () => modal.classList.remove('open'));
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.classList.remove('open');
            });

            const form = document.getElementById('docVerificationForm');
            form.addEventListener('submit', handleVerificationSubmission);
        }
        modal.classList.add('open');
    }

    async function handleVerificationSubmission(e) {
        e.preventDefault();
        const userEmail = localStorage.getItem('rsbk_user_email') || '';
        const userName = localStorage.getItem('rsbk_user_name') || 'Ayurveda Scholar';
        const uid = localStorage.getItem('rsbk_user_uid') || ('user_' + Math.random().toString(36).substring(2, 8));

        if (!userEmail) {
            alert('Please sign in with your Google account first to apply for the Verified Doctor badge.');
            return;
        }

        const degree = document.getElementById('docDegreeInput').value.trim();
        const regNo = document.getElementById('docRegNoInput').value.trim();
        const inst = document.getElementById('docInstInput').value.trim();
        const fileInput = document.getElementById('docFileInput');

        if (!degree || !regNo || !inst || !fileInput.files[0]) {
            alert('Please fill out all fields and select your certificate file.');
            return;
        }

        const file = fileInput.files[0];
        const submitBtn = document.getElementById('btnSubmitDocVerification');
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Opening Razorpay Secure Checkout (₹100)...</span>`;

        // Razorpay Checkout for ₹100
        const options = {
            key: "rzp_live_RNWzXfVlljNlDk",
            amount: 10000, // ₹100 in paise
            currency: "INR",
            name: "RSBK Online",
            description: "Doctor & Faculty Credential Verification Fee (₹100)",
            image: "/assets/icons/icon-192.png",
            prefill: {
                name: userName,
                email: userEmail
            },
            theme: {
                color: "#059669"
            },
            handler: async function (response) {
                submitBtn.innerHTML = `<span>Saving application credentials...</span>`;
                
                // Read certificate as base64 or upload
                const reader = new FileReader();
                reader.onload = async function(evt) {
                    const fileData = evt.target.result;
                    
                    const verificationRecord = {
                        uid: uid,
                        email: userEmail,
                        name: userName,
                        degree: degree,
                        regNo: regNo,
                        institution: inst,
                        fileName: file.name,
                        fileType: file.type,
                        fileData: fileData.substring(0, 150000), // Preview snapshot
                        paymentId: response.razorpay_payment_id,
                        status: 'pending',
                        submittedAt: new Date().toISOString()
                    };

                    // Save locally & to remote storage
                    let pendingList = JSON.parse(localStorage.getItem('rsbk_pending_verifications') || '[]');
                    pendingList.push(verificationRecord);
                    localStorage.setItem('rsbk_pending_verifications', JSON.stringify(pendingList));
                    localStorage.setItem('rsbk_verification_status', 'pending');

                    // If Firebase Realtime Database is accessible
                    try {
                        if (window.firebaseDb && window.firebasePush) {
                            const refPath = window.firebaseRef(window.firebaseDb, 'doctor_verifications/' + uid);
                            await window.firebaseSet(refPath, verificationRecord);
                        }
                    } catch (fbErr) {
                        console.log('Firebase verification save:', fbErr);
                    }

                    alert(`Payment of ₹100 Successful!\n\nYour application (Payment ID: ${response.razorpay_payment_id}) has been submitted for verification. Dr. Milind Chatrabhuji will review your certificate and grant your badge.`);
                    window.location.reload();
                };
                reader.readAsDataURL(file);
            },
            modal: {
                ondismiss: function () {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = `<ion-icon name="lock-closed"></ion-icon> <span>Pay ₹100 via Razorpay &amp; Submit</span>`;
                }
            }
        };

        if (window.Razorpay) {
            const rzp = new window.Razorpay(options);
            rzp.open();
        } else {
            alert('Razorpay payment gateway is loading. Please try again in 3 seconds.');
            submitBtn.disabled = false;
        }
    }

    function setupAdminVerificationQueue() {
        // Will populate verification requests table in Admin Console
        console.log('Admin Verification Queue Initialized');
    }

    // Expose helpers globally
    window.RSBK = window.RSBK || {};
    window.RSBK.toggleTheme = () => {
        const btn = document.getElementById('navThemeToggleBtn');
        if (btn) btn.click();
    };
    window.RSBK.openSearch = () => {
        const btn = document.getElementById('navGlobalSearchBtn');
        if (btn) btn.click();
    };
})();
