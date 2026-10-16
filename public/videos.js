/**
 * RSBK Online - Video Hub Manager & Player (videos.js)
 * Comprehensive Digital Video Repository for Rasashastra & Bhaishajya Kalpana
 * Designed for UG & PG Students, Teachers, Doctors, and Everyone Passionate about Ayurveda.
 * Features: YouTube Player, Real-time Search, Categories, Likes, Pins, Watch Later, and Firebase Cloud Sync.
 * Copyright 2026 Suvarna Ayurveda.
 */

document.addEventListener('DOMContentLoaded', async () => {
    // DOM Elements
    const videosGrid = document.getElementById('videosGrid');
    const videosLoadingState = document.getElementById('videosLoadingState');
    const videosEmptyState = document.getElementById('videosEmptyState');
    const emptyStateHeading = document.getElementById('emptyStateHeading');
    const emptyStateDesc = document.getElementById('emptyStateDesc');
    const emptyStateResetBtn = document.getElementById('emptyStateResetBtn');
    const videoSearchInput = document.getElementById('videoSearchInput');
    const clearVideoSearch = document.getElementById('clearVideoSearch');
    const videoCategoryPills = document.querySelectorAll('.video-filter-pill');
    const videoCountBadge = document.getElementById('videoCountBadge');
    const videoSortSelect = document.getElementById('videoSortSelect');
    const videoToastContainer = document.getElementById('videoToastContainer');

    // Counts badges
    const countWatchLater = document.getElementById('countWatchLater');
    const countLiked = document.getElementById('countLiked');
    const countPinned = document.getElementById('countPinned');

    // Modal Player Elements
    const videoModal = document.getElementById('videoModal');
    const modalBackdrop = document.getElementById('modalBackdrop');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalIframeContainer = document.getElementById('modalIframeContainer');
    const modalVideoTitle = document.getElementById('modalVideoTitle');
    const modalVideoCategory = document.getElementById('modalVideoCategory');
    const modalVideoReference = document.getElementById('modalVideoReference');
    const modalVideoDesc = document.getElementById('modalVideoDesc');
    const modalOpenYouTubeBtn = document.getElementById('modalOpenYouTubeBtn');

    // Modal Action Buttons
    const modalLikeBtn = document.getElementById('modalLikeBtn');
    const modalLikeIcon = document.getElementById('modalLikeIcon');
    const modalLikeText = document.getElementById('modalLikeText');

    const modalSaveBtn = document.getElementById('modalSaveBtn');
    const modalSaveIcon = document.getElementById('modalSaveIcon');
    const modalSaveText = document.getElementById('modalSaveText');

    const modalPinBtn = document.getElementById('modalPinBtn');
    const modalPinIcon = document.getElementById('modalPinIcon');
    const modalPinText = document.getElementById('modalPinText');

    const modalShareBtn = document.getElementById('modalShareBtn');

    // State
    let builtInVideos = [];
    let customVideos = [];
    let allVideos = [];
    let currentFilter = 'all';
    let searchQuery = '';
    let currentSort = 'default';
    let currentActiveVideo = null;

    // User Interactive Sets
    let userLikedVideos = new Set();
    let userPinnedVideos = new Set();
    let userWatchLaterVideos = new Set();

    // -------------------------------------------------------------
    // 1. User Account & Interaction Persistence
    // -------------------------------------------------------------
    const getUserEmail = () => {
        return localStorage.getItem('rsbk_user_email') || 
               localStorage.getItem('rsbk_auth_email') || 
               'guest';
    };

    const getSanitizedEmail = (email) => {
        return (email || 'guest').replace(/[.#$\[\]]/g, '_');
    };

    const getStorageKey = (prefix) => {
        const email = getUserEmail();
        return email && email !== 'guest' ? `${prefix}_${getSanitizedEmail(email)}` : prefix;
    };

    const loadUserInteractions = () => {
        try {
            // Liked videos
            const rawLiked = localStorage.getItem(getStorageKey('rsbk_liked_videos')) || localStorage.getItem('rsbk_liked_videos');
            userLikedVideos = new Set(rawLiked ? JSON.parse(rawLiked) : []);

            // Pinned videos
            const rawPinned = localStorage.getItem(getStorageKey('rsbk_pinned_videos')) || localStorage.getItem('rsbk_pinned_videos');
            userPinnedVideos = new Set(rawPinned ? JSON.parse(rawPinned) : []);

            // Watch later videos
            const rawWatchLater = localStorage.getItem(getStorageKey('rsbk_watch_later_videos')) || localStorage.getItem('rsbk_watch_later_videos');
            userWatchLaterVideos = new Set(rawWatchLater ? JSON.parse(rawWatchLater) : []);
        } catch (e) {
            console.warn('Could not parse user interactions:', e);
        }
        updateCollectionCounts();
    };

    const saveUserInteractions = () => {
        try {
            const likedArr = Array.from(userLikedVideos);
            const pinnedArr = Array.from(userPinnedVideos);
            const watchLaterArr = Array.from(userWatchLaterVideos);

            // Save to localStorage
            const keyLiked = getStorageKey('rsbk_liked_videos');
            const keyPinned = getStorageKey('rsbk_pinned_videos');
            const keyWatchLater = getStorageKey('rsbk_watch_later_videos');

            localStorage.setItem(keyLiked, JSON.stringify(likedArr));
            localStorage.setItem(keyPinned, JSON.stringify(pinnedArr));
            localStorage.setItem(keyWatchLater, JSON.stringify(watchLaterArr));

            // Also save to generic key for offline fallback
            localStorage.setItem('rsbk_liked_videos', JSON.stringify(likedArr));
            localStorage.setItem('rsbk_pinned_videos', JSON.stringify(pinnedArr));
            localStorage.setItem('rsbk_watch_later_videos', JSON.stringify(watchLaterArr));

            // Sync to Firebase if user is logged in
            const email = getUserEmail();
            if (email && email !== 'guest' && window.firebaseDb && window.firebaseRef && window.firebaseSet) {
                const sEmail = getSanitizedEmail(email);
                const userVideosRef = window.firebaseRef(window.firebaseDb, `user_interactions/${sEmail}/videos`);
                window.firebaseSet(userVideosRef, {
                    liked: likedArr,
                    pinned: pinnedArr,
                    watchLater: watchLaterArr,
                    lastUpdated: new Date().toISOString()
                }).catch(err => console.warn('Firebase user videos sync notice:', err));
            }
        } catch (e) {
            console.warn('Error saving interactions:', e);
        }
        updateCollectionCounts();
    };

    const syncFirebaseUserInteractions = () => {
        const email = getUserEmail();
        if (email && email !== 'guest' && window.firebaseDb && window.firebaseRef && window.firebaseOnValue) {
            try {
                const sEmail = getSanitizedEmail(email);
                const userVideosRef = window.firebaseRef(window.firebaseDb, `user_interactions/${sEmail}/videos`);
                window.firebaseOnValue(userVideosRef, (snapshot) => {
                    const data = snapshot.val();
                    if (data && typeof data === 'object') {
                        if (Array.isArray(data.liked)) {
                            data.liked.forEach(id => userLikedVideos.add(id));
                        }
                        if (Array.isArray(data.pinned)) {
                            data.pinned.forEach(id => userPinnedVideos.add(id));
                        }
                        if (Array.isArray(data.watchLater)) {
                            data.watchLater.forEach(id => userWatchLaterVideos.add(id));
                        }
                        updateCollectionCounts();
                        renderVideos();
                    }
                });
            } catch (err) {
                console.warn('Firebase user interaction listener notice:', err);
            }
        }
    };

    const updateCollectionCounts = () => {
        if (countWatchLater) countWatchLater.textContent = userWatchLaterVideos.size;
        if (countLiked) countLiked.textContent = userLikedVideos.size;
        if (countPinned) countPinned.textContent = userPinnedVideos.size;
    };

    // Toast Feedback Notification
    const showToast = (message, iconName = 'checkmark-circle-outline', variant = 'success') => {
        if (!videoToastContainer) return;
        const toast = document.createElement('div');
        toast.className = `video-toast ${variant}`;
        toast.innerHTML = `
            <ion-icon name="${iconName}"></ion-icon>
            <span>${message}</span>
        `;
        videoToastContainer.appendChild(toast);
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 2600);
    };

    // Toggle Actions
    const toggleLike = (videoId) => {
        if (!videoId) return;
        const isLiked = userLikedVideos.has(videoId);
        if (isLiked) {
            userLikedVideos.delete(videoId);
            showToast('Removed from Liked Videos', 'heart-dislike-outline', 'heart');
        } else {
            userLikedVideos.add(videoId);
            showToast('Added to Liked Videos', 'heart', 'heart');
        }
        saveUserInteractions();
        updateModalActionStates();
        renderVideos();
    };

    const togglePin = (videoId) => {
        if (!videoId) return;
        const isPinned = userPinnedVideos.has(videoId);
        if (isPinned) {
            userPinnedVideos.delete(videoId);
            showToast('Video unpinned', 'pin-outline', 'pin');
        } else {
            userPinnedVideos.add(videoId);
            showToast('Video pinned to top', 'pin', 'pin');
        }
        saveUserInteractions();
        updateModalActionStates();
        renderVideos();
    };

    const toggleWatchLater = (videoId) => {
        if (!videoId) return;
        const isSaved = userWatchLaterVideos.has(videoId);
        if (isSaved) {
            userWatchLaterVideos.delete(videoId);
            showToast('Removed from Watch Later', 'bookmark-outline', 'success');
        } else {
            userWatchLaterVideos.add(videoId);
            showToast('Saved to Watch Later', 'bookmark', 'success');
        }
        saveUserInteractions();
        updateModalActionStates();
        renderVideos();
    };

    // -------------------------------------------------------------
    // 2. YouTube Helper Utilities
    // -------------------------------------------------------------
    const extractYouTubeId = (input) => {
        if (!input) return null;
        input = input.trim();
        if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
        const match = input.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const getYouTubeThumbnail = (videoId) => {
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    };

    // -------------------------------------------------------------
    // 3. Load Videos (Built-in JSON + LocalStorage + Firebase RTDB)
    // -------------------------------------------------------------
    const loadBuiltInVideos = async () => {
        try {
            const resp = await fetch('videos-data.json?v=' + Date.now());
            if (resp.ok) {
                builtInVideos = await resp.json();
            }
        } catch (e) {
            console.warn('Could not load videos-data.json, falling back:', e);
            builtInVideos = [];
        }
    };

    const loadCustomVideosLocal = () => {
        try {
            const raw = localStorage.getItem('rsbk_custom_videos');
            if (raw) {
                customVideos = JSON.parse(raw);
                if (!Array.isArray(customVideos)) customVideos = [];
            } else {
                customVideos = [];
            }
        } catch (e) {
            customVideos = [];
        }
    };

    const syncFirebaseCloudVideos = () => {
        if (window.firebaseDb && window.firebaseRef && window.firebaseOnValue) {
            try {
                const videosRef = window.firebaseRef(window.firebaseDb, 'videos');
                window.firebaseOnValue(videosRef, (snapshot) => {
                    const data = snapshot.val();
                    if (data && typeof data === 'object') {
                        const cloudList = Object.keys(data).map(key => ({
                            id: key,
                            ...data[key]
                        }));

                        const map = new Map();
                        customVideos.forEach(v => { if (v && v.id) map.set(v.id, v); });
                        cloudList.forEach(v => { if (v && v.id) map.set(v.id, v); });

                        customVideos = Array.from(map.values());
                        localStorage.setItem('rsbk_custom_videos', JSON.stringify(customVideos));
                        combineAndRender();
                    }
                });
            } catch (err) {
                console.warn('Firebase videos real-time sync notice:', err);
            }
        }
    };

    const combineAndRender = () => {
        const map = new Map();

        // 1. Add built-in videos
        builtInVideos.forEach(v => {
            if (v && v.id) {
                map.set(v.id, { ...v, isBuiltIn: true });
            }
        });

        // 2. Overlay / append custom videos (Admin-added)
        customVideos.forEach(v => {
            if (v && (v.id || v.youtubeId)) {
                const key = v.id || ('vid_custom_' + v.youtubeId);
                map.set(key, { ...v, isCustom: true });
            }
        });

        allVideos = Array.from(map.values());

        // Update total count badge
        if (videoCountBadge) {
            if (allVideos.length === 0) {
                videoCountBadge.textContent = 'Video Hub';
            } else if (allVideos.length === 1) {
                videoCountBadge.textContent = '1 Curated Video';
            } else {
                videoCountBadge.textContent = `${allVideos.length} Curated Videos`;
            }
        }

        renderVideos();
    };

    // -------------------------------------------------------------
    // 4. Filtering, Sorting & Rendering
    // -------------------------------------------------------------
    const getFilteredVideos = () => {
        let list = [...allVideos];

        // Filter by Category / Personal Collection Tab
        if (currentFilter !== 'all') {
            if (currentFilter === 'watch-later') {
                list = list.filter(v => userWatchLaterVideos.has(v.id) || userWatchLaterVideos.has(v.youtubeId));
            } else if (currentFilter === 'liked') {
                list = list.filter(v => userLikedVideos.has(v.id) || userLikedVideos.has(v.youtubeId));
            } else if (currentFilter === 'pinned') {
                list = list.filter(v => userPinnedVideos.has(v.id) || userPinnedVideos.has(v.youtubeId));
            } else if (currentFilter === 'custom') {
                list = list.filter(v => v.isCustom);
            } else {
                list = list.filter(v => v.category === currentFilter);
            }
        }

        // Filter by Search Query
        if (searchQuery) {
            const q = searchQuery.toLowerCase().trim();
            list = list.filter(v => {
                const title = (v.title || '').toLowerCase();
                const desc = (v.description || '').toLowerCase();
                const catLabel = (v.categoryLabel || '').toLowerCase();
                const refText = (v.reference || '').toLowerCase();
                const source = (v.source || '').toLowerCase();
                const channel = (v.channel || '').toLowerCase();
                const tags = Array.isArray(v.tags) ? v.tags.join(' ').toLowerCase() : '';
                return title.includes(q) || desc.includes(q) || catLabel.includes(q) || refText.includes(q) || tags.includes(q) || source.includes(q) || channel.includes(q);
            });
        }

        // Sorting Logic
        if (currentSort === 'az') {
            list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        } else if (currentSort === 'za') {
            list.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
        } else if (currentSort === 'newest') {
            list.sort((a, b) => new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0));
        } else {
            // Default & Pinned First: Pinned items float to the top, then original curriculum srNo order
            list.sort((a, b) => {
                const aPinned = (userPinnedVideos.has(a.id) || userPinnedVideos.has(a.youtubeId)) ? 1 : 0;
                const bPinned = (userPinnedVideos.has(b.id) || userPinnedVideos.has(b.youtubeId)) ? 1 : 0;
                if (aPinned !== bPinned) return bPinned - aPinned;
                return (a.srNo || 9999) - (b.srNo || 9999);
            });
        }

        return list;
    };

    const renderVideos = () => {
        if (videosLoadingState) videosLoadingState.style.display = 'none';

        const filtered = getFilteredVideos();

        if (filtered.length === 0) {
            if (videosGrid) videosGrid.style.display = 'none';
            if (videosEmptyState) {
                videosEmptyState.style.display = 'flex';
                
                if (currentFilter === 'watch-later') {
                    if (emptyStateHeading) emptyStateHeading.textContent = 'No Saved Videos in Watch Later';
                    if (emptyStateDesc) emptyStateDesc.innerHTML = 'You have not added any videos to your Watch Later list yet. Click the <strong>bookmark</strong> icon on any video card to save it here!';
                    if (emptyStateResetBtn) emptyStateResetBtn.style.display = 'none';
                } else if (currentFilter === 'liked') {
                    if (emptyStateHeading) emptyStateHeading.textContent = 'No Liked Videos Yet';
                    if (emptyStateDesc) emptyStateDesc.innerHTML = 'You have not liked any videos yet. Click the <strong>heart</strong> icon on any video card to add it to your Liked collection!';
                    if (emptyStateResetBtn) emptyStateResetBtn.style.display = 'none';
                } else if (currentFilter === 'pinned') {
                    if (emptyStateHeading) emptyStateHeading.textContent = 'No Pinned Videos';
                    if (emptyStateDesc) emptyStateDesc.innerHTML = 'You have not pinned any videos yet. Click the <strong>pin</strong> icon on any video card to keep your top lectures at the top!';
                    if (emptyStateResetBtn) emptyStateResetBtn.style.display = 'none';
                } else if (allVideos.length === 0) {
                    if (emptyStateHeading) emptyStateHeading.textContent = 'Curated Videos Coming Soon';
                    if (emptyStateDesc) emptyStateDesc.innerHTML = 'Educational videos and lectures are currently being added. Videos added via the <strong>Admin Panel</strong> will appear here automatically.';
                    if (emptyStateResetBtn) emptyStateResetBtn.style.display = 'none';
                } else {
                    if (emptyStateHeading) emptyStateHeading.textContent = 'No Matching Videos Found';
                    if (emptyStateDesc) emptyStateDesc.textContent = 'Try searching for a different drug name, formulation, or reset your category filter.';
                    if (emptyStateResetBtn) emptyStateResetBtn.style.display = 'inline-flex';
                }
            }
            return;
        }

        if (videosEmptyState) videosEmptyState.style.display = 'none';
        if (videosGrid) {
            videosGrid.style.display = 'grid';
            videosGrid.innerHTML = filtered.map(v => createVideoCardHtml(v)).join('');

            // Attach event listeners to card play actions
            videosGrid.querySelectorAll('.video-card-play-btn, .video-card-thumb, .video-thumb-overlay, .btn-watch-video').forEach(el => {
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    const card = el.closest('.video-card');
                    if (card) {
                        const vidId = card.getAttribute('data-video-id');
                        const videoObj = allVideos.find(x => x.id === vidId);
                        if (videoObj) openVideoModal(videoObj);
                    }
                });
            });

            // Attach Pin button listeners
            videosGrid.querySelectorAll('.btn-pin-card').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const vidId = btn.getAttribute('data-video-id');
                    togglePin(vidId);
                });
            });

            // Attach Watch Later button listeners
            videosGrid.querySelectorAll('.btn-save-card').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const vidId = btn.getAttribute('data-video-id');
                    toggleWatchLater(vidId);
                });
            });

            // Attach Like button listeners
            videosGrid.querySelectorAll('.btn-like-video').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const vidId = btn.getAttribute('data-video-id');
                    toggleLike(vidId);
                });
            });

            // Attach Share / Copy Link buttons
            videosGrid.querySelectorAll('.btn-share-video').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const url = btn.getAttribute('data-youtube-url') || window.location.href;
                    navigator.clipboard.writeText(url).then(() => {
                        const originalHtml = btn.innerHTML;
                        btn.innerHTML = `<ion-icon name="checkmark-outline"></ion-icon> Copied!`;
                        btn.classList.add('copied');
                        showToast('Video link copied to clipboard', 'checkmark-circle-outline', 'success');
                        setTimeout(() => {
                            btn.innerHTML = originalHtml;
                            btn.classList.remove('copied');
                        }, 2000);
                    }).catch(() => {
                        showToast('Video link: ' + url, 'link-outline', 'success');
                    });
                });
            });
        }
    };

    const createVideoCardHtml = (v) => {
        const thumbUrl = v.thumbnail || getYouTubeThumbnail(v.youtubeId);
        const durationHtml = v.duration ? `<span class="video-duration-badge"><ion-icon name="time-outline"></ion-icon> ${v.duration}</span>` : '';
        const customBadgeHtml = v.isCustom ? `<span class="badge-video-custom"><ion-icon name="star"></ion-icon> Added by Admin</span>` : '';
        
        const isPinned = userPinnedVideos.has(v.id) || userPinnedVideos.has(v.youtubeId);
        const isSaved = userWatchLaterVideos.has(v.id) || userWatchLaterVideos.has(v.youtubeId);
        const isLiked = userLikedVideos.has(v.id) || userLikedVideos.has(v.youtubeId);

        const pinnedBadgeHtml = isPinned ? `<span class="badge-video-pinned"><ion-icon name="pin"></ion-icon> Pinned</span>` : '';

        let catClass = 'cat-rasashastra';
        let catIcon = 'flask-outline';
        let catLabel = v.categoryLabel || 'Rasashastra';

        if (v.category === 'bhaishajya-kalpana') {
            catClass = 'cat-bhaishajya';
            catIcon = 'leaf-outline';
            catLabel = v.categoryLabel || 'Bhaishajya Kalpana';
        } else if (v.category === 'equipment') {
            catClass = 'cat-equipment';
            catIcon = 'construct-outline';
            catLabel = v.categoryLabel || 'Yantras & Testing';
        } else if (v.category === 'lectures') {
            catClass = 'cat-lectures';
            catIcon = 'school-outline';
            catLabel = v.categoryLabel || 'Theory & Lectures';
        }

        const tagsHtml = Array.isArray(v.tags) 
            ? v.tags.slice(0, 4).map(t => `<span class="video-tag-pill">${t}</span>`).join('')
            : '';

        return `
            <article class="video-card ${v.isCustom ? 'is-custom' : ''} ${isPinned ? 'is-pinned' : ''}" data-video-id="${v.id}" data-category="${v.category || 'rasashastra'}">
                <div class="video-card-thumb-wrapper" role="button" tabindex="0" title="Click to watch: ${v.title}">
                    <img src="${thumbUrl}" alt="${v.title}" class="video-card-thumb" loading="lazy" onerror="this.src='https://img.youtube.com/vi/${v.youtubeId}/0.jpg'">
                    <div class="video-thumb-overlay">
                        <div class="video-card-play-btn" aria-label="Play Video">
                            <ion-icon name="play"></ion-icon>
                        </div>
                    </div>
                    
                    <!-- Floating Quick Actions: Pin & Watch Later -->
                    <div class="video-card-top-actions">
                        <button class="btn-card-quick-action btn-pin-card ${isPinned ? 'active' : ''}" type="button" title="${isPinned ? 'Unpin video' : 'Pin to top'}" data-video-id="${v.id}">
                            <ion-icon name="${isPinned ? 'pin' : 'pin-outline'}"></ion-icon>
                        </button>
                        <button class="btn-card-quick-action btn-save-card ${isSaved ? 'active' : ''}" type="button" title="${isSaved ? 'Remove from Watch Later' : 'Save to Watch Later'}" data-video-id="${v.id}">
                            <ion-icon name="${isSaved ? 'bookmark' : 'bookmark-outline'}"></ion-icon>
                        </button>
                    </div>

                    ${durationHtml}
                    ${pinnedBadgeHtml}
                    ${customBadgeHtml}
                </div>

                <div class="video-card-body">
                    <div class="video-meta-row">
                        <span class="video-category-badge ${catClass}">
                            <ion-icon name="${catIcon}"></ion-icon> ${catLabel}
                        </span>
                        ${v.reference ? `<span class="video-reference-badge" title="Classical Source"><ion-icon name="bookmark-outline"></ion-icon> ${v.reference}</span>` : ''}
                    </div>

                    <h3 class="video-card-title" title="${v.title}">${v.title}</h3>
                    
                    <p class="video-card-desc">${v.description || 'Curated educational video session and demonstration for Ayurvedic pharmaceutical sciences.'}</p>

                    ${tagsHtml ? `<div class="video-tags-row">${tagsHtml}</div>` : ''}

                    <div class="video-card-footer">
                        <span class="video-source-text" title="${v.channel || v.source || 'Curated Academic Source'}">
                            <ion-icon name="videocam-outline"></ion-icon> ${v.channel || v.source || 'Curated Academic Source'}
                        </span>
                        <div class="video-card-actions">
                            <button class="btn-like-video ${isLiked ? 'active' : ''}" type="button" title="${isLiked ? 'Unlike' : 'Like video'}" data-video-id="${v.id}">
                                <ion-icon name="${isLiked ? 'heart' : 'heart-outline'}"></ion-icon>
                                <span class="like-label">${isLiked ? 'Liked' : 'Like'}</span>
                            </button>
                            <button class="btn-share-video" type="button" title="Copy YouTube Link" data-youtube-url="${v.youtubeUrl || ('https://youtu.be/' + v.youtubeId)}">
                                <ion-icon name="share-social-outline"></ion-icon>
                            </button>
                            <button class="btn-watch-video" type="button">
                                <ion-icon name="play-outline"></ion-icon>
                                <span>Watch</span>
                            </button>
                        </div>
                    </div>
                </div>
            </article>
        `;
    };

    // -------------------------------------------------------------
    // 5. Modal Video Player & In-Modal Interaction
    // -------------------------------------------------------------
    const updateModalActionStates = () => {
        if (!currentActiveVideo) return;
        const vidId = currentActiveVideo.id;
        const ytId = currentActiveVideo.youtubeId;

        const isLiked = userLikedVideos.has(vidId) || userLikedVideos.has(ytId);
        const isSaved = userWatchLaterVideos.has(vidId) || userWatchLaterVideos.has(ytId);
        const isPinned = userPinnedVideos.has(vidId) || userPinnedVideos.has(ytId);

        if (modalLikeBtn) {
            modalLikeBtn.className = `btn btn-secondary btn-sm ${isLiked ? 'active text-rose-500' : ''}`;
            if (modalLikeIcon) modalLikeIcon.setAttribute('name', isLiked ? 'heart' : 'heart-outline');
            if (modalLikeText) modalLikeText.textContent = isLiked ? 'Liked' : 'Like';
        }

        if (modalSaveBtn) {
            modalSaveBtn.className = `btn btn-secondary btn-sm ${isSaved ? 'active text-emerald-600' : ''}`;
            if (modalSaveIcon) modalSaveIcon.setAttribute('name', isSaved ? 'bookmark' : 'bookmark-outline');
            if (modalSaveText) modalSaveText.textContent = isSaved ? 'Saved' : 'Watch Later';
        }

        if (modalPinBtn) {
            modalPinBtn.className = `btn btn-secondary btn-sm ${isPinned ? 'active text-amber-500' : ''}`;
            if (modalPinIcon) modalPinIcon.setAttribute('name', isPinned ? 'pin' : 'pin-outline');
            if (modalPinText) modalPinText.textContent = isPinned ? 'Pinned' : 'Pin';
        }
    };

    const openVideoModal = (v) => {
        if (!videoModal || !modalIframeContainer) return;
        currentActiveVideo = v;

        const ytId = v.youtubeId || extractYouTubeId(v.youtubeUrl);
        if (!ytId) {
            alert('Invalid video ID or URL.');
            return;
        }

        // Populate details
        if (modalVideoTitle) modalVideoTitle.textContent = v.title || 'Educational Video Session';
        if (modalVideoCategory) modalVideoCategory.textContent = v.categoryLabel || 'Rasashastra & Bhaishajya Kalpana';
        if (modalVideoReference) modalVideoReference.textContent = v.reference ? `Reference: ${v.reference}` : '';
        if (modalVideoDesc) modalVideoDesc.textContent = v.description || '';
        if (modalOpenYouTubeBtn) {
            modalOpenYouTubeBtn.href = v.youtubeUrl || `https://www.youtube.com/watch?v=${ytId}`;
        }

        updateModalActionStates();

        // Mount Privacy-Enhanced YouTube Embed with Autoplay
        modalIframeContainer.innerHTML = `
            <iframe 
                src="https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1" 
                title="${v.title || 'RSBK Video Session'}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowfullscreen>
            </iframe>
        `;

        videoModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeVideoModal = () => {
        if (!videoModal || !modalIframeContainer) return;
        videoModal.classList.remove('active');
        modalIframeContainer.innerHTML = ''; // Stop video audio instantly
        document.body.style.overflow = '';
        currentActiveVideo = null;
    };

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeVideoModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeVideoModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && videoModal && videoModal.classList.contains('active')) {
            closeVideoModal();
        }
    });

    // In-Modal Actions
    if (modalLikeBtn) {
        modalLikeBtn.addEventListener('click', () => {
            if (currentActiveVideo) toggleLike(currentActiveVideo.id);
        });
    }

    if (modalSaveBtn) {
        modalSaveBtn.addEventListener('click', () => {
            if (currentActiveVideo) toggleWatchLater(currentActiveVideo.id);
        });
    }

    if (modalPinBtn) {
        modalPinBtn.addEventListener('click', () => {
            if (currentActiveVideo) togglePin(currentActiveVideo.id);
        });
    }

    if (modalShareBtn) {
        modalShareBtn.addEventListener('click', () => {
            if (currentActiveVideo) {
                const url = currentActiveVideo.youtubeUrl || `https://www.youtube.com/watch?v=${currentActiveVideo.youtubeId}`;
                navigator.clipboard.writeText(url).then(() => {
                    showToast('Video link copied to clipboard', 'checkmark-circle-outline', 'success');
                }).catch(() => {
                    showToast('Video link: ' + url, 'link-outline', 'success');
                });
            }
        });
    }

    // -------------------------------------------------------------
    // 6. Search & Filter Interactions
    // -------------------------------------------------------------
    if (videoSearchInput) {
        videoSearchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.trim();
            if (clearVideoSearch) {
                clearVideoSearch.style.display = searchQuery ? 'block' : 'none';
            }
            renderVideos();
        });
    }

    if (clearVideoSearch) {
        clearVideoSearch.addEventListener('click', () => {
            if (videoSearchInput) {
                videoSearchInput.value = '';
                searchQuery = '';
                clearVideoSearch.style.display = 'none';
                videoSearchInput.focus();
                renderVideos();
            }
        });
    }

    videoCategoryPills.forEach(pill => {
        pill.addEventListener('click', () => {
            videoCategoryPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentFilter = pill.getAttribute('data-filter') || 'all';
            renderVideos();
        });
    });

    if (videoSortSelect) {
        videoSortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            renderVideos();
        });
    }

    // -------------------------------------------------------------
    // 7. Deep Linking via URL Query Parameters
    // -------------------------------------------------------------
    const handleUrlQueryParams = () => {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Search param
        const qParam = urlParams.get('search') || urlParams.get('q');
        if (qParam && videoSearchInput) {
            videoSearchInput.value = qParam;
            searchQuery = qParam;
            if (clearVideoSearch) clearVideoSearch.style.display = 'block';
        }

        // Category param
        const catParam = urlParams.get('cat') || urlParams.get('category');
        if (catParam) {
            const targetPill = document.querySelector(`.video-filter-pill[data-filter="${catParam}"]`);
            if (targetPill) {
                videoCategoryPills.forEach(p => p.classList.remove('active'));
                targetPill.classList.add('active');
                currentFilter = catParam;
            }
        }

        // Direct Video Play param
        const vidParam = urlParams.get('v') || urlParams.get('id');
        if (vidParam) {
            setTimeout(() => {
                const targetVid = allVideos.find(x => x.id === vidParam || x.youtubeId === vidParam);
                if (targetVid) openVideoModal(targetVid);
            }, 500);
        }
    };

    // -------------------------------------------------------------
    // 8. Bootstrap Video Hub Initialization
    // -------------------------------------------------------------
    loadUserInteractions();
    loadCustomVideosLocal();
    await loadBuiltInVideos();
    combineAndRender();
    handleUrlQueryParams();

    // Secondary Real-time Sync
    syncFirebaseCloudVideos();
    syncFirebaseUserInteractions();
});
