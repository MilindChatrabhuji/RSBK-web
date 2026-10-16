/**
 * RSBK Online - Video Hub Manager & Player (videos.js)
 * Visual Learning, Practical SOPs & Expert Lectures for Rasashastra & Bhaishajya Kalpana
 * Designed for UG & PG Students, Teachers, Doctors, and Everyone Passionate about Ayurveda.
 * Copyright 2026 Suvarna Ayurveda.
 */

document.addEventListener('DOMContentLoaded', async () => {
    // DOM Elements
    const videosGrid = document.getElementById('videosGrid');
    const videosLoadingState = document.getElementById('videosLoadingState');
    const videosEmptyState = document.getElementById('videosEmptyState');
    const videoSearchInput = document.getElementById('videoSearchInput');
    const clearVideoSearch = document.getElementById('clearVideoSearch');
    const videoCategoryPills = document.querySelectorAll('.video-filter-pill');
    const videoCountBadge = document.getElementById('videoCountBadge');
    const videoSortSelect = document.getElementById('videoSortSelect');

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

    // State
    let builtInVideos = [];
    let customVideos = [];
    let allVideos = [];
    let currentFilter = 'all';
    let searchQuery = '';
    let currentSort = 'default';

    // -------------------------------------------------------------
    // 1. YouTube Helper Utilities
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
    // 2. Load Videos (Built-in JSON + LocalStorage + Firebase RTDB)
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
        // Check if Firebase Realtime Database is accessible
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

                        // Merge cloud list with local custom videos
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
        allVideos.sort((a, b) => (a.srNo || 9999) - (b.srNo || 9999));

        // Update total count badge
        if (videoCountBadge) {
            if (allVideos.length === 0) {
                videoCountBadge.textContent = 'Video Hub';
            } else if (allVideos.length === 1) {
                videoCountBadge.textContent = '1 Practical Video';
            } else {
                videoCountBadge.textContent = `${allVideos.length} Practical Videos`;
            }
        }

        renderVideos();
    };

    // -------------------------------------------------------------
    // 3. Filtering, Sorting & Rendering
    // -------------------------------------------------------------
    const getFilteredVideos = () => {
        let list = [...allVideos];

        // Filter by Category Tab
        if (currentFilter !== 'all') {
            if (currentFilter === 'custom') {
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
                const tags = Array.isArray(v.tags) ? v.tags.join(' ').toLowerCase() : '';
                return title.includes(q) || desc.includes(q) || catLabel.includes(q) || refText.includes(q) || tags.includes(q) || source.includes(q);
            });
        }

        // Sorting
        if (currentSort === 'az') {
            list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        } else if (currentSort === 'za') {
            list.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
        } else if (currentSort === 'newest') {
            list.sort((a, b) => new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0));
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
                const emptyHeading = videosEmptyState.querySelector('h3');
                const emptyDesc = videosEmptyState.querySelector('p');
                const emptyBtn = videosEmptyState.querySelector('button');
                if (allVideos.length === 0) {
                    if (emptyHeading) emptyHeading.textContent = 'Curated Video Demonstrations Coming Soon';
                    if (emptyDesc) emptyDesc.innerHTML = 'YouTube practical demonstrations and lectures are currently being added. Videos added via the <strong>Admin Panel</strong> will appear here automatically.';
                    if (emptyBtn) emptyBtn.style.display = 'none';
                } else {
                    if (emptyHeading) emptyHeading.textContent = 'No Matching Videos Found';
                    if (emptyDesc) emptyDesc.textContent = 'Try searching for a different drug name, classical process, or reset your category filter.';
                    if (emptyBtn) emptyBtn.style.display = 'inline-flex';
                }
            }
            return;
        }

        if (videosEmptyState) videosEmptyState.style.display = 'none';
        if (videosGrid) {
            videosGrid.style.display = 'grid';
            videosGrid.innerHTML = filtered.map(v => createVideoCardHtml(v)).join('');

            // Attach event listeners to card play actions
            videosGrid.querySelectorAll('.video-card-play-btn, .video-card-thumb-wrapper, .btn-watch-video').forEach(el => {
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
                        setTimeout(() => {
                            btn.innerHTML = originalHtml;
                            btn.classList.remove('copied');
                        }, 2000);
                    }).catch(() => {
                        alert('Video link: ' + url);
                    });
                });
            });
        }
    };

    const createVideoCardHtml = (v) => {
        const thumbUrl = v.thumbnail || getYouTubeThumbnail(v.youtubeId);
        const durationHtml = v.duration ? `<span class="video-duration-badge"><ion-icon name="time-outline"></ion-icon> ${v.duration}</span>` : '';
        const customBadgeHtml = v.isCustom ? `<span class="badge-video-custom"><ion-icon name="star"></ion-icon> Added by Admin</span>` : '';
        
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
            <article class="video-card ${v.isCustom ? 'is-custom' : ''}" data-video-id="${v.id}" data-category="${v.category || 'rasashastra'}">
                <div class="video-card-thumb-wrapper" role="button" tabindex="0" title="Click to watch: ${v.title}">
                    <img src="${thumbUrl}" alt="${v.title}" class="video-card-thumb" loading="lazy" onerror="this.src='https://img.youtube.com/vi/${v.youtubeId}/0.jpg'">
                    <div class="video-thumb-overlay">
                        <div class="video-card-play-btn" aria-label="Play Video">
                            <ion-icon name="play"></ion-icon>
                        </div>
                    </div>
                    ${durationHtml}
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
                    
                    <p class="video-card-desc">${v.description || 'Authentic practical laboratory demonstration and standard operating procedure for Ayurvedic pharmaceutics.'}</p>

                    ${tagsHtml ? `<div class="video-tags-row">${tagsHtml}</div>` : ''}

                    <div class="video-card-footer">
                        <span class="video-source-text">
                            <ion-icon name="videocam-outline"></ion-icon> ${v.source || 'Curated Academic Demonstration'}
                        </span>
                        <div class="video-card-actions">
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
    // 4. Modal Video Player
    // -------------------------------------------------------------
    const openVideoModal = (v) => {
        if (!videoModal || !modalIframeContainer) return;

        const ytId = v.youtubeId || extractYouTubeId(v.youtubeUrl);
        if (!ytId) {
            alert('Invalid video ID or URL.');
            return;
        }

        // Populate details
        if (modalVideoTitle) modalVideoTitle.textContent = v.title || 'Practical Demonstration';
        if (modalVideoCategory) modalVideoCategory.textContent = v.categoryLabel || 'Rasashastra & Bhaishajya Kalpana';
        if (modalVideoReference) modalVideoReference.textContent = v.reference ? `Reference: ${v.reference}` : '';
        if (modalVideoDesc) modalVideoDesc.textContent = v.description || '';
        if (modalOpenYouTubeBtn) {
            modalOpenYouTubeBtn.href = v.youtubeUrl || `https://www.youtube.com/watch?v=${ytId}`;
        }

        // Mount Privacy-Enhanced YouTube Embed with Autoplay
        modalIframeContainer.innerHTML = `
            <iframe 
                src="https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1" 
                title="${v.title || 'RSBK Video Demonstration'}" 
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
    };

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeVideoModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeVideoModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && videoModal && videoModal.classList.contains('active')) {
            closeVideoModal();
        }
    });

    // -------------------------------------------------------------
    // 5. Search & Filter Interactions
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
    // 6. Deep Linking via URL Query Parameters
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
    // 7. Initialize
    // -------------------------------------------------------------
    await loadBuiltInVideos();
    loadCustomVideosLocal();
    combineAndRender();
    handleUrlQueryParams();

    // Trigger Firebase cloud sync after initial load
    setTimeout(syncFirebaseCloudVideos, 1000);
});
