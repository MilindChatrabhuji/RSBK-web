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

    // Inject Auth Container into Navbar
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        const authWidget = document.createElement('div');
        authWidget.className = 'auth-widget';
        authWidget.innerHTML = `
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
                <img id="userAvatar" class="user-avatar" src="" alt="User" referrerpolicy="no-referrer" />
                <span id="userName" class="user-name"></span>
                <button id="signOutBtn" class="btn-signout" type="button" title="Sign out">Sign out</button>
            </div>
        `;
        navLinks.appendChild(authWidget);
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
            if (user) {
                if (signInBtn) signInBtn.style.display = 'none';
                if (userProfileArea) userProfileArea.style.display = 'inline-flex';
                if (userAvatar) {
                    userAvatar.src = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email || 'U')}&background=059669&color=fff`;
                }
                if (userName) {
                    const firstName = (user.displayName || user.email || 'User').split(' ')[0];
                    userName.textContent = firstName;
                }
            } else {
                if (signInBtn) signInBtn.style.display = 'inline-flex';
                if (userProfileArea) userProfileArea.style.display = 'none';
            }
        });

        if (signInBtn) {
            signInBtn.addEventListener('click', async () => {
                try {
                    await signInWithPopup(auth, provider);
                } catch (err) {
                    if (err.code !== 'auth/popup-closed-by-user') {
                        console.error('Google Sign-In error:', err);
                        alert('Unable to sign in right now: ' + (err.message || 'Please try again.'));
                    }
                }
            });
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
