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

    // Mount Right-Side Vertical Menubar (Home, Books, Membership, Profile)
    let vMenubar = document.getElementById('rightVerticalMenubar');
    if (!vMenubar) {
        vMenubar = document.createElement('aside');
        vMenubar.id = 'rightVerticalMenubar';
        vMenubar.className = 'right-vertical-menubar';
        vMenubar.setAttribute('aria-label', 'Right Navigation Menubar');
        document.body.appendChild(vMenubar);
    }

    const path = window.location.pathname.toLowerCase();
    const isHome = path.endsWith('/') || path.endsWith('index.html') || path.endsWith('index') || (!path.includes('students') && !path.includes('teachers') && !path.includes('books') && !path.includes('membership') && !path.includes('profile') && !path.includes('payment'));
    const isBooks = path.includes('books');
    const isMembership = path.includes('membership');
    const isProfile = path.includes('profile');

    vMenubar.innerHTML = `
        <div class="vmenu-header">
            <span class="vmenu-badge">MENU</span>
        </div>
        <nav class="vmenu-nav">
            <a href="index.html" class="vmenu-item ${isHome ? 'active' : ''}" title="Home">
                <ion-icon name="home-outline"></ion-icon>
                <span class="vmenu-text">Home</span>
            </a>
            <a href="books.html" class="vmenu-item ${isBooks ? 'active' : ''}" title="Books Archive">
                <ion-icon name="library-outline"></ion-icon>
                <span class="vmenu-text">Books</span>
            </a>
            <a href="membership.html" class="vmenu-item ${isMembership ? 'active' : ''}" title="Membership &amp; Wallet">
                <ion-icon name="ribbon-outline"></ion-icon>
                <span class="vmenu-text">Membership</span>
            </a>
            <a href="profile.html" class="vmenu-item ${isProfile ? 'active' : ''}" title="User Profile">
                <ion-icon name="person-outline"></ion-icon>
                <span class="vmenu-text">Profile</span>
            </a>
        </nav>
    `;

    // Fast synchronous cached authentication restoration (Zero Flash)
    const isCachedAuth = localStorage.getItem('rsbk_auth_cached') === 'true';
    const cachedName = localStorage.getItem('rsbk_user_name') || '';
    const cachedAvatar = localStorage.getItem('rsbk_user_avatar') || '';

    if (isCachedAuth) {
        document.documentElement.classList.add('auth-verified');
        document.body.classList.add('auth-verified');
    }

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
            if (isCachedAuth) {
                authGate.style.display = 'none';
            }
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
            const authGate = document.getElementById('authGate');
            if (user) {
                const firstName = (user.displayName || user.email || 'User').split(' ')[0];
                const photo = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email || 'U')}&background=059669&color=fff`;

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
                if (authGate) authGate.style.display = 'none';

                window.dispatchEvent(new CustomEvent('rsbk-user-authenticated', { detail: user }));
            } else {
                localStorage.removeItem('rsbk_auth_cached');
                localStorage.removeItem('rsbk_user_name');
                localStorage.removeItem('rsbk_user_avatar');
                localStorage.removeItem('rsbk_user_email');

                document.documentElement.classList.remove('auth-verified');
                document.documentElement.classList.add('auth-unverified');
                document.body.classList.remove('auth-verified');
                document.body.classList.add('auth-unverified');

                if (signInBtn) signInBtn.style.display = 'inline-flex';
                if (userProfileArea) userProfileArea.style.display = 'none';
                if (authGate) authGate.style.display = 'flex';

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
                    localStorage.removeItem('rsbk_auth_cached');
                    localStorage.removeItem('rsbk_user_name');
                    localStorage.removeItem('rsbk_user_avatar');
                    localStorage.removeItem('rsbk_user_email');
                    document.documentElement.classList.remove('auth-verified');
                    document.documentElement.classList.add('auth-unverified');
                    document.body.classList.remove('auth-verified');
                    document.body.classList.add('auth-unverified');
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
});
