/**
 * RSBK Online - Research & Evidence Hub Manager (research.js)
 * Comprehensive Digital Research Repository for Rasashastra & Bhaishajya Kalpana
 * Designed for UG & PG Students, Teachers, Doctors, and Researchers.
 * Features: Peer-Reviewed Articles, Analytical Monographs (XRD, SEM, ICP-MS, HPTLC),
 *           OECD Safety & Toxicology, Nanomedicine, Formatted Citations (Vancouver & APA),
 *           Live Search, Filter Categories, and Reading List Bookmarking.
 * Copyright 2026 Suvarna Ayurveda.
 */

document.addEventListener('DOMContentLoaded', async () => {
    // -------------------------------------------------------------
    // 1. DOM Elements
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

    // Modals
    const abstractModal = document.getElementById('abstractModal');
    const citationModal = document.getElementById('citationModal');
    const suggestModal = document.getElementById('suggestModal');

    // Abstract Modal Elements
    const modalAbstractTitle = document.getElementById('modalAbstractTitle');
    const modalAbstractAuthors = document.getElementById('modalAbstractAuthors');
    const modalAbstractJournal = document.getElementById('modalAbstractJournal');
    const modalAbstractCategory = document.getElementById('modalAbstractCategory');
    const modalAbstractDoiLink = document.getElementById('modalAbstractDoiLink');
    const modalAbstractBody = document.getElementById('modalAbstractBody');
    const modalClassicalBox = document.getElementById('modalClassicalBox');
    const modalSignificanceBox = document.getElementById('modalSignificanceBox');
    const modalMethodsRow = document.getElementById('modalMethodsRow');
    const modalCiteQuickBtn = document.getElementById('modalCiteQuickBtn');
    const modalSaveQuickBtn = document.getElementById('modalSaveQuickBtn');

    // Citation Modal Elements
    const citationModalTitle = document.getElementById('citationModalTitle');
    const citationVancouverText = document.getElementById('citationVancouverText');
    const citationApaText = document.getElementById('citationApaText');
    const btnCopyVancouver = document.getElementById('btnCopyVancouver');
    const btnCopyApa = document.getElementById('btnCopyApa');

    // Suggest Paper Modal Elements
    const btnOpenSuggestModal = document.getElementById('btnOpenSuggestModal');
    const suggestPaperForm = document.getElementById('suggestPaperForm');

    // -------------------------------------------------------------
    // 2. Curated Peer-Reviewed RSBK Research Dataset
    // -------------------------------------------------------------
    // Empty array: articles will be added through authentic submissions or direct curation.
    const RESEARCH_PAPERS = [];

    // -------------------------------------------------------------
    // 3. User Account & Reading List Persistence
    // -------------------------------------------------------------
    let userSavedResearch = new Set();
    let currentFilter = 'all';
    let searchQuery = '';
    let currentSort = 'featured';
    let activePaperForAbstract = null;

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

    const loadUserSavedResearch = () => {
        try {
            const rawSaved = localStorage.getItem(getStorageKey('rsbk_saved_research')) || 
                             localStorage.getItem('rsbk_saved_research');
            userSavedResearch = new Set(rawSaved ? JSON.parse(rawSaved) : []);
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
    const showToast = (message, type = 'info', duration = 3000) => {
        if (!researchToastContainer) return;

        const toast = document.createElement('div');
        toast.className = `research-toast ${type}`;
        
        let iconName = 'information-circle-outline';
        if (type === 'success') iconName = 'checkmark-circle-outline';
        if (type === 'bookmark') iconName = 'bookmark-outline';
        if (type === 'copy') iconName = 'copy-outline';

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

    // -------------------------------------------------------------
    // 5. Card Rendering and Dynamic Grid
    // -------------------------------------------------------------
    const getCategoryLabel = (category) => {
        switch (category) {
            case 'analytical': return 'Analytical Standardization';
            case 'toxicology': return 'Safety & Toxicology';
            case 'nanomedicine': return 'Nanomedicine & Bhasma';
            case 'reviews': return 'Systematic Review';
            case 'formulations': return 'Formulations & SOP';
            case 'clinical': return 'Clinical Evidence';
            default: return 'Research Monograph';
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

    const renderResearchCards = (papers) => {
        if (!researchGrid) return;

        if (papers.length === 0) {
            researchGrid.style.display = 'none';
            if (researchEmptyState) {
                researchEmptyState.style.display = 'flex';
                if (currentFilter === 'reading-list') {
                    emptyStateHeading.textContent = 'Your Reading List is Empty';
                    emptyStateDesc.textContent = 'Bookmark research papers and monographs using the bookmark button on any paper card to save them here for quick study.';
                } else if (searchQuery) {
                    emptyStateHeading.textContent = 'No Matching Research Papers Found';
                    emptyStateDesc.textContent = `No articles matched "${searchQuery}". Try searching for another drug (e.g. Parada, Swarna, Tamra), technique (XRD, SEM, OECD), or clear your filter.`;
                } else {
                    emptyStateHeading.textContent = 'No Research Articles Added Yet';
                    emptyStateDesc.textContent = 'This section is ready for authentic RSBK publications and monographs. Click "Suggest Paper" above to submit an article.';
                }
            }
            return;
        }

        if (researchEmptyState) researchEmptyState.style.display = 'none';
        researchGrid.style.display = 'grid';

        researchGrid.innerHTML = papers.map(paper => {
            const isSaved = userSavedResearch.has(paper.id);
            const methodsBadges = (paper.methods || []).map(m => `<span class="method-badge">${m}</span>`).join('');
            
            // Generate clean abstract snippet (first 160 characters)
            const abstractSnippet = paper.abstract.replace(/\n/g, ' ').substring(0, 195) + '...';

            return `
                <article class="research-card ${paper.featured ? 'is-featured' : ''}" data-id="${paper.id}">
                    <div class="research-card-header">
                        <span class="research-badge-category ${getCategoryBadgeClass(paper.category)}">
                            ${getCategoryLabel(paper.category)}
                        </span>
                        <div class="header-pills-right">
                            <span class="research-badge-year">${paper.year}</span>
                            <span class="research-badge-oa" title="Open Access / Verified Academic Index">
                                <ion-icon name="lock-open-outline"></ion-icon> Peer-Reviewed
                            </span>
                        </div>
                    </div>

                    <h3 class="research-card-title">
                        <a href="javascript:void(0);" class="paper-title-link" data-id="${paper.id}">
                            ${paper.title}
                        </a>
                    </h3>

                    <div class="research-card-authors">
                        <ion-icon name="people-outline"></ion-icon>
                        <span>${paper.authors}</span>
                    </div>

                    <div class="research-card-journal">
                        <ion-icon name="journal-outline"></ion-icon>
                        <em>${paper.journal}</em> &middot; <strong>${paper.volume}</strong>: ${paper.pages}
                    </div>

                    <div class="research-methods-row">
                        ${methodsBadges}
                    </div>

                    <p class="research-card-snippet">
                        ${abstractSnippet}
                    </p>

                    <div class="research-card-actions">
                        <button class="btn-research-action btn-abstract" data-id="${paper.id}" type="button" title="Read Full Structured Abstract & Classical Context">
                            <ion-icon name="document-text-outline"></ion-icon> Abstract
                        </button>
                        <button class="btn-research-action btn-cite" data-id="${paper.id}" type="button" title="Generate APA & Vancouver Citations">
                            <ion-icon name="quote-outline"></ion-icon> Cite
                        </button>
                        <button class="btn-research-action btn-save ${isSaved ? 'active' : ''}" data-id="${paper.id}" type="button" title="${isSaved ? 'Remove from Reading List' : 'Save to Reading List'}">
                            <ion-icon name="${isSaved ? 'bookmark' : 'bookmark-outline'}"></ion-icon>
                            <span class="save-label">${isSaved ? 'Saved' : 'Save'}</span>
                        </button>
                        <a href="${paper.url}" target="_blank" rel="noopener noreferrer" class="btn-research-action btn-doi" title="Open Official DOI / PubMed Publisher Article">
                            <ion-icon name="open-outline"></ion-icon> DOI
                        </a>
                    </div>
                </article>
            `;
        }).join('');

        // Attach event listeners to card buttons
        attachCardListeners();
    };

    // -------------------------------------------------------------
    // 6. Event Listeners for Grid Cards
    // -------------------------------------------------------------
    const attachCardListeners = () => {
        // Title click -> Open Abstract
        document.querySelectorAll('.paper-title-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const id = link.dataset.id;
                openAbstractModal(id);
            });
        });

        // Abstract button click
        document.querySelectorAll('.btn-abstract').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                openAbstractModal(id);
            });
        });

        // Cite button click
        document.querySelectorAll('.btn-cite').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                openCitationModal(id);
            });
        });

        // Save / Bookmark button click
        document.querySelectorAll('.btn-save').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                toggleSaveResearch(id, btn);
            });
        });
    };

    // -------------------------------------------------------------
    // 7. Filtering & Sorting Logic
    // -------------------------------------------------------------
    const filterAndSortPapers = () => {
        let results = [...RESEARCH_PAPERS];

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
                const matchTitle = p.title.toLowerCase().includes(q);
                const matchAuthors = p.authors.toLowerCase().includes(q);
                const matchJournal = p.journal.toLowerCase().includes(q);
                const matchAbstract = p.abstract.toLowerCase().includes(q);
                const matchMethods = (p.methods || []).some(m => m.toLowerCase().includes(q));
                const matchClassics = (p.classicalCorrelation || '').toLowerCase().includes(q);
                return matchTitle || matchAuthors || matchJournal || matchAbstract || matchMethods || matchClassics;
            });
        }

        // 3. Sorting
        switch (currentSort) {
            case 'year-new':
                results.sort((a, b) => b.year - a.year);
                break;
            case 'year-old':
                results.sort((a, b) => a.year - b.year);
                break;
            case 'az':
                results.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'journal':
                results.sort((a, b) => a.journal.localeCompare(b.journal));
                break;
            case 'featured':
            default:
                results.sort((a, b) => {
                    if (a.featured && !b.featured) return -1;
                    if (!a.featured && b.featured) return 1;
                    return b.year - a.year;
                });
                break;
        }

        renderResearchCards(results);

        // Update count badge
        if (researchCountBadge) {
            researchCountBadge.innerHTML = `<ion-icon name="flask"></ion-icon> ${results.length} Papers Available`;
        }
    };

    // -------------------------------------------------------------
    // 8. Abstract Modal Handler
    // -------------------------------------------------------------
    const openAbstractModal = (id) => {
        const paper = RESEARCH_PAPERS.find(p => p.id === id);
        if (!paper || !abstractModal) return;

        activePaperForAbstract = paper;

        modalAbstractTitle.textContent = paper.title;
        modalAbstractAuthors.textContent = paper.authors;
        modalAbstractJournal.textContent = `${paper.journal} (${paper.year}) ${paper.volume}: ${paper.pages}`;
        modalAbstractCategory.textContent = getCategoryLabel(paper.category);
        modalAbstractCategory.className = `research-badge-category ${getCategoryBadgeClass(paper.category)}`;
        
        modalAbstractDoiLink.href = paper.url;
        modalAbstractDoiLink.innerHTML = `<ion-icon name="open-outline"></ion-icon> DOI: ${paper.doi}`;

        // Structured Abstract with highlight styling
        const paragraphs = paper.abstract.split('\n').filter(p => p.trim());
        modalAbstractBody.innerHTML = paragraphs.map(p => {
            const colonIndex = p.indexOf(':');
            if (colonIndex > -1 && colonIndex < 25) {
                const heading = p.substring(0, colonIndex);
                const content = p.substring(colonIndex + 1);
                return `<p class="abstract-section"><strong class="abstract-section-heading">${heading}:</strong> ${content}</p>`;
            }
            return `<p>${p}</p>`;
        }).join('');

        // Classical context box
        if (modalClassicalBox) {
            modalClassicalBox.innerHTML = `
                <div class="context-box classical">
                    <div class="context-header">
                        <ion-icon name="book-outline"></ion-icon> Classical Shloka / Treatise Correlation
                    </div>
                    <p class="context-text">${paper.classicalCorrelation || 'Classical correlation available in handbooks.'}</p>
                </div>
            `;
        }

        // Clinical & Practical significance box
        if (modalSignificanceBox) {
            modalSignificanceBox.innerHTML = `
                <div class="context-box practical">
                    <div class="context-header">
                        <ion-icon name="bulb-outline"></ion-icon> Pharmaceutical &amp; Clinical Implication
                    </div>
                    <p class="context-text">${paper.significance || 'Valuable reference for RSBK formulation development.'}</p>
                </div>
            `;
        }

        // Method badges in modal
        if (modalMethodsRow) {
            modalMethodsRow.innerHTML = (paper.methods || []).map(m => `<span class="method-badge">${m}</span>`).join('');
        }

        // Update save button inside abstract modal
        const isSaved = userSavedResearch.has(paper.id);
        if (modalSaveQuickBtn) {
            modalSaveQuickBtn.innerHTML = `
                <ion-icon name="${isSaved ? 'bookmark' : 'bookmark-outline'}"></ion-icon>
                <span>${isSaved ? 'Saved in Reading List' : 'Save to Reading List'}</span>
            `;
            modalSaveQuickBtn.classList.toggle('active', isSaved);
        }

        abstractModal.classList.add('open');
        document.body.style.overflow = 'hidden';
    };

    const closeAbstractModal = () => {
        if (!abstractModal) return;
        abstractModal.classList.remove('open');
        document.body.style.overflow = '';
    };

    // -------------------------------------------------------------
    // 9. Citation Modal & Formatter (Vancouver & APA 7th)
    // -------------------------------------------------------------
    const formatVancouverCitation = (p) => {
        return `${p.authors}. ${p.title}. ${p.journal}. ${p.year};${p.volume}:${p.pages}. doi:${p.doi}`;
    };

    const formatApaCitation = (p) => {
        return `${p.authors} (${p.year}). ${p.title}. ${p.journal}, ${p.volume}, ${p.pages}. https://doi.org/${p.doi}`;
    };

    const openCitationModal = (id) => {
        const paper = RESEARCH_PAPERS.find(p => p.id === id);
        if (!paper || !citationModal) return;

        citationModalTitle.textContent = paper.title;
        citationVancouverText.textContent = formatVancouverCitation(paper);
        citationApaText.textContent = formatApaCitation(paper);

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

    // -------------------------------------------------------------
    // 10. Bookmark / Reading List Toggle
    // -------------------------------------------------------------
    const toggleSaveResearch = (id, btnElement = null) => {
        const isSaved = userSavedResearch.has(id);
        const paper = RESEARCH_PAPERS.find(p => p.id === id);
        const paperTitle = paper ? paper.title.substring(0, 35) + '...' : 'Paper';

        if (isSaved) {
            userSavedResearch.delete(id);
            showToast(`Removed "${paperTitle}" from Reading List`, 'bookmark');
        } else {
            userSavedResearch.add(id);
            showToast(`Saved "${paperTitle}" to your Reading List!`, 'success');
        }

        persistUserSavedResearch();

        // Update triggering button UI
        if (btnElement) {
            btnElement.classList.toggle('active', !isSaved);
            const icon = btnElement.querySelector('ion-icon');
            const label = btnElement.querySelector('.save-label');
            if (icon) icon.setAttribute('name', !isSaved ? 'bookmark' : 'bookmark-outline');
            if (label) label.textContent = !isSaved ? 'Saved' : 'Save';
        }

        // If currently on reading-list filter, refresh view
        if (currentFilter === 'reading-list') {
            filterAndSortPapers();
        }
    };

    // -------------------------------------------------------------
    // 11. Suggest / Submit Paper Modal
    // -------------------------------------------------------------
    const openSuggestModal = () => {
        if (!suggestModal) return;
        suggestModal.classList.add('open');
        document.body.style.overflow = 'hidden';
    };

    const closeSuggestModal = () => {
        if (!suggestModal) return;
        suggestModal.classList.remove('open');
        document.body.style.overflow = '';
    };

    // -------------------------------------------------------------
    // 12. Setup Controls & Global Event Listeners
    // -------------------------------------------------------------
    // Category pills
    categoryFilterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            categoryFilterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentFilter = pill.dataset.filter || 'all';
            filterAndSortPapers();
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
                filterAndSortPapers();
            }, 150);
        });
    }

    if (clearResearchSearch) {
        clearResearchSearch.addEventListener('click', () => {
            if (researchSearchInput) {
                researchSearchInput.value = '';
                searchQuery = '';
                clearResearchSearch.style.display = 'none';
                filterAndSortPapers();
                researchSearchInput.focus();
            }
        });
    }

    // Sort select
    if (researchSortSelect) {
        researchSortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            filterAndSortPapers();
        });
    }

    // Modal Close buttons
    document.querySelectorAll('.modal-close-trigger').forEach(btn => {
        btn.addEventListener('click', () => {
            closeAbstractModal();
            closeCitationModal();
            closeSuggestModal();
        });
    });

    // Close on backdrop click
    document.querySelectorAll('.research-modal-backdrop').forEach(bd => {
        bd.addEventListener('click', () => {
            closeAbstractModal();
            closeCitationModal();
            closeSuggestModal();
        });
    });

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAbstractModal();
            closeCitationModal();
            closeSuggestModal();
        }
    });

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

    // Quick action buttons inside Abstract Modal
    if (modalCiteQuickBtn) {
        modalCiteQuickBtn.addEventListener('click', () => {
            if (activePaperForAbstract) {
                closeAbstractModal();
                openCitationModal(activePaperForAbstract.id);
            }
        });
    }

    if (modalSaveQuickBtn) {
        modalSaveQuickBtn.addEventListener('click', () => {
            if (activePaperForAbstract) {
                toggleSaveResearch(activePaperForAbstract.id);
                const isSaved = userSavedResearch.has(activePaperForAbstract.id);
                modalSaveQuickBtn.innerHTML = `
                    <ion-icon name="${isSaved ? 'bookmark' : 'bookmark-outline'}"></ion-icon>
                    <span>${isSaved ? 'Saved in Reading List' : 'Save to Reading List'}</span>
                `;
                modalSaveQuickBtn.classList.toggle('active', isSaved);
            }
        });
    }

    // Suggest paper button & form
    if (btnOpenSuggestModal) {
        btnOpenSuggestModal.addEventListener('click', openSuggestModal);
    }

    if (suggestPaperForm) {
        suggestPaperForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('suggestTitle').value.trim();
            const authors = document.getElementById('suggestAuthors').value.trim();
            const journal = document.getElementById('suggestJournal').value.trim();
            const doi = document.getElementById('suggestDoi').value.trim();
            const category = document.getElementById('suggestCategory').value;

            if (!title || !authors || !journal) {
                showToast('Please fill in the required article details.', 'info');
                return;
            }

            // Save suggestion to local queue or dispatch notification
            try {
                const storedSubmissions = JSON.parse(localStorage.getItem('rsbk_research_submissions') || '[]');
                storedSubmissions.push({
                    title,
                    authors,
                    journal,
                    doi,
                    category,
                    submittedAt: new Date().toISOString(),
                    submittedBy: getUserEmail()
                });
                localStorage.setItem('rsbk_research_submissions', JSON.stringify(storedSubmissions));
            } catch (err) {
                console.error('Error recording paper suggestion:', err);
            }

            suggestPaperForm.reset();
            closeSuggestModal();
            showToast('Thank you! Your research paper suggestion has been submitted for peer curation.', 'success', 5000);
        });
    }

    // -------------------------------------------------------------
    // 13. Back to Top Floating Button Handler
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
    // 14. URL Query Params Handler (?search=... & ?category=...)
    // -------------------------------------------------------------
    const handleUrlQueryParams = () => {
        try {
            const params = new URLSearchParams(window.location.search);
            const searchParam = params.get('search');
            const categoryParam = params.get('category');

            if (categoryParam) {
                const targetPill = document.querySelector(`.research-filter-pill[data-filter="${categoryParam}"]`);
                if (targetPill) {
                    categoryFilterPills.forEach(p => p.classList.remove('active'));
                    targetPill.classList.add('active');
                    currentFilter = categoryParam;
                }
            }

            if (searchParam) {
                searchQuery = searchParam;
                if (researchSearchInput) {
                    researchSearchInput.value = searchParam;
                }
                if (clearResearchSearch) {
                    clearResearchSearch.style.display = 'inline-flex';
                }
            }
        } catch (e) {
            console.error('Error parsing URL query params:', e);
        }
    };

    // -------------------------------------------------------------
    // 15. Initialize Hub
    // -------------------------------------------------------------
    loadUserSavedResearch();
    handleUrlQueryParams();

    // Hide loader and render papers
    if (researchLoadingState) researchLoadingState.style.display = 'none';
    filterAndSortPapers();
});
