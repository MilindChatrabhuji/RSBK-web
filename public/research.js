/**
 * RSBK Online - Research & Evidence Hub Manager (research.js v2.0)
 * Digital PDF Repository for Rasashastra & Bhaishajya Kalpana
 * - Anyone can upload & add PDF research articles directly to the dedicated Google Drive backend.
 * - Articles are synced in Realtime via Firebase Realtime Database.
 * - Only administrators can remove / delete articles.
 * - Features: Google Drive PDF Storage, In-Website PDF Reader Modal, Citation Generator (APA/Vancouver),
 *             Live Search, Category Filters, and Personal Reading List Bookmarking.
 * Copyright 2026 Suvarna Ayurveda.
 */

document.addEventListener('DOMContentLoaded', async () => {
    // -------------------------------------------------------------
    // 1. Configuration & Endpoints
    // -------------------------------------------------------------
    const GOOGLE_DRIVE_UPLOAD_ENDPOINT = 'https://script.google.com/macros/s/AKfycbythI1dm3szewe6sbnsA6M7gIfyLdNGAhPEvWIbFbniSOCJEU4KoUQ_zVDQnzS-3-1gpw/exec';
    const GOOGLE_DRIVE_FOLDER_LINK = 'https://drive.google.com/drive/folders/1F-H-eGDWWiiAybYM9oXAh6Xnocuuhdj6?usp=sharing';

    const ADMIN_EMAILS = [
        'dr.milindchatrabhuji@gmail.com',
        'milind.chatrabhuji@gmail.com'
    ];

    const checkIsAdmin = (email) => {
        if (!email) return false;
        const e = email.toLowerCase().trim();
        return ADMIN_EMAILS.includes(e) || localStorage.getItem('rsbk_is_admin') === 'true';
    };

    const getUserEmail = () => {
        return (localStorage.getItem('rsbk_user_email') || 
                localStorage.getItem('rsbk_auth_email') || 
                'guest').toLowerCase().trim();
    };

    const getUserDisplayName = () => {
        return localStorage.getItem('rsbk_user_name') || 'Ayurveda Researcher';
    };

    // -------------------------------------------------------------
    // 2. DOM Elements
    // -------------------------------------------------------------
    const researchGrid = document.getElementById('researchGrid');
    const researchLoadingState = document.getElementById('researchLoadingState');
    const researchEmptyState = document.getElementById('researchEmptyState');
    const emptyStateHeading = document.getElementById('emptyStateHeading');
    const emptyStateDesc = document.getElementById('emptyStateDesc');
    const researchSearchInput = document.getElementById('researchSearchInput');
    const clearResearchSearch = document.getElementById('clearResearchSearch');
    const categoryFilterPills = document.querySelectorAll('.research-filter-pill');
    const researchCountBadge = document.getElementById('researchCountBadge');
    const researchSortSelect = document.getElementById('researchSortSelect');
    const researchToastContainer = document.getElementById('researchToastContainer');
    const countReadingList = document.getElementById('countReadingList');

    // Add Article Modal & Form Elements
    const addArticleModal = document.getElementById('addArticleModal');
    const btnOpenAddArticleModal = document.getElementById('btnOpenAddArticleModal');
    const addArticleForm = document.getElementById('addArticleForm');
    const pdfDropZone = document.getElementById('pdfDropZone');
    const articlePdfInput = document.getElementById('articlePdfInput');
    const selectedPdfCard = document.getElementById('selectedPdfCard');
    const selectedPdfName = document.getElementById('selectedPdfName');
    const selectedPdfSize = document.getElementById('selectedPdfSize');
    const btnRemoveSelectedPdf = document.getElementById('btnRemoveSelectedPdf');
    const uploadProgressWrapper = document.getElementById('uploadProgressWrapper');
    const uploadProgressBar = document.getElementById('uploadProgressBar');
    const uploadStatusText = document.getElementById('uploadStatusText');
    const btnSubmitAddArticle = document.getElementById('btnSubmitAddArticle');

    // PDF Viewer Modal Elements
    const pdfViewerModal = document.getElementById('pdfViewerModal');
    const viewerModalTitle = document.getElementById('viewerModalTitle');
    const viewerAuthorsJournal = document.getElementById('viewerAuthorsJournal');
    const viewerCategoryBadge = document.getElementById('viewerCategoryBadge');
    const viewerDriveExternalBtn = document.getElementById('viewerDriveExternalBtn');
    const viewerDownloadBtn = document.getElementById('viewerDownloadBtn');
    const pdfViewerIframe = document.getElementById('pdfViewerIframe');

    // Citation Modal Elements
    const citationModal = document.getElementById('citationModal');
    const citationModalTitle = document.getElementById('citationModalTitle');
    const citationVancouverText = document.getElementById('citationVancouverText');
    const citationApaText = document.getElementById('citationApaText');
    const btnCopyVancouver = document.getElementById('btnCopyVancouver');
    const btnCopyApa = document.getElementById('btnCopyApa');

    // State Variables
    let allArticles = [];
    let userSavedResearch = new Set();
    let currentFilter = 'all';
    let searchQuery = '';
    let currentSort = 'newest';
    let pendingPdfFile = null;

    // Check Admin Privileges
    let currentUserEmail = getUserEmail();
    let isUserAdmin = checkIsAdmin(currentUserEmail);

    // -------------------------------------------------------------
    // 3. User Saved Reading List Persistence
    // -------------------------------------------------------------
    const getSanitizedEmail = (email) => (email || 'guest').replace(/[.#$\[\]]/g, '_');
    const getStorageKey = (prefix) => {
        const email = getUserEmail();
        return email && email !== 'guest' ? `${prefix}_${getSanitizedEmail(email)}` : prefix;
    };

    const loadUserSavedResearch = () => {
        try {
            const rawSaved = localStorage.getItem(getStorageKey('rsbk_saved_research')) || 
                             localStorage.getItem('rsbk_saved_research');
            let list = rawSaved ? JSON.parse(rawSaved) : [];
            userSavedResearch = new Set(list);
        } catch (e) {
            console.error('Error loading saved research list:', e);
            userSavedResearch = new Set();
        }
        updateCountsBadge();
    };

    const persistUserSavedResearch = () => {
        try {
            const payload = JSON.stringify(Array.from(userSavedResearch));
            localStorage.setItem(getStorageKey('rsbk_saved_research'), payload);
            localStorage.setItem('rsbk_saved_research', payload);
        } catch (e) {
            console.error('Error persisting saved research list:', e);
        }
        updateCountsBadge();
    };

    const updateCountsBadge = () => {
        if (countReadingList) {
            countReadingList.textContent = userSavedResearch.size;
        }
    };

    // -------------------------------------------------------------
    // 4. Toast Notification Utility
    // -------------------------------------------------------------
    const showToast = (message, type = 'info', duration = 3500) => {
        if (!researchToastContainer) return;

        const toast = document.createElement('div');
        toast.className = `research-toast ${type}`;
        
        let iconName = 'information-circle-outline';
        if (type === 'success') iconName = 'checkmark-circle-outline';
        if (type === 'bookmark') iconName = 'bookmark-outline';
        if (type === 'copy') iconName = 'copy-outline';
        if (type === 'error') iconName = 'alert-circle-outline';

        toast.innerHTML = `
            <ion-icon name="${iconName}"></ion-icon>
            <span class="toast-message">${message}</span>
        `;

        researchToastContainer.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 300);
        }, duration);
    };

    // Format File Size
    const formatFileSize = (bytes) => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    // -------------------------------------------------------------
    // 5. Google Drive PDF Upload Helpers
    // -------------------------------------------------------------
    const readFileAsBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const res = reader.result;
                const base64 = res.split(',')[1];
                resolve(base64);
            };
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(file);
        });
    };

    const uploadPdfToGoogleDrive = async (file, onProgress) => {
        if (onProgress) onProgress(20, 'Reading PDF document into memory...');
        const base64 = await readFileAsBase64(file);

        if (onProgress) onProgress(50, "Uploading PDF document...");
        const payload = {
            fileName: file.name,
            mimeType: 'application/pdf',
            base64: base64,
            folderName: 'RSBK_Research_Articles'
        };

        const response = await fetch(GOOGLE_DRIVE_UPLOAD_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify(payload)
        });

        if (onProgress) onProgress(85, 'Securing Google Drive view & preview permissions...');
        const data = await response.json();

        if (data.status !== 'success') {
            throw new Error(data.message || 'Failed to upload PDF file to Google Drive');
        }

        return {
            driveFileId: data.fileId,
            driveViewUrl: data.viewUrl || `https://drive.google.com/file/d/${data.fileId}/view?usp=sharing`,
            drivePreviewUrl: data.previewUrl || `https://drive.google.com/file/d/${data.fileId}/preview`,
            driveDownloadUrl: data.downloadUrl || `https://drive.google.com/uc?export=download&id=${data.fileId}`,
            fileSize: data.size || file.size,
            fileName: data.fileName || file.name
        };
    };

    // -------------------------------------------------------------
    // 6. Category Badges & Helpers
    // -------------------------------------------------------------
    const getCategoryLabel = (category) => {
        switch (category) {
            case 'analytical': return 'Analytical & Standardization';
            case 'toxicology': return 'Safety & Toxicology';
            case 'nanomedicine': return 'Nanomedicine & Bhasma';
            case 'reviews': return 'Systematic Review';
            case 'formulations': return 'Formulations & SOP';
            case 'clinical': return 'Clinical Evidence';
            default: return 'Research Article';
        }
    };

    const getCategoryBadgeClass = (category) => {
        switch (category) {
            case 'analytical': return 'cat-analytical';
            case 'toxicology': return 'cat-toxicology';
            case 'nanomedicine': return 'cat-nanomedicine';
            case 'reviews': return 'cat-reviews';
            case 'formulations': return 'cat-formulations';
            case 'clinical': return 'cat-clinical';
            default: return 'cat-default';
        }
    };

    // -------------------------------------------------------------
    // 7. Render Research Articles Grid
    // -------------------------------------------------------------
    const renderResearchCards = (articles) => {
        if (!researchGrid) return;

        if (articles.length === 0) {
            researchGrid.style.display = 'none';
            if (researchEmptyState) {
                researchEmptyState.style.display = 'flex';
                if (currentFilter === 'reading-list') {
                    emptyStateHeading.textContent = 'Your Reading List is Empty';
                    emptyStateDesc.textContent = 'Bookmark research articles using the bookmark icon on any paper card to save them here for quick study.';
                } else if (searchQuery) {
                    emptyStateHeading.textContent = 'No Matching Research Articles Found';
                    emptyStateDesc.textContent = `No articles matched "${searchQuery}". Try searching for another drug, author, or reset your filters.`;
                } else {
                    emptyStateHeading.textContent = 'No Research Articles Added Yet';
                    emptyStateDesc.textContent = 'Be the first to enrich our academic repository! Contribute research papers, thesis publications, review articles, or analytical studies in RSBK to help students, researchers, teachers, and clinicians worldwide.';
                }
            }
            return;
        }

        if (researchEmptyState) researchEmptyState.style.display = 'none';
        researchGrid.style.display = 'grid';

        // Re-check admin status in case auth updated
        isUserAdmin = checkIsAdmin(getUserEmail());

        researchGrid.innerHTML = articles.map(article => {
            const isSaved = userSavedResearch.has(article.id);
            const methodsBadges = (article.methods || []).map(m => `<span class="method-badge">${m}</span>`).join('');
            const fileSizeDisplay = article.pdfFileSize ? formatFileSize(article.pdfFileSize) : 'PDF Document';
            
            // Clean abstract snippet
            let snippet = article.abstract || 'Full-text research article PDF available in repository. Click "Read PDF" to view in the in-website reader.';
            if (snippet.length > 200) snippet = snippet.substring(0, 195) + '...';

            return `
                <article class="research-card" data-id="${article.id}">
                    <div class="research-card-header">
                        <span class="research-badge-category ${getCategoryBadgeClass(article.category)}">
                            ${getCategoryLabel(article.category)}
                        </span>
                        <div class="header-pills-right">
                            <span class="research-badge-year">${article.year || new Date(article.createdAt || Date.now()).getFullYear()}</span>
                            <span class="research-badge-pdf" title="Full-text PDF document">
                                <ion-icon name="document-text"></ion-icon> ${fileSizeDisplay}
                            </span>
                        </div>
                    </div>

                    <h3 class="research-card-title">
                        <a href="javascript:void(0);" class="paper-title-link" data-id="${article.id}">
                            ${article.title}
                        </a>
                    </h3>

                    <div class="research-card-authors">
                        <ion-icon name="people-outline"></ion-icon>
                        <span>${article.authors}</span>
                    </div>

                    <div class="research-card-journal">
                        <ion-icon name="journal-outline"></ion-icon>
                        <em>${article.journal}</em> ${article.volume ? `&middot; <strong>${article.volume}</strong>` : ''}
                    </div>

                    ${methodsBadges ? `<div class="research-methods-row">${methodsBadges}</div>` : ''}

                    <p class="research-card-snippet">
                        ${snippet}
                    </p>

                    <div class="research-card-uploader-tag">
                        <ion-icon name="cloud-done-outline"></ion-icon>
                        <span>Uploaded by: <strong>${article.uploaderName || 'Ayurveda Researcher'}</strong></span>
                    </div>

                    <div class="research-card-actions">
                        <button class="btn-research-action btn-read-pdf" data-id="${article.id}" type="button" title="Read PDF Document inside website viewer">
                            <ion-icon name="eye-outline"></ion-icon> Read PDF
                        </button>
                        <a href="${article.driveViewUrl || '#'}" target="_blank" rel="noopener noreferrer" class="btn-research-action btn-drive-ext" title="Open PDF in new tab">
                            <ion-icon name="open-outline"></ion-icon> Open
                        </a>
                        <button class="btn-research-action btn-cite" data-id="${article.id}" type="button" title="Generate APA & Vancouver Citations">
                            <ion-icon name="quote-outline"></ion-icon> Cite
                        </button>
                        <button class="btn-research-action btn-save ${isSaved ? 'active' : ''}" data-id="${article.id}" type="button" title="${isSaved ? 'Remove from Reading List' : 'Save to Reading List'}">
                            <ion-icon name="${isSaved ? 'bookmark' : 'bookmark-outline'}"></ion-icon>
                            <span class="save-label">${isSaved ? 'Saved' : 'Save'}</span>
                        </button>

                        ${isUserAdmin ? `
                        <button class="btn-research-action btn-delete-article" data-id="${article.id}" type="button" title="Administrator Only: Delete this article">
                            <ion-icon name="trash-outline"></ion-icon>
                        </button>
                        ` : ''}
                    </div>
                </article>
            `;
        }).join('');

        attachCardListeners();
    };

    // -------------------------------------------------------------
    // 8. Card Action Listeners
    // -------------------------------------------------------------
    const attachCardListeners = () => {
        // Title click & Read PDF button -> Open PDF Viewer Modal
        document.querySelectorAll('.paper-title-link, .btn-read-pdf').forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                const id = el.dataset.id;
                openPdfViewerModal(id);
            });
        });

        // Cite button
        document.querySelectorAll('.btn-cite').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                openCitationModal(id);
            });
        });

        // Save / Bookmark button
        document.querySelectorAll('.btn-save').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                toggleSaveResearch(id, btn);
            });
        });

        // Admin Delete Button (Only active for Admin)
        document.querySelectorAll('.btn-delete-article').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                await handleAdminDeleteArticle(id);
            });
        });
    };

    // -------------------------------------------------------------
    // 9. Filtering & Sorting Logic
    // -------------------------------------------------------------
    const filterAndSortArticles = () => {
        let results = [...allArticles];

        // 1. Category Filter
        if (currentFilter === 'reading-list') {
            results = results.filter(p => userSavedResearch.has(p.id));
        } else if (currentFilter !== 'all') {
            results = results.filter(p => p.category === currentFilter);
        }

        // 2. Search Query Filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            results = results.filter(p => {
                const matchTitle = (p.title || '').toLowerCase().includes(q);
                const matchAuthors = (p.authors || '').toLowerCase().includes(q);
                const matchJournal = (p.journal || '').toLowerCase().includes(q);
                const matchAbstract = (p.abstract || '').toLowerCase().includes(q);
                const matchUploader = (p.uploaderName || '').toLowerCase().includes(q);
                const matchMethods = (p.methods || []).some(m => m.toLowerCase().includes(q));
                return matchTitle || matchAuthors || matchJournal || matchAbstract || matchUploader || matchMethods;
            });
        }

        // 3. Sorting
        switch (currentSort) {
            case 'year-new':
                results.sort((a, b) => (b.year || 0) - (a.year || 0));
                break;
            case 'year-old':
                results.sort((a, b) => (a.year || 0) - (b.year || 0));
                break;
            case 'az':
                results.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
                break;
            case 'journal':
                results.sort((a, b) => (a.journal || '').localeCompare(b.journal || ''));
                break;
            case 'newest':
            default:
                results.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
                break;
        }

        renderResearchCards(results);

        // Update count badge
        if (researchCountBadge) {
            researchCountBadge.innerHTML = `<ion-icon name="flask"></ion-icon> ${results.length} ${results.length === 1 ? 'Article' : 'Articles'} Available`;
        }
    };

    // -------------------------------------------------------------
    // 10. In-Website PDF Viewer Modal
    // -------------------------------------------------------------
    const openPdfViewerModal = (id) => {
        const article = allArticles.find(a => a.id === id);
        if (!article || !pdfViewerModal) return;

        viewerModalTitle.textContent = article.title;
        viewerAuthorsJournal.innerHTML = `${article.authors} &middot; <em>${article.journal}</em> (${article.year || ''})`;
        viewerCategoryBadge.textContent = getCategoryLabel(article.category);
        viewerCategoryBadge.className = `research-badge-category ${getCategoryBadgeClass(article.category)}`;

        const previewSrc = article.drivePreviewUrl || `https://drive.google.com/file/d/${article.driveFileId}/preview`;
        pdfViewerIframe.src = previewSrc;

        if (viewerDriveExternalBtn) {
            viewerDriveExternalBtn.href = article.driveViewUrl || `https://drive.google.com/file/d/${article.driveFileId}/view?usp=sharing`;
        }
        if (viewerDownloadBtn) {
            viewerDownloadBtn.href = article.driveDownloadUrl || `https://drive.google.com/uc?export=download&id=${article.driveFileId}`;
        }

        pdfViewerModal.classList.add('open');
        document.body.style.overflow = 'hidden';
    };

    const closePdfViewerModal = () => {
        if (!pdfViewerModal) return;
        pdfViewerModal.classList.remove('open');
        pdfViewerIframe.src = '';
        document.body.style.overflow = '';
    };

    // -------------------------------------------------------------
    // 11. Citation Modal & Formatter
    // -------------------------------------------------------------
    const formatVancouverCitation = (p) => {
        const vol = p.volume ? ` ${p.volume}.` : '';
        const yr = p.year ? ` ${p.year};` : '';
        const doiStr = p.doi ? ` doi: ${p.doi}.` : '';
        return `${p.authors}. ${p.title}. ${p.journal}.${yr}${vol}${doiStr}`;
    };

    const formatApaCitation = (p) => {
        const yr = p.year ? ` (${p.year})` : '';
        const vol = p.volume ? `, ${p.volume}` : '';
        const doiStr = p.doi ? ` https://doi.org/${p.doi}` : (p.driveViewUrl ? ` ${p.driveViewUrl}` : '');
        return `${p.authors}${yr}. ${p.title}. ${p.journal}${vol}.${doiStr}`;
    };

    const openCitationModal = (id) => {
        const article = allArticles.find(a => a.id === id);
        if (!article || !citationModal) return;

        citationModalTitle.textContent = article.title;
        citationVancouverText.textContent = formatVancouverCitation(article);
        citationApaText.textContent = formatApaCitation(article);

        // Reset button states
        btnCopyVancouver.innerHTML = `<ion-icon name="copy-outline"></ion-icon> Copy Vancouver`;
        btnCopyApa.innerHTML = `<ion-icon name="copy-outline"></ion-icon> Copy APA 7th`;

        citationModal.classList.add('open');
        document.body.style.overflow = 'hidden';
    };

    const closeCitationModal = () => {
        if (!citationModal) return;
        citationModal.classList.remove('open');
        document.body.style.overflow = '';
    };

    // Copy Citation Handlers
    if (btnCopyVancouver) {
        btnCopyVancouver.addEventListener('click', async () => {
            const text = citationVancouverText.textContent;
            try {
                await navigator.clipboard.writeText(text);
                btnCopyVancouver.innerHTML = `<ion-icon name="checkmark-outline"></ion-icon> Copied!`;
                showToast('Vancouver citation copied to clipboard!', 'copy');
                setTimeout(() => {
                    btnCopyVancouver.innerHTML = `<ion-icon name="copy-outline"></ion-icon> Copy Vancouver`;
                }, 2000);
            } catch (err) {
                console.error('Clipboard copy failed:', err);
            }
        });
    }

    if (btnCopyApa) {
        btnCopyApa.addEventListener('click', async () => {
            const text = citationApaText.textContent;
            try {
                await navigator.clipboard.writeText(text);
                btnCopyApa.innerHTML = `<ion-icon name="checkmark-outline"></ion-icon> Copied!`;
                showToast('APA 7th citation copied to clipboard!', 'copy');
                setTimeout(() => {
                    btnCopyApa.innerHTML = `<ion-icon name="copy-outline"></ion-icon> Copy APA 7th`;
                }, 2000);
            } catch (err) {
                console.error('Clipboard copy failed:', err);
            }
        });
    }

    // -------------------------------------------------------------
    // 12. Bookmark / Reading List Toggle
    // -------------------------------------------------------------
    const toggleSaveResearch = (id, btnElement = null) => {
        const isSaved = userSavedResearch.has(id);
        const article = allArticles.find(a => a.id === id);
        const paperTitle = article ? article.title.substring(0, 35) + '...' : 'Article';

        if (isSaved) {
            userSavedResearch.delete(id);
            showToast(`Removed "${paperTitle}" from Reading List`, 'bookmark');
        } else {
            userSavedResearch.add(id);
            showToast(`Saved "${paperTitle}" to your Reading List!`, 'success');
        }

        persistUserSavedResearch();

        if (btnElement) {
            btnElement.classList.toggle('active', !isSaved);
            const icon = btnElement.querySelector('ion-icon');
            const label = btnElement.querySelector('.save-label');
            if (icon) icon.setAttribute('name', !isSaved ? 'bookmark' : 'bookmark-outline');
            if (label) label.textContent = !isSaved ? 'Saved' : 'Save';
        }

        if (currentFilter === 'reading-list') {
            filterAndSortArticles();
        }
    };

    // -------------------------------------------------------------
    // 13. Add Article Modal & PDF Drag/Drop Upload Form
    // -------------------------------------------------------------
    const openAddArticleModal = () => {
        if (!addArticleModal) return;
        addArticleForm.reset();
        pendingPdfFile = null;
        selectedPdfCard.style.display = 'none';
        pdfDropZone.style.display = 'flex';
        uploadProgressWrapper.style.display = 'none';
        btnSubmitAddArticle.disabled = false;
        btnSubmitAddArticle.innerHTML = `<ion-icon name="cloud-upload-outline"></ion-icon> <span>Upload &amp; Save PDF</span>`;
        
        // Auto-fill user name if logged in
        const uploaderInput = document.getElementById('articleUploaderName');
        if (uploaderInput) {
            uploaderInput.value = getUserDisplayName();
        }

        addArticleModal.classList.add('open');
        document.body.style.overflow = 'hidden';
    };

    const closeAddArticleModal = () => {
        if (!addArticleModal) return;
        addArticleModal.classList.remove('open');
        document.body.style.overflow = '';
    };

    if (btnOpenAddArticleModal) {
        btnOpenAddArticleModal.addEventListener('click', openAddArticleModal);
    }

    // PDF File Selection Handler
    const handleFileSelected = (file) => {
        if (!file) return;

        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            showToast('Please select an Adobe PDF document (.pdf)', 'error');
            return;
        }

        // Limit to 50 MB
        if (file.size > 50 * 1024 * 1024) {
            showToast('PDF file is too large. Maximum supported size is 50 MB.', 'error');
            return;
        }

        pendingPdfFile = file;
        selectedPdfName.textContent = file.name;
        selectedPdfSize.textContent = formatFileSize(file.size);
        pdfDropZone.style.display = 'none';
        selectedPdfCard.style.display = 'flex';

        // Auto-populate Title if empty
        const titleInput = document.getElementById('articleTitle');
        if (titleInput && !titleInput.value.trim()) {
            const cleanTitle = file.name.replace(/\.pdf$/i, '').replace(/[_-]/g, ' ');
            titleInput.value = cleanTitle;
        }
    };

    // Dropzone Click
    if (pdfDropZone) {
        pdfDropZone.addEventListener('click', () => {
            if (articlePdfInput) articlePdfInput.click();
        });

        // Drag & Drop Listeners
        pdfDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            pdfDropZone.classList.add('drag-active');
        });

        pdfDropZone.addEventListener('dragleave', () => {
            pdfDropZone.classList.remove('drag-active');
        });

        pdfDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            pdfDropZone.classList.remove('drag-active');
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileSelected(e.dataTransfer.files[0]);
            }
        });
    }

    if (articlePdfInput) {
        articlePdfInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                handleFileSelected(e.target.files[0]);
            }
        });
    }

    if (btnRemoveSelectedPdf) {
        btnRemoveSelectedPdf.addEventListener('click', () => {
            pendingPdfFile = null;
            if (articlePdfInput) articlePdfInput.value = '';
            selectedPdfCard.style.display = 'none';
            pdfDropZone.style.display = 'flex';
        });
    }

    // Submit Add Article Form (Uploads PDF to Google Drive + Stores in Realtime Database)
    if (addArticleForm) {
        addArticleForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!pendingPdfFile) {
                showToast('Please select a PDF file to upload.', 'error');
                return;
            }

            const title = document.getElementById('articleTitle').value.trim();
            const authors = document.getElementById('articleAuthors').value.trim();
            const journal = document.getElementById('articleJournal').value.trim();
            const category = document.getElementById('articleCategory').value;
            const year = document.getElementById('articleYear').value.trim();
            const volume = document.getElementById('articleVolume').value.trim();
            const doi = document.getElementById('articleDoi').value.trim();
            const methodsRaw = document.getElementById('articleMethods').value.trim();
            const abstract = document.getElementById('articleAbstract').value.trim();
            const uploaderName = document.getElementById('articleUploaderName').value.trim() || getUserDisplayName();

            if (!title || !authors || !journal) {
                showToast('Please fill in all required fields.', 'error');
                return;
            }

            const methodsList = methodsRaw ? methodsRaw.split(',').map(m => m.trim()).filter(Boolean) : [];

            // UI: Show Progress
            btnSubmitAddArticle.disabled = true;
            uploadProgressWrapper.style.display = 'block';
            uploadProgressBar.style.width = '10%';
            uploadStatusText.textContent = 'Preparing PDF document for upload...';

            try {
                // 1. Upload PDF to dedicated Google Drive backend via Apps Script
                const driveResult = await uploadPdfToGoogleDrive(pendingPdfFile, (pct, status) => {
                    uploadProgressBar.style.width = `${pct}%`;
                    uploadStatusText.textContent = status;
                });

                uploadProgressBar.style.width = '90%';
                uploadStatusText.textContent = 'Saving article metadata to Realtime Database...';

                // 2. Save Article Metadata to Firebase Realtime Database
                const now = Date.now();
                const newArticle = {
                    title: title,
                    authors: authors,
                    journal: journal,
                    year: year ? parseInt(year, 10) : new Date().getFullYear(),
                    volume: volume || '',
                    category: category || 'analytical',
                    methods: methodsList,
                    abstract: abstract || '',
                    doi: doi || '',
                    uploaderName: uploaderName,
                    uploaderEmail: getUserEmail(),
                    pdfFileName: driveResult.fileName,
                    pdfFileSize: driveResult.fileSize,
                    driveFileId: driveResult.driveFileId,
                    driveViewUrl: driveResult.driveViewUrl,
                    drivePreviewUrl: driveResult.drivePreviewUrl,
                    driveDownloadUrl: driveResult.driveDownloadUrl,
                    createdAt: now
                };

                if (db && fbPush && fbRef && fbSet) {
                    const articleRef = fbPush(fbRef(db, 'research/articles'));
                    newArticle.id = articleRef.key;
                    await fbSet(articleRef, newArticle);
                } else {
                    // Fallback to local storage if database offline
                    newArticle.id = 'art_' + now;
                    allArticles.unshift(newArticle);
                    localStorage.setItem('rsbk_offline_articles', JSON.stringify(allArticles));
                    filterAndSortArticles();
                }

                uploadProgressBar.style.width = '100%';
                uploadStatusText.textContent = 'Upload Complete!';

                setTimeout(() => {
                    closeAddArticleModal();
                    showToast(`"${title.substring(0, 30)}..." PDF successfully added to Research Hub!`, 'success', 5000);
                }, 400);

            } catch (err) {
                console.error('Error uploading article PDF to Google Drive:', err);
                uploadProgressWrapper.style.display = 'none';
                btnSubmitAddArticle.disabled = false;
                btnSubmitAddArticle.innerHTML = `<ion-icon name="cloud-upload-outline"></ion-icon> <span>Upload &amp; Save PDF</span>`;
                showToast(`Upload failed: ${err.message || 'Please check your connection and try again.'}`, 'error', 6000);
            }
        });
    }

    // -------------------------------------------------------------
    // 14. Admin Only Article Removal
    // -------------------------------------------------------------
    const handleAdminDeleteArticle = async (articleId) => {
        currentUserEmail = getUserEmail();
        isUserAdmin = checkIsAdmin(currentUserEmail);

        if (!isUserAdmin) {
            alert('Access Denied: Only platform administrators can remove research articles.');
            return;
        }

        const article = allArticles.find(a => a.id === articleId);
        const articleTitle = article ? article.title : 'this article';

        const confirmed = confirm(`Administrator Action:\n\nAre you sure you want to permanently delete:\n"${articleTitle}"?\n\nThis will remove the publication from the public RSBK Research Hub.`);
        if (!confirmed) return;

        try {
            if (db && fbRef && fbRemove) {
                await fbRemove(fbRef(db, `research/articles/${articleId}`));
            } else {
                allArticles = allArticles.filter(a => a.id !== articleId);
                localStorage.setItem('rsbk_offline_articles', JSON.stringify(allArticles));
                filterAndSortArticles();
            }
            showToast('Research article successfully deleted by administrator.', 'success');
        } catch (err) {
            console.error('Error deleting article:', err);
            showToast('Failed to delete article. Please try again.', 'error');
        }
    };

    // -------------------------------------------------------------
    // 15. Controls & Filter Listeners
    // -------------------------------------------------------------
    // Category pills
    categoryFilterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            categoryFilterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentFilter = pill.dataset.filter || 'all';
            filterAndSortArticles();
        });
    });

    // Real-time search with debounce
    let searchDebounceTimer = null;
    if (researchSearchInput) {
        researchSearchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            if (clearResearchSearch) {
                clearResearchSearch.style.display = searchQuery ? 'inline-flex' : 'none';
            }
            clearTimeout(searchDebounceTimer);
            searchDebounceTimer = setTimeout(() => {
                filterAndSortArticles();
            }, 150);
        });
    }

    if (clearResearchSearch) {
        clearResearchSearch.addEventListener('click', () => {
            if (researchSearchInput) {
                researchSearchInput.value = '';
                searchQuery = '';
                clearResearchSearch.style.display = 'none';
                filterAndSortArticles();
                researchSearchInput.focus();
            }
        });
    }

    // Sort select
    if (researchSortSelect) {
        researchSortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            filterAndSortArticles();
        });
    }

    // Modal close triggers
    document.querySelectorAll('.modal-close-trigger').forEach(btn => {
        btn.addEventListener('click', () => {
            closeAddArticleModal();
            closePdfViewerModal();
            closeCitationModal();
        });
    });

    document.querySelectorAll('.research-modal-backdrop').forEach(bd => {
        bd.addEventListener('click', () => {
            closeAddArticleModal();
            closePdfViewerModal();
            closeCitationModal();
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAddArticleModal();
            closePdfViewerModal();
            closeCitationModal();
        }
    });

    // -------------------------------------------------------------
    // 16. Back to Top Floating Button Handler
    // -------------------------------------------------------------
    const backToTopBtn = document.getElementById('backToTopBtn');
    if (backToTopBtn && !backToTopBtn.dataset.bound) {
        backToTopBtn.dataset.bound = 'true';
        let scrollThrottle = false;
        const checkScroll = () => {
            if (window.scrollY > 280) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        };

        window.addEventListener('scroll', () => {
            if (!scrollThrottle) {
                scrollThrottle = true;
                requestAnimationFrame(() => {
                    checkScroll();
                    scrollThrottle = false;
                });
            }
        }, { passive: true });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            backToTopBtn.blur();
        });

        checkScroll();
    }

    // -------------------------------------------------------------
    // 17. Firebase Realtime Database Integration
    // -------------------------------------------------------------
    let db = null;
    let fbRef = null;
    let fbPush = null;
    let fbSet = null;
    let fbRemove = null;

    loadUserSavedResearch();

    try {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
        const { getAuth, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');
        const { getDatabase, ref, onValue, push, set, remove } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js');

        const firebaseConfig = {
            apiKey: "AIzaSyCZQqKCURGqMQ2LUl_XHOgscBmjs7Vj7ps",
            authDomain: "rsbk-online.firebaseapp.com",
            projectId: "rsbk-online",
            storageBucket: "rsbk-online.appspot.com",
            messagingSenderId: "362985180438",
            appId: "1:362985180438:web:9802e4253a5f6b329ad437",
            databaseURL: "https://rsbk-online-default-rtdb.firebaseio.com"
        };

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        db = getDatabase(app);
        fbRef = ref;
        fbPush = push;
        fbSet = set;
        fbRemove = remove;

        // Listen for Authentication state change
        onAuthStateChanged(auth, (user) => {
            if (user) {
                currentUserEmail = (user.email || '').toLowerCase().trim();
                isUserAdmin = checkIsAdmin(currentUserEmail);
            } else {
                currentUserEmail = getUserEmail();
                isUserAdmin = checkIsAdmin(currentUserEmail);
            }
            // Re-render to show/hide admin delete buttons
            filterAndSortArticles();
        });

        // Realtime Listener for Research Articles
        const articlesRef = ref(db, 'research/articles');
        onValue(articlesRef, (snapshot) => {
            const data = snapshot.val() || {};
            allArticles = Object.values(data).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

            // Hide initial loader
            if (researchLoadingState) researchLoadingState.style.display = 'none';

            filterAndSortArticles();
        }, (error) => {
            console.error('Error fetching articles from Realtime Database:', error);
            if (researchLoadingState) researchLoadingState.style.display = 'none';
            // Fallback to local storage if available
            try {
                const cached = localStorage.getItem('rsbk_offline_articles');
                if (cached) allArticles = JSON.parse(cached);
            } catch (e) {}
            filterAndSortArticles();
        });

    } catch (err) {
        console.error('Firebase initialization error in research.js:', err);
        if (researchLoadingState) researchLoadingState.style.display = 'none';
        // Offline / Local storage fallback
        try {
            const cached = localStorage.getItem('rsbk_offline_articles');
            if (cached) allArticles = JSON.parse(cached);
        } catch (e) {}
        filterAndSortArticles();
    }
});
