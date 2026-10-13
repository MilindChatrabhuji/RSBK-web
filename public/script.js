document.addEventListener('DOMContentLoaded', async () => {
    // Navbar scroll effect (Light Mode)
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 4px 20px rgba(15, 23, 42, 0.08)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.88)';
            navbar.style.boxShadow = 'none';
        }
    });

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

    // Mount Auth Widget into Navbar
    const authContainer = document.getElementById('authWidget') || document.querySelector('.auth-widget');
    if (authContainer) {
        authContainer.innerHTML = `
            <button id="googleSignInBtn" class="btn-google-signin" type="button" title="Sign in with Google">
                <svg class="google-icon" viewBox="0 0 24 24" width="18" height="18">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.3 0 6.08-1.09 8.1-2.96l-3.88-3.05c-1.08.72-2.45 1.16-4.22 1.16-3.24 0-5.98-2.18-6.96-5.11H1.05v3.14C3.06 21.2 7.22 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.04 14.04c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.32H1.05C.38 7.66 0 9.16 0 10.75s.38 3.09 1.05 4.43l3.99-3.14z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.22 0 3.06 2.8 1.05 6.82l3.99 3.14c.98-2.93 3.72-5.21 6.96-5.21z"/>
                </svg>
                <span>Sign in</span>
            </button>
            <div id="userProfileArea" class="user-profile-area" style="display: none;">
                <a href="profile.html" class="user-profile-link" title="Open My Scholar Profile">
                    <img id="userAvatar" class="user-avatar" src="" alt="User" referrerpolicy="no-referrer" />
                    <span id="userName" class="user-name"></span>
                </a>
                <a href="membership.html" id="userTierPill" class="user-tier-pill" title="Membership Plan">Scholar</a>
                <button id="signOutBtn" class="btn-signout" type="button" title="Sign out">Sign out</button>
            </div>
        `;
    }

    // Mount Auth Gate if on a protected page (any page other than homepage)
    const isProtectedPage = document.body.classList.contains('protected-page');
    let gateSignInBtn = null;

    if (isProtectedPage) {
        let authGate = document.getElementById('authGate');
        if (!authGate) {
            authGate = document.createElement('div');
            authGate.id = 'authGate';
            authGate.className = 'auth-gate';
            authGate.innerHTML = `
                <div class="auth-gate-card">
                    <div class="auth-gate-icon">
                        <ion-icon name="lock-closed-outline"></ion-icon>
                    </div>
                    <div class="badge auth-gate-badge">
                        <ion-icon name="shield-checkmark-outline" style="vertical-align: -2px; margin-right: 4px;"></ion-icon> Sign-In Required
                    </div>
                    <h2 class="auth-gate-title">Sign In with Google</h2>
                    <p class="auth-gate-desc">
                        Full access to academic textbooks, Bloom's &amp; Miller's taxonomy handbooks, ABQ question banks, and practical training proformas authored by Dr. Milind Chatrabhuji requires signing in.
                    </p>
                    <button id="gateGoogleSignInBtn" class="btn-google-gate" type="button" title="Sign in with Google">
                        <svg class="google-icon" viewBox="0 0 24 24" width="20" height="20">
                            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                            <path fill="#34A853" d="M12 24c3.3 0 6.08-1.09 8.1-2.96l-3.88-3.05c-1.08.72-2.45 1.16-4.22 1.16-3.24 0-5.98-2.18-6.96-5.11H1.05v3.14C3.06 21.2 7.22 24 12 24z"/>
                            <path fill="#FBBC05" d="M5.04 14.04c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.32H1.05C.38 7.66 0 9.16 0 10.75s.38 3.09 1.05 4.43l3.99-3.14z"/>
                            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.22 0 3.06 2.8 1.05 6.82l3.99 3.14c.98-2.93 3.72-5.21 6.96-5.21z"/>
                        </svg>
                        <span>Sign in with Google</span>
                    </button>
                    <div class="auth-gate-footer">
                        <a href="index.html" class="auth-gate-back-link">
                            <ion-icon name="arrow-back-outline"></ion-icon> Return to Homepage
                        </a>
                    </div>
                </div>
            `;
            const mainEl = document.querySelector('.page-main');
            if (mainEl && mainEl.parentNode) {
                mainEl.parentNode.insertBefore(authGate, mainEl);
            } else {
                document.body.appendChild(authGate);
            }
        }
        gateSignInBtn = document.getElementById('gateGoogleSignInBtn');
    }

    // Initialize Firebase Authentication
    try {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
        const { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');

        const firebaseConfig = {
            apiKey: "AIzaSyCZQqKCURGqMQ2LUl_XHOgscBmjs7Vj7ps",
            authDomain: "rsbk-online.firebaseapp.com",
            projectId: "rsbk-online",
            storageBucket: "rsbk-online.firebasestorage.app",
            messagingSenderId: "362985180438",
            appId: "1:362985180438:web:9802e4253a5f6b329ad437"
        };

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const provider = new GoogleAuthProvider();

        const signInBtn = document.getElementById('googleSignInBtn');
        const userProfileArea = document.getElementById('userProfileArea');
        const userAvatar = document.getElementById('userAvatar');
        const userName = document.getElementById('userName');
        const signOutBtn = document.getElementById('signOutBtn');

        onAuthStateChanged(auth, (user) => {
            const userTierPill = document.getElementById('userTierPill');
            if (user) {
                document.body.classList.add('auth-verified');
                if (signInBtn) signInBtn.style.display = 'none';
                if (userProfileArea) userProfileArea.style.display = 'inline-flex';
                if (userAvatar) {
                    userAvatar.src = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email || 'U')}&background=059669&color=fff`;
                }
                if (userName) {
                    const firstName = (user.displayName || user.email || 'User').split(' ')[0];
                    userName.textContent = firstName;
                }
                if (userTierPill) {
                    let walletBal = 0;
                    try {
                        const wRaw = localStorage.getItem(`rsbk_wallet_${user.uid}`);
                        if (wRaw) {
                            const w = JSON.parse(wRaw);
                            walletBal = w.balance || 0;
                        }
                    } catch (e) {}

                    if (walletBal >= 1) {
                        const days = Math.floor(walletBal);
                        userTierPill.textContent = `₹${days} · ${days}d`;
                        userTierPill.className = 'user-tier-pill pro';
                        userTierPill.title = `Active Scholar Wallet: ₹${walletBal.toFixed(2)} (${days} days of access remaining)`;
                    } else {
                        userTierPill.textContent = 'SCHOLAR';
                        userTierPill.className = 'user-tier-pill free';
                        userTierPill.title = 'Scholar Account — Top-up ₹1/day to activate';
                    }
                }
                window.dispatchEvent(new CustomEvent('rsbk-user-authenticated', { detail: user }));
            } else {
                document.body.classList.remove('auth-verified');
                if (signInBtn) signInBtn.style.display = 'inline-flex';
                if (userProfileArea) userProfileArea.style.display = 'none';
                window.dispatchEvent(new CustomEvent('rsbk-user-authenticated', { detail: null }));
            }
        });

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

        if (gateSignInBtn) {
            gateSignInBtn.addEventListener('click', handleGoogleSignIn);
        }

        if (signOutBtn) {
            signOutBtn.addEventListener('click', async () => {
                try {
                    await signOut(auth);
                } catch (err) {
                    console.error('Sign-Out error:', err);
                }
            });
        }
    } catch (e) {
        console.error('Failed to load Firebase Auth:', e);
    }
});
