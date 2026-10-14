/**
 * RSBK Online — Academic Discussion Forum Module
 * Real-time Topics, Threaded Discussions, Rich Formatting, Reactions & Admin Moderation
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Admin Email Identifiers
    const ADMIN_EMAILS = [
        'dr.milindchatrabhuji@gmail.com',
        'milind.chatrabhuji@gmail.com'
    ];

    const checkIsAdmin = (email) => {
        if (!email) return false;
        return ADMIN_EMAILS.includes(email.toLowerCase().trim());
    };

    // Global State
    let currentUser = null;
    let isAdmin = false;
    let allTopics = {};
    let activeTopicId = null;
    let currentCategory = 'all';
    let currentSort = 'latest';
    let currentSearchQuery = '';
    let db = null;
    let activeCommentsListener = null;

    // DOM Elements
    const feedView = document.getElementById('forumFeedView');
    const topicDetailView = document.getElementById('topicDetailView');
    const topicsListEl = document.getElementById('forumTopicsList');
    const emptyStateEl = document.getElementById('forumEmptyState');
    const searchInput = document.getElementById('forumSearchInput');
    const sortSelect = document.getElementById('forumSortSelect');
    const categoryPills = document.querySelectorAll('.category-pill');
    const btnBackToFeed = document.getElementById('btnBackToFeed');
    const topicHeroCard = document.getElementById('topicHeroCard');
    const topicCommentsList = document.getElementById('topicCommentsList');
    const topicRepliesBadge = document.getElementById('topicRepliesBadge');
    const topicLockedNotice = document.getElementById('topicLockedNotice');
    const commentComposerCard = document.getElementById('commentComposerCard');
    const commentContentArea = document.getElementById('commentContentArea');
    const btnSubmitComment = document.getElementById('btnSubmitComment');
    const commentSignInPrompt = document.getElementById('commentSignInPrompt');

    // Modals
    const newTopicModal = document.getElementById('newTopicModal');
    const btnOpenNewTopicModal = document.getElementById('btnOpenNewTopicModal');
    const btnCloseNewTopicModal = document.getElementById('btnCloseNewTopicModal');
    const btnCancelNewTopic = document.getElementById('btnCancelNewTopic');
    const btnEmptyNewTopic = document.getElementById('btnEmptyNewTopic');
    const newTopicForm = document.getElementById('newTopicForm');
    const topicTitleInput = document.getElementById('topicTitleInput');
    const topicCategorySelect = document.getElementById('topicCategorySelect');
    const topicTagsInput = document.getElementById('topicTagsInput');
    const topicContentArea = document.getElementById('topicContentArea');

    const driveArchiveModal = document.getElementById('driveArchiveModal');
    const btnOpenDriveModal = document.getElementById('btnOpenDriveModal');
    const btnCloseDriveModal = document.getElementById('btnCloseDriveModal');
    const btnExportForumJson = document.getElementById('btnExportForumJson');
    const btnExportForumCsv = document.getElementById('btnExportForumCsv');

    // Stats Elements
    const statTotalTopics = document.getElementById('statTotalTopics');
    const statTotalReplies = document.getElementById('statTotalReplies');

    // Helper: Sanitize Key for Firebase RTDB
    const sanitizeUserKey = (str) => {
        if (!str) return 'guest_' + Math.random().toString(36).substring(2, 7);
        return str.toLowerCase().replace(/[.#$[\]/]/g, '_');
    };

    // Helper: Format Relative Time
    const formatTimeAgo = (timestamp) => {
        if (!timestamp) return 'Just now';
        const now = Date.now();
        const diffMs = now - timestamp;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 30) return `${diffDays}d ago`;

        return new Intl.DateTimeFormat('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).format(new Date(timestamp));
    };

    // Helper: Category Label & Icon
    const CATEGORIES = {
        'all': { label: 'All Topics', icon: '<ion-icon name="layers-outline"></ion-icon>' },
        'rasa-shastra': { label: 'Rasa Shastra', icon: '<ion-icon name="flask-outline"></ion-icon>' },
        'bhaishajya-kalpana': { label: 'Bhaishajya Kalpana', icon: '<ion-icon name="medkit-outline"></ion-icon>' },
        'clinical': { label: 'Clinical Cases', icon: '<ion-icon name="fitness-outline"></ion-icon>' },
        'pharmacology': { label: 'Pharmacology & Research', icon: '<ion-icon name="color-filter-outline"></ion-icon>' },
        'books': { label: 'Textbook Q&A', icon: '<ion-icon name="book-outline"></ion-icon>' },
        'curriculum': { label: 'UG / PG Curriculum', icon: '<ion-icon name="school-outline"></ion-icon>' },
        'general': { label: 'General Discourse', icon: '<ion-icon name="chatbubbles-outline"></ion-icon>' }
    };

    const getCategoryDisplay = (catKey) => {
        return CATEGORIES[catKey] || { label: 'Ayurveda', icon: '<ion-icon name="leaf-outline"></ion-icon>' };
    };

    // Helper: Sanitize Rich HTML content
    const sanitizeHtml = (dirtyHtml) => {
        if (!dirtyHtml) return '';
        const temp = document.createElement('div');
        temp.innerHTML = dirtyHtml;

        // Remove script tags, iframes, and inline event handlers
        const scripts = temp.querySelectorAll('script, iframe, object, embed, form');
        scripts.forEach(s => s.remove());

        const allElements = temp.querySelectorAll('*');
        allElements.forEach(el => {
            Array.from(el.attributes).forEach(attr => {
                if (attr.name.startsWith('on') || attr.value.toLowerCase().includes('javascript:')) {
                    el.removeAttribute(attr.name);
                }
            });
        });

        return temp.innerHTML;
    };

    // Initialize Firebase Realtime Database
    try {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
        const { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');
        const { getDatabase, ref, onValue, set, push, update, remove, runTransaction } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js');

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
        db = getDatabase(app);

        // Authentication Listener
        onAuthStateChanged(auth, (user) => {
            currentUser = user;
            if (user) {
                isAdmin = checkIsAdmin(user.email);
                if (commentSignInPrompt) commentSignInPrompt.style.display = 'none';
                if (commentContentArea) commentContentArea.style.display = 'block';
                if (btnSubmitComment) btnSubmitComment.style.display = 'inline-flex';
            } else {
                const cachedEmail = (localStorage.getItem('rsbk_user_email') || '').toLowerCase();
                isAdmin = checkIsAdmin(cachedEmail);
                if (commentSignInPrompt) commentSignInPrompt.style.display = 'block';
            }

            // Re-render active view to update admin controls and reaction highlights
            if (activeTopicId && allTopics[activeTopicId]) {
                renderTopicDetail(allTopics[activeTopicId]);
            } else {
                renderTopicsFeed();
            }
        });

        // 1-Click Google Sign-In helper for guest users
        const promptGoogleSignIn = async () => {
            try {
                const provider = new GoogleAuthProvider();
                await signInWithPopup(auth, provider);
            } catch (err) {
                if (err.code !== 'auth/popup-closed-by-user') {
                    alert('Sign-In Error: ' + err.message);
                }
            }
        };

        const btnCommentSignIn = document.getElementById('btnCommentSignIn');
        if (btnCommentSignIn) {
            btnCommentSignIn.addEventListener('click', promptGoogleSignIn);
        }



        // =========================================================================
        // Real-Time Listener for All Topics
        // =========================================================================
        const topicsRef = ref(db, 'forum/topics');
        onValue(topicsRef, (snapshot) => {
            allTopics = snapshot.val() || {};
            updateForumStats();

            // If user is currently reading a topic, refresh that view
            if (activeTopicId && allTopics[activeTopicId]) {
                renderTopicDetail(allTopics[activeTopicId]);
            } else {
                renderTopicsFeed();
            }
        });

    } catch (e) {
        console.error('Firebase Realtime Database init failed for forum:', e);
    }

    // =========================================================================
    // Statistics Counter Updater
    // =========================================================================
    const updateForumStats = () => {
        const topicList = Object.values(allTopics);
        const totalTopics = topicList.length;
        let totalReplies = 0;

        topicList.forEach(t => {
            totalReplies += (t.replyCount || 0);
        });

        if (statTotalTopics) statTotalTopics.textContent = totalTopics;
        if (statTotalReplies) statTotalReplies.textContent = totalReplies;
    };

    // =========================================================================
    // Filter, Search & Render Topics Feed
    // =========================================================================
    const renderTopicsFeed = () => {
        if (!topicsListEl) return;
        topicsListEl.innerHTML = '';

        let topics = Object.values(allTopics);

        // Filter by Category
        if (currentCategory !== 'all') {
            topics = topics.filter(t => t.category === currentCategory);
        }

        // Filter by Search Query
        if (currentSearchQuery.trim()) {
            const q = currentSearchQuery.toLowerCase().trim();
            topics = topics.filter(t => {
                const titleMatch = (t.title || '').toLowerCase().includes(q);
                const authorMatch = (t.authorName || '').toLowerCase().includes(q);
                const tagMatch = (t.tags || []).some(tag => tag.toLowerCase().includes(q));
                const contentMatch = (t.content || '').toLowerCase().includes(q);
                return titleMatch || authorMatch || tagMatch || contentMatch;
            });
        }

        // Sorting
        topics.sort((a, b) => {
            // Pinned topics always on top
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;

            if (currentSort === 'active') {
                const aReactions = countTotalReactions(a.reactions);
                const bReactions = countTotalReactions(b.reactions);
                const aScore = (a.replyCount || 0) * 2 + aReactions;
                const bScore = (b.replyCount || 0) * 2 + bReactions;
                return bScore - aScore;
            } else if (currentSort === 'views') {
                return (b.views || 0) - (a.views || 0);
            } else if (currentSort === 'unanswered') {
                return (a.replyCount || 0) - (b.replyCount || 0);
            } else {
                // Latest
                return (b.lastActivityAt || b.createdAt || 0) - (a.lastActivityAt || a.createdAt || 0);
            }
        });

        if (topics.length === 0) {
            emptyStateEl.style.display = 'flex';
            topicsListEl.style.display = 'none';
            return;
        }

        emptyStateEl.style.display = 'none';
        topicsListEl.style.display = 'flex';

        topics.forEach(topic => {
            const card = document.createElement('article');
            card.className = `topic-card ${topic.isPinned ? 'pinned' : ''}`;
            card.setAttribute('data-topic-id', topic.id);

            const cat = getCategoryDisplay(topic.category);
            const authorRole = topic.authorRole || 'Scholar';
            const isAdminAuthor = checkIsAdmin(topic.authorEmail);
            const totalReactions = countTotalReactions(topic.reactions);

            // Clean excerpt from HTML
            const excerptDiv = document.createElement('div');
            excerptDiv.innerHTML = topic.content || '';
            const plainExcerpt = excerptDiv.textContent || excerptDiv.innerText || '';

            card.innerHTML = `
                <div class="topic-card-header">
                    <div class="topic-author-meta">
                        <div class="topic-author-avatar">
                            ${topic.authorAvatar ? `<img src="${topic.authorAvatar}" alt="${topic.authorName}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">` : (topic.authorName ? topic.authorName.charAt(0).toUpperCase() : 'S')}
                        </div>
                        <div class="topic-author-details">
                            <div class="topic-author-name">
                                <span>${escapeHtml(topic.authorName || 'Ayurveda Scholar')}</span>
                                ${isAdminAuthor ? `<span class="role-badge admin"><ion-icon name="ribbon-outline"></ion-icon> Admin</span>` : `<span class="role-badge scholar">${authorRole}</span>`}
                            </div>
                            <span class="topic-time-ago">${formatTimeAgo(topic.lastActivityAt || topic.createdAt)}</span>
                        </div>
                    </div>

                    <div class="topic-badges-wrap">
                        ${topic.isPinned ? `<span class="badge-pinned"><ion-icon name="pin"></ion-icon> Pinned</span>` : ''}
                        ${topic.isLocked ? `<span class="badge-locked"><ion-icon name="lock-closed"></ion-icon> Closed</span>` : ''}
                        <span class="topic-cat-badge">${cat.icon} ${cat.label}</span>
                    </div>
                </div>

                <h3 class="topic-title">${escapeHtml(topic.title)}</h3>
                <p class="topic-excerpt">${escapeHtml(plainExcerpt)}</p>

                <div class="topic-card-footer">
                    <div class="topic-stats-row">
                        <span class="topic-stat" title="Views">
                            <ion-icon name="eye-outline"></ion-icon>
                            <span>${(topic.views || 0).toLocaleString('en-IN')}</span>
                        </span>
                        <span class="topic-stat" title="Comments &amp; Replies">
                            <ion-icon name="chatbubble-ellipses-outline"></ion-icon>
                            <span>${topic.replyCount || 0}</span>
                        </span>
                        <span class="topic-stat" title="Reactions">
                            <ion-icon name="heart-outline"></ion-icon>
                            <span>${totalReactions}</span>
                        </span>
                    </div>

                    <div class="topic-reactions-preview">
                        ${renderReactionPill('thumbs-up-outline', topic.reactions?.thumbsUp)}
                        ${renderReactionPill('heart-outline', topic.reactions?.heart)}
                        ${renderReactionPill('bulb-outline', topic.reactions?.insightful)}
                    </div>
                </div>
            `;

            // Card click navigates to topic detail
            card.addEventListener('click', () => {
                openTopic(topic.id);
            });

            topicsListEl.appendChild(card);
        });
    };

    // Helper: Count Total Reactions on an item
    const countTotalReactions = (reactionsMap) => {
        if (!reactionsMap) return 0;
        let count = 0;
        Object.values(reactionsMap).forEach(users => {
            if (users && typeof users === 'object') {
                count += Object.keys(users).length;
            }
        });
        return count;
    };

    // Helper: Render quick preview pill of reaction
    const renderReactionPill = (iconName, userMap) => {
        if (!userMap) return '';
        const count = Object.keys(userMap).length;
        if (count === 0) return '';
        return `<span class="reaction-pill"><ion-icon name="${iconName}"></ion-icon> ${count}</span>`;
    };

    // =========================================================================
    // Open Single Topic Detail View
    // =========================================================================
    const openTopic = async (topicId) => {
        const topic = allTopics[topicId];
        if (!topic) return;

        activeTopicId = topicId;
        window.history.pushState(null, '', `?topic=${topicId}`);

        // Increment Views Count once per session
        const viewedKey = `rsbk_viewed_${topicId}`;
        if (!sessionStorage.getItem(viewedKey) && db) {
            sessionStorage.setItem(viewedKey, 'true');
            const viewRef = ref(db, `forum/topics/${topicId}/views`);
            runTransaction(viewRef, (current) => (current || 0) + 1);
        }

        feedView.style.display = 'none';
        topicDetailView.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });

        renderTopicDetail(topic);
        listenToTopicComments(topicId);
    };

    // Render Topic Detail Header & Body
    const renderTopicDetail = (topic) => {
        const cat = getCategoryDisplay(topic.category);
        const isAdminAuthor = checkIsAdmin(topic.authorEmail);
        const userEmailKey = currentUser ? sanitizeUserKey(currentUser.email) : null;

        // Admin Controls (Visible to Admin or Post Author)
        const canModerate = isAdmin;
        const canDelete = isAdmin || (currentUser && currentUser.email === topic.authorEmail);

        topicHeroCard.innerHTML = `
            <div class="topic-card-header">
                <div class="topic-author-meta">
                    <div class="topic-author-avatar" style="width: 46px; height: 46px; font-size: 1.1rem;">
                        ${topic.authorAvatar ? `<img src="${topic.authorAvatar}" alt="${topic.authorName}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">` : (topic.authorName ? topic.authorName.charAt(0).toUpperCase() : 'S')}
                    </div>
                    <div class="topic-author-details">
                        <div class="topic-author-name" style="font-size: 1.05rem;">
                            <span>${escapeHtml(topic.authorName || 'Ayurveda Scholar')}</span>
                            ${isAdminAuthor ? `<span class="role-badge admin"><ion-icon name="ribbon-outline"></ion-icon> Admin / Author</span>` : `<span class="role-badge scholar">${topic.authorRole || 'Scholar'}</span>`}
                        </div>
                        <span class="topic-time-ago">${new Date(topic.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </div>
                </div>

                <div class="topic-badges-wrap">
                    ${topic.isPinned ? `<span class="badge-pinned"><ion-icon name="pin"></ion-icon> Pinned</span>` : ''}
                    ${topic.isLocked ? `<span class="badge-locked"><ion-icon name="lock-closed"></ion-icon> Closed</span>` : ''}
                    <span class="topic-cat-badge" style="font-size: 0.82rem; padding: 0.35rem 0.75rem;">${cat.icon} ${cat.label}</span>
                </div>
            </div>

            <h1 class="topic-hero-title">${escapeHtml(topic.title)}</h1>

            ${topic.tags && topic.tags.length ? `
                <div style="display: flex; flex-wrap: wrap; gap: 0.45rem;">
                    ${topic.tags.map(t => `<span style="font-size: 0.75rem; background: #f1f5f9; color: #475569; padding: 0.2rem 0.6rem; border-radius: 6px; font-weight: 600;">#${escapeHtml(t.trim())}</span>`).join('')}
                </div>
            ` : ''}

            <div class="topic-content-body">
                ${sanitizeHtml(topic.content)}
            </div>

            <!-- Reactions & Actions Bar -->
            <div class="reactions-bar">
                <button type="button" class="reaction-btn ${hasUserReacted(topic.reactions?.thumbsUp, userEmailKey) ? 'active' : ''}" data-type="thumbsUp" title="Thumbs Up">
                    <ion-icon name="thumbs-up-outline"></ion-icon>
                    <span class="reaction-count">${getReactionCount(topic.reactions?.thumbsUp)}</span>
                </button>
                <button type="button" class="reaction-btn ${hasUserReacted(topic.reactions?.heart, userEmailKey) ? 'active' : ''}" data-type="heart" title="Helpful / Love">
                    <ion-icon name="heart-outline"></ion-icon>
                    <span class="reaction-count">${getReactionCount(topic.reactions?.heart)}</span>
                </button>
                <button type="button" class="reaction-btn ${hasUserReacted(topic.reactions?.insightful, userEmailKey) ? 'active' : ''}" data-type="insightful" title="Insightful Analysis">
                    <ion-icon name="bulb-outline"></ion-icon>
                    <span class="reaction-count">${getReactionCount(topic.reactions?.insightful)}</span>
                </button>
                <button type="button" class="reaction-btn ${hasUserReacted(topic.reactions?.clap, userEmailKey) ? 'active' : ''}" data-type="clap" title="Applause">
                    <ion-icon name="hand-right-outline"></ion-icon>
                    <span class="reaction-count">${getReactionCount(topic.reactions?.clap)}</span>
                </button>
                <button type="button" class="reaction-btn ${hasUserReacted(topic.reactions?.solved, userEmailKey) ? 'active' : ''}" data-type="solved" title="Clinically Solved">
                    <ion-icon name="checkmark-done-circle-outline"></ion-icon>
                    <span class="reaction-count">${getReactionCount(topic.reactions?.solved)}</span>
                </button>

                <button type="button" class="reaction-btn" id="btnShareTopic" title="Copy shareable link" style="margin-left: 0.5rem;">
                    <ion-icon name="share-social-outline"></ion-icon>
                    <span>Share</span>
                </button>

                <!-- Admin Action Buttons -->
                ${canModerate ? `
                    <div class="topic-admin-actions">
                        <button type="button" class="admin-action-btn pin" id="btnTogglePinTopic" title="${topic.isPinned ? 'Unpin Topic' : 'Pin to Top'}">
                            <ion-icon name="pin-outline"></ion-icon>
                            <span>${topic.isPinned ? 'Unpin' : 'Pin'}</span>
                        </button>
                        <button type="button" class="admin-action-btn lock" id="btnToggleLockTopic" title="${topic.isLocked ? 'Unlock Topic' : 'Lock Discussion'}">
                            <ion-icon name="${topic.isLocked ? 'lock-open-outline' : 'lock-closed-outline'}"></ion-icon>
                            <span>${topic.isLocked ? 'Unlock' : 'Lock'}</span>
                        </button>
                    </div>
                ` : ''}

                ${canDelete ? `
                    <button type="button" class="admin-action-btn delete" id="btnDeleteTopic" title="Delete Topic" style="${canModerate ? '' : 'margin-left: auto;'}">
                        <ion-icon name="trash-outline"></ion-icon>
                        <span>Delete</span>
                    </button>
                ` : ''}
            </div>
        `;

        // Handle Reactions on Topic
        topicHeroCard.querySelectorAll('.reaction-btn[data-type]').forEach(btn => {
            btn.addEventListener('click', () => {
                toggleTopicReaction(topic.id, btn.getAttribute('data-type'));
            });
        });

        // Share Topic Button
        const btnShareTopic = topicHeroCard.querySelector('#btnShareTopic');
        if (btnShareTopic) {
            btnShareTopic.addEventListener('click', () => {
                const url = window.location.href;
                navigator.clipboard.writeText(url).then(() => {
                    alert('Topic link copied to clipboard!');
                }).catch(() => {
                    prompt('Copy this topic URL:', url);
                });
            });
        }

        // Admin Pin Button
        const btnTogglePinTopic = topicHeroCard.querySelector('#btnTogglePinTopic');
        if (btnTogglePinTopic && db) {
            btnTogglePinTopic.addEventListener('click', async () => {
                await update(ref(db, `forum/topics/${topic.id}`), {
                    isPinned: !topic.isPinned
                });
            });
        }

        // Admin Lock Button
        const btnToggleLockTopic = topicHeroCard.querySelector('#btnToggleLockTopic');
        if (btnToggleLockTopic && db) {
            btnToggleLockTopic.addEventListener('click', async () => {
                await update(ref(db, `forum/topics/${topic.id}`), {
                    isLocked: !topic.isLocked
                });
            });
        }

        // Admin / Author Delete Button
        const btnDeleteTopic = topicHeroCard.querySelector('#btnDeleteTopic');
        if (btnDeleteTopic && db) {
            btnDeleteTopic.addEventListener('click', async () => {
                if (confirm(`Are you sure you want to delete "${topic.title}"? This cannot be undone.`)) {
                    await remove(ref(db, `forum/topics/${topic.id}`));
                    await remove(ref(db, `forum/comments/${topic.id}`));
                    backToFeed();
                }
            });
        }

        // Show/hide locked notice and composer
        if (topic.isLocked) {
            topicLockedNotice.style.display = 'flex';
            commentComposerCard.style.display = 'none';
        } else {
            topicLockedNotice.style.display = 'none';
            commentComposerCard.style.display = 'flex';
        }
    };

    // Helper: Check if user reacted
    const hasUserReacted = (userMap, userKey) => {
        if (!userMap || !userKey) return false;
        return !!userMap[userKey];
    };

    // Helper: Get Count of reaction
    const getReactionCount = (userMap) => {
        if (!userMap) return 0;
        return Object.keys(userMap).length;
    };

    // Toggle Reaction on Topic
    const toggleTopicReaction = async (topicId, reactionType) => {
        if (!currentUser) {
            alert('Please sign in with Google to react to scholarly insights.');
            return;
        }
        if (!db) return;

        const userKey = sanitizeUserKey(currentUser.email);
        const reactionRef = ref(db, `forum/topics/${topicId}/reactions/${reactionType}/${userKey}`);

        runTransaction(reactionRef, (currentVal) => {
            return currentVal ? null : true;
        });
    };

    // =========================================================================
    // Real-Time Comments & Replies for Active Topic
    // =========================================================================
    const listenToTopicComments = (topicId) => {
        if (!db) return;
        const commentsRef = ref(db, `forum/comments/${topicId}`);

        onValue(commentsRef, (snapshot) => {
            const commentsData = snapshot.val() || {};
            renderCommentsThread(commentsData);

            // Update reply count on topic object in Realtime Database if different
            const totalCount = Object.keys(commentsData).length;
            if (topicRepliesBadge) {
                topicRepliesBadge.textContent = `${totalCount} ${totalCount === 1 ? 'reply' : 'replies'}`;
            }

            if (allTopics[topicId] && allTopics[topicId].replyCount !== totalCount) {
                update(ref(db, `forum/topics/${topicId}`), {
                    replyCount: totalCount,
                    lastActivityAt: Date.now()
                });
            }
        });
    };

    // Render Comments Thread (Top-level + Nested Replies)
    const renderCommentsThread = (commentsData) => {
        if (!topicCommentsList) return;
        topicCommentsList.innerHTML = '';

        const allComments = Object.values(commentsData);

        if (allComments.length === 0) {
            topicCommentsList.innerHTML = `
                <div style="background: #f8fafc; border: 1px dashed rgba(15,23,42,0.1); border-radius: 16px; padding: 2rem; text-align: center; color: #94a3b8;">
                    <ion-icon name="chatbox-outline" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></ion-icon>
                    <p style="font-size: 0.95rem; font-weight: 600;">No comments yet on this topic.</p>
                    <p style="font-size: 0.85rem;">Be the first scholar to share your insight or clinical query below.</p>
                </div>
            `;
            return;
        }

        // Separate top-level comments and nested replies
        const topComments = allComments.filter(c => !c.parentId);
        const repliesByParent = {};

        allComments.filter(c => c.parentId).forEach(r => {
            if (!repliesByParent[r.parentId]) {
                repliesByParent[r.parentId] = [];
            }
            repliesByParent[r.parentId].push(r);
        });

        // Sort comments by createdAt
        topComments.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

        topComments.forEach(comment => {
            const commentCard = createCommentElement(comment, false);

            // Append nested replies if present
            const nestedList = document.createElement('div');
            nestedList.className = 'nested-replies-list';
            nestedList.id = `replies_${comment.id}`;

            const replies = repliesByParent[comment.id] || [];
            replies.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

            replies.forEach(reply => {
                const replyCard = createCommentElement(reply, true);
                nestedList.appendChild(replyCard);
            });

            commentCard.appendChild(nestedList);
            topicCommentsList.appendChild(commentCard);
        });
    };

    // Create Individual Comment / Reply DOM element
    const createCommentElement = (comment, isNested = false) => {
        const el = document.createElement('div');
        el.className = isNested ? 'nested-reply-card' : 'comment-card';
        el.setAttribute('data-comment-id', comment.id);

        const isAdminAuthor = checkIsAdmin(comment.authorEmail);
        const canDelete = isAdmin || (currentUser && currentUser.email === comment.authorEmail);
        const userEmailKey = currentUser ? sanitizeUserKey(currentUser.email) : null;

        el.innerHTML = `
            <div class="comment-header">
                <div class="topic-author-meta">
                    <div class="topic-author-avatar" style="width: 32px; height: 32px; font-size: 0.8rem;">
                        ${comment.authorAvatar ? `<img src="${comment.authorAvatar}" alt="${comment.authorName}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">` : (comment.authorName ? comment.authorName.charAt(0).toUpperCase() : 'S')}
                    </div>
                    <div class="topic-author-details">
                        <div class="topic-author-name" style="font-size: 0.88rem;">
                            <span>${escapeHtml(comment.authorName || 'Ayurveda Scholar')}</span>
                            ${isAdminAuthor ? `<span class="role-badge admin"><ion-icon name="ribbon-outline"></ion-icon> Admin</span>` : `<span class="role-badge scholar">${comment.authorRole || 'Scholar'}</span>`}
                        </div>
                        <span class="topic-time-ago">${formatTimeAgo(comment.createdAt)}</span>
                    </div>
                </div>

                ${canDelete ? `
                    <button type="button" class="admin-action-btn delete btn-delete-comment" data-comment-id="${comment.id}" title="Delete comment" style="padding: 0.25rem 0.5rem; font-size: 0.72rem;">
                        <ion-icon name="trash-outline"></ion-icon>
                        <span>Delete</span>
                    </button>
                ` : ''}
            </div>

            <div class="comment-content">
                ${sanitizeHtml(comment.content)}
            </div>

            <div class="comment-footer">
                <button type="button" class="reaction-btn ${hasUserReacted(comment.reactions?.thumbsUp, userEmailKey) ? 'active' : ''}" data-comment-reaction="thumbsUp" style="padding: 0.25rem 0.6rem; font-size: 0.78rem;">
                    <ion-icon name="thumbs-up-outline"></ion-icon>
                    <span>${getReactionCount(comment.reactions?.thumbsUp)}</span>
                </button>
                <button type="button" class="reaction-btn ${hasUserReacted(comment.reactions?.heart, userEmailKey) ? 'active' : ''}" data-comment-reaction="heart" style="padding: 0.25rem 0.6rem; font-size: 0.78rem;">
                    <ion-icon name="heart-outline"></ion-icon>
                    <span>${getReactionCount(comment.reactions?.heart)}</span>
                </button>

                ${!isNested ? `
                    <button type="button" class="btn-reply-toggle" data-parent-id="${comment.id}">
                        <ion-icon name="return-down-forward-outline"></ion-icon>
                        <span>Reply</span>
                    </button>
                ` : ''}
            </div>

            <!-- Inline Reply Box Slot -->
            ${!isNested ? `<div class="inline-reply-slot" id="inlineReplySlot_${comment.id}" style="display: none; margin-top: 0.75rem;"></div>` : ''}
        `;

        // Handle Comment Reactions
        el.querySelectorAll('.reaction-btn[data-comment-reaction]').forEach(btn => {
            btn.addEventListener('click', () => {
                toggleCommentReaction(activeTopicId, comment.id, btn.getAttribute('data-comment-reaction'));
            });
        });

        // Handle Comment Delete
        const deleteBtn = el.querySelector('.btn-delete-comment');
        if (deleteBtn && db) {
            deleteBtn.addEventListener('click', async () => {
                if (confirm('Delete this comment?')) {
                    await remove(ref(db, `forum/comments/${activeTopicId}/${comment.id}`));
                }
            });
        }

        // Handle Inline Reply Toggle
        const replyToggle = el.querySelector('.btn-reply-toggle');
        if (replyToggle) {
            replyToggle.addEventListener('click', () => {
                toggleInlineReplyBox(comment.id, comment.authorName);
            });
        }

        return el;
    };

    // Toggle Comment Reaction
    const toggleCommentReaction = async (topicId, commentId, reactionType) => {
        if (!currentUser) {
            alert('Please sign in with Google to react to comments.');
            return;
        }
        if (!db) return;

        const userKey = sanitizeUserKey(currentUser.email);
        const reactionRef = ref(db, `forum/comments/${topicId}/${commentId}/reactions/${reactionType}/${userKey}`);

        runTransaction(reactionRef, (curr) => {
            return curr ? null : true;
        });
    };

    // Toggle Inline Reply Box
    const toggleInlineReplyBox = (commentId, authorName) => {
        const slot = document.getElementById(`inlineReplySlot_${commentId}`);
        if (!slot) return;

        if (slot.style.display === 'block') {
            slot.style.display = 'none';
            slot.innerHTML = '';
            return;
        }

        if (!currentUser) {
            alert('Please sign in with Google to post a reply.');
            return;
        }

        slot.style.display = 'block';
        slot.innerHTML = `
            <div style="background: #ffffff; border: 1px solid rgba(5,150,105,0.3); border-radius: 12px; padding: 0.85rem; display: flex; flex-direction: column; gap: 0.6rem;">
                <div style="font-size: 0.82rem; color: var(--text-muted); font-weight: 600;">
                    Replying to <strong>${escapeHtml(authorName)}</strong>:
                </div>
                <div class="editor-content-area" id="replyContent_${commentId}" contenteditable="true" style="min-height: 60px;" placeholder="Write your reply..."></div>
                <div style="display: flex; justify-content: flex-end; gap: 0.5rem;">
                    <button type="button" class="btn-drive-backup" id="btnCancelReply_${commentId}" style="padding: 0.4rem 0.85rem; font-size: 0.8rem;">Cancel</button>
                    <button type="button" class="btn-post-comment" id="btnSubmitReply_${commentId}" style="padding: 0.4rem 0.85rem; font-size: 0.8rem;">Post Reply</button>
                </div>
            </div>
        `;

        const cancelBtn = document.getElementById(`btnCancelReply_${commentId}`);
        const submitBtn = document.getElementById(`btnSubmitReply_${commentId}`);
        const replyInput = document.getElementById(`replyContent_${commentId}`);

        cancelBtn.addEventListener('click', () => {
            slot.style.display = 'none';
            slot.innerHTML = '';
        });

        submitBtn.addEventListener('click', async () => {
            const text = replyInput.innerHTML.trim();
            if (!text || text === '<br>') {
                alert('Please enter your reply text.');
                return;
            }

            const commentRef = push(ref(db, `forum/comments/${activeTopicId}`));
            await set(commentRef, {
                id: commentRef.key,
                topicId: activeTopicId,
                parentId: commentId,
                content: text,
                authorName: currentUser.displayName || 'Ayurveda Scholar',
                authorEmail: currentUser.email || '',
                authorRole: isAdmin ? 'Faculty / Admin' : 'Scholar',
                authorAvatar: currentUser.photoURL || '',
                createdAt: Date.now()
            });

            slot.style.display = 'none';
            slot.innerHTML = '';
        });
    };

    // =========================================================================
    // Post New Top-Level Comment on Active Topic
    // =========================================================================
    if (btnSubmitComment) {
        btnSubmitComment.addEventListener('click', async () => {
            if (!currentUser) {
                alert('Please sign in with Google to post your comment.');
                return;
            }
            if (!activeTopicId || !db) return;

            const content = commentContentArea.innerHTML.trim();
            if (!content || content === '<br>') {
                alert('Please write your insight before posting.');
                return;
            }

            btnSubmitComment.disabled = true;
            btnSubmitComment.textContent = 'Posting...';

            try {
                const commentRef = push(ref(db, `forum/comments/${activeTopicId}`));
                await set(commentRef, {
                    id: commentRef.key,
                    topicId: activeTopicId,
                    parentId: null,
                    content: content,
                    authorName: currentUser.displayName || 'Ayurveda Scholar',
                    authorEmail: currentUser.email || '',
                    authorRole: isAdmin ? 'Faculty / Admin' : 'Scholar',
                    authorAvatar: currentUser.photoURL || '',
                    createdAt: Date.now()
                });

                // Clear composer
                commentContentArea.innerHTML = '';
            } catch (err) {
                console.error('Error posting comment:', err);
                alert('Failed to post comment. Please check your internet connection.');
            } finally {
                btnSubmitComment.disabled = false;
                btnSubmitComment.innerHTML = '<ion-icon name="paper-plane-outline"></ion-icon> <span>Post Comment</span>';
            }
        });
    }

    // =========================================================================
    // Return Back to Feed
    // =========================================================================
    const backToFeed = () => {
        activeTopicId = null;
        window.history.pushState(null, '', window.location.pathname);
        topicDetailView.classList.remove('active');
        feedView.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (btnBackToFeed) {
        btnBackToFeed.addEventListener('click', (e) => {
            e.preventDefault();
            backToFeed();
        });
    }

    // =========================================================================
    // Rich Text Editor Toolbar Commands
    // =========================================================================
    const setupToolbar = (toolbarId, editorId) => {
        const toolbar = document.getElementById(toolbarId);
        const editor = document.getElementById(editorId);
        if (!toolbar || !editor) return;

        toolbar.querySelectorAll('.editor-tool-btn[data-command]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                editor.focus();
                const cmd = btn.getAttribute('data-command');
                const val = btn.getAttribute('data-value') || null;
                document.execCommand(cmd, false, val);
            });
        });
    };

    setupToolbar('commentToolbar', 'commentContentArea');
    setupToolbar('modalTopicToolbar', 'topicContentArea');

    // Sanskrit Shloka Box Inserter Helper
    const insertShlokaBox = (editorEl) => {
        if (!editorEl) return;
        editorEl.focus();
        const shlokaHtml = `<div class="shloka-quote">॥ अत्र श्लोकं लिखन्तु ॥<br><small style="color:#9a3412;">— ग्रन्थ सन्दर्भः</small></div><p><br></p>`;
        document.execCommand('insertHTML', false, shlokaHtml);
    };

    const btnInsertShlokaComment = document.getElementById('btnInsertShlokaComment');
    if (btnInsertShlokaComment) {
        btnInsertShlokaComment.addEventListener('click', () => insertShlokaBox(commentContentArea));
    }

    const btnInsertShlokaTopic = document.getElementById('btnInsertShlokaTopic');
    if (btnInsertShlokaTopic) {
        btnInsertShlokaTopic.addEventListener('click', () => insertShlokaBox(topicContentArea));
    }

    // Quick Emojis
    document.querySelectorAll('.emoji-quick-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const emoji = btn.getAttribute('data-emoji');
            if (commentContentArea) {
                commentContentArea.focus();
                document.execCommand('insertText', false, emoji);
            }
        });
    });

    // =========================================================================
    // Create New Topic Modal Handling
    // =========================================================================
    const openNewTopicModal = () => {
        if (!currentUser) {
            alert('Please sign in with your Google account to start an academic discussion.');
            return;
        }
        newTopicModal.classList.add('open');
        topicTitleInput.focus();
    };

    const closeNewTopicModal = () => {
        newTopicModal.classList.remove('open');
        newTopicForm.reset();
        topicContentArea.innerHTML = '';
    };

    if (btnOpenNewTopicModal) btnOpenNewTopicModal.addEventListener('click', openNewTopicModal);
    if (btnEmptyNewTopic) btnEmptyNewTopic.addEventListener('click', openNewTopicModal);
    if (btnCloseNewTopicModal) btnCloseNewTopicModal.addEventListener('click', closeNewTopicModal);
    if (btnCancelNewTopic) btnCancelNewTopic.addEventListener('click', closeNewTopicModal);

    // Submit New Topic Form
    if (newTopicForm) {
        newTopicForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!currentUser) {
                alert('Please sign in with Google to publish a topic.');
                return;
            }
            if (!db) return;

            const title = topicTitleInput.value.trim();
            const category = topicCategorySelect.value;
            const tagsRaw = topicTagsInput.value.trim();
            const content = topicContentArea.innerHTML.trim();

            if (!title) {
                alert('Please enter a topic title.');
                return;
            }
            if (!content || content === '<br>') {
                alert('Please write the detailed content of your topic.');
                return;
            }

            const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];
            const submitBtn = document.getElementById('btnPublishTopic');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Publishing...';

            try {
                const now = Date.now();
                const newTopicRef = push(ref(db, 'forum/topics'));
                const topicId = newTopicRef.key;

                const newTopicData = {
                    id: topicId,
                    title: title,
                    category: category,
                    tags: tags,
                    content: content,
                    authorName: currentUser.displayName || 'Ayurveda Scholar',
                    authorEmail: currentUser.email || '',
                    authorRole: isAdmin ? 'Faculty / Admin' : 'Scholar',
                    authorAvatar: currentUser.photoURL || '',
                    createdAt: now,
                    lastActivityAt: now,
                    views: 1,
                    replyCount: 0,
                    isPinned: false,
                    isLocked: false,
                    reactions: {}
                };

                await set(newTopicRef, newTopicData);
                closeNewTopicModal();
                openTopic(topicId);
            } catch (err) {
                console.error('Error creating topic:', err);
                alert('Failed to publish topic. Please try again.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<ion-icon name="checkmark-circle-outline"></ion-icon> <span>Publish Topic</span>';
            }
        });
    }

    // =========================================================================
    // Google Drive Storage Info & Archive Export Modal
    // =========================================================================
    if (btnOpenDriveModal) {
        btnOpenDriveModal.addEventListener('click', () => {
            driveArchiveModal.classList.add('open');
        });
    }

    if (btnCloseDriveModal) {
        btnCloseDriveModal.addEventListener('click', () => {
            driveArchiveModal.classList.remove('open');
        });
    }

    // Export Forum as JSON file for Google Drive backup
    if (btnExportForumJson) {
        btnExportForumJson.addEventListener('click', () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allTopics, null, 2));
            const dlAnchor = document.createElement('a');
            dlAnchor.setAttribute("href", dataStr);
            dlAnchor.setAttribute("download", `RSBK_Forum_Archive_${new Date().toISOString().slice(0, 10)}.json`);
            document.body.appendChild(dlAnchor);
            dlAnchor.click();
            dlAnchor.remove();
        });
    }

    // Export Forum as CSV
    if (btnExportForumCsv) {
        btnExportForumCsv.addEventListener('click', () => {
            const topics = Object.values(allTopics);
            const headers = ["ID", "Title", "Category", "Author", "Created_Date", "Views", "Replies", "Pinned"];
            const rows = topics.map(t => [
                `"${t.id}"`,
                `"${(t.title || '').replace(/"/g, '""')}"`,
                `"${t.category}"`,
                `"${(t.authorName || '').replace(/"/g, '""')}"`,
                `"${new Date(t.createdAt).toISOString()}"`,
                t.views || 0,
                t.replyCount || 0,
                t.isPinned ? "Yes" : "No"
            ]);

            const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
            const dlAnchor = document.createElement('a');
            dlAnchor.setAttribute("href", encodeURI(csvContent));
            dlAnchor.setAttribute("download", `RSBK_Forum_Topics_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(dlAnchor);
            dlAnchor.click();
            dlAnchor.remove();
        });
    }

    // Close modals when clicking backdrop
    window.addEventListener('click', (e) => {
        if (e.target === newTopicModal) closeNewTopicModal();
        if (e.target === driveArchiveModal) driveArchiveModal.classList.remove('open');
    });

    // =========================================================================
    // Search, Filter & Sort Event Handlers
    // =========================================================================
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchQuery = e.target.value;
            renderTopicsFeed();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            renderTopicsFeed();
        });
    }

    categoryPills.forEach(pill => {
        pill.addEventListener('click', () => {
            categoryPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentCategory = pill.getAttribute('data-category');
            renderTopicsFeed();
        });
    });

    // Check for Deep Link on Page Load (?topic=id or #topic-id)
    const checkUrlDeepLink = () => {
        const params = new URLSearchParams(window.location.search);
        const topicParam = params.get('topic');
        if (topicParam) {
            // Check if topic exists in allTopics; if loaded later, onValue will trigger it
            if (allTopics[topicParam]) {
                openTopic(topicParam);
            } else {
                activeTopicId = topicParam;
            }
        }
    };

    checkUrlDeepLink();

    // Helper: Escape HTML string
    function escapeHtml(text) {
        if (!text) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.toString().replace(/[&<>"']/g, m => map[m]);
    }
});
