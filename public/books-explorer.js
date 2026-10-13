// ===================================================
// RSBK Online — Books Cloud Explorer
// In-Website Folder Navigation, Views, Sorting & PDF Reader
// ===================================================

document.addEventListener('DOMContentLoaded', async () => {
    const explorerMount = document.getElementById('booksExplorer');
    if (!explorerMount) return;

    const ROOT_ID = '1QQJbbI84f7hlVqSNB4cs5AgeKVdDz-9v';
    let allBooks = [];
    let currentFolderId = ROOT_ID;
    let currentFolderName = 'Books Archive';
    let folderBreadcrumbs = [{ id: ROOT_ID, title: 'Books Archive' }];
    let currentSort = 'folders-first'; // 'folders-first' | 'name-asc' | 'name-desc' | 'date-desc' | 'date-asc'
    let searchQuery = '';
    let currentFilter = 'all'; // 'all' | 'folders' | 'pdfs'

    // Load manifest
    try {
        const res = await fetch('books-data.json');
        allBooks = await res.json();
    } catch (err) {
        console.error('Error loading books-data.json:', err);
    }

    // Build Explorer Shell
    explorerMount.innerHTML = `
        <div class="explorer-card">
            <!-- Path & Breadcrumbs Bar -->
            <div class="explorer-path-bar">
                <div class="explorer-breadcrumbs" id="explorerBreadcrumbs"></div>
                <div class="explorer-quick-actions">
                    <span class="explorer-count" id="explorerCount">Loading...</span>
                    <a href="https://drive.google.com/drive/folders/1QQJbbI84f7hlVqSNB4cs5AgeKVdDz-9v?usp=sharing" target="_blank" rel="noopener noreferrer" class="btn-drive-opt" id="driveFolderLink" title="Open this folder in Google Drive (External)">
                        <ion-icon name="open-outline"></ion-icon>
                        <span>Open in Google Drive</span>
                    </a>
                </div>
            </div>

            <!-- Explorer Control Toolbar -->
            <div class="explorer-toolbar">
                <div class="explorer-search-wrap">
                    <ion-icon name="search-outline"></ion-icon>
                    <input type="text" id="explorerSearchInput" placeholder="Search books, treatises, manuscripts..." autocomplete="off">
                    <button type="button" id="explorerSearchClear" class="search-clear-btn" style="display: none;" title="Clear search">✕</button>
                </div>

                <div class="explorer-controls">
                    <!-- Filter Pills -->
                    <div class="filter-pills" id="filterPills">
                        <button type="button" class="filter-pill active" data-filter="all">All</button>
                        <button type="button" class="filter-pill" data-filter="folders"><ion-icon name="folder"></ion-icon> Folders</button>
                        <button type="button" class="filter-pill" data-filter="pdfs"><ion-icon name="document-text"></ion-icon> PDFs</button>
                    </div>

                    <!-- Sort Dropdown -->
                    <div class="sort-select-wrap">
                        <ion-icon name="swap-vertical-outline"></ion-icon>
                        <select id="explorerSortSelect" aria-label="Sort items">
                            <option value="folders-first">Folders First</option>
                            <option value="name-asc">Name (A → Z)</option>
                            <option value="name-desc">Name (Z → A)</option>
                            <option value="date-desc">Modified (Newest)</option>
                            <option value="date-asc">Modified (Oldest)</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Explorer Content Area -->
            <div class="explorer-body">
                <div id="explorerItemsContainer" class="explorer-details-view"></div>
            </div>

            <!-- Footer Toolbar / Live Sync Info -->
            <div class="explorer-footer">
                <div class="explorer-status">
                    <span class="status-indicator live"></span>
                    <span>Live Google Drive Repository Synced (${allBooks.length} items cataloged)</span>
                </div>
                <div class="explorer-footer-actions">
                    <button type="button" id="toggleRawFrameBtn" class="btn-toggle-frame">
                        <ion-icon name="layers-outline"></ion-icon>
                        <span>Toggle Embedded Google Frame View</span>
                    </button>
                </div>
            </div>

            <!-- Optional Raw Google Drive Frame (Hidden by default) -->
            <div id="rawDriveFrameContainer" class="raw-drive-container" style="display: none;">
                <div class="raw-frame-header">
                    <span>Google Drive Default Embedded Viewer</span>
                    <button type="button" id="closeRawFrameBtn" class="btn-close-frame">✕ Close Frame</button>
                </div>
                <iframe id="rawDriveFrame" src="https://drive.google.com/embeddedfolderview?id=1QQJbbI84f7hlVqSNB4cs5AgeKVdDz-9v#grid" class="drive-raw-frame" title="Raw Google Drive Frame" loading="lazy"></iframe>
            </div>
        </div>

        <!-- In-Website PDF Reader Modal (Keeps user on the site) -->
        <div id="pdfReaderModal" class="pdf-reader-modal" aria-hidden="true" role="dialog">
            <div class="pdf-modal-backdrop" id="modalBackdrop"></div>
            <div class="pdf-modal-dialog">
                <div class="pdf-modal-header">
                    <div class="pdf-modal-title-area">
                        <ion-icon name="book-outline"></ion-icon>
                        <h3 id="readerModalTitle" class="pdf-modal-title">Reading Book</h3>
                    </div>
                    <div class="pdf-modal-actions">
                        <a id="readerModalDriveLink" href="#" target="_blank" rel="noopener noreferrer" class="btn-modal-ext" title="Open in Google Drive">
                            <ion-icon name="open-outline"></ion-icon>
                            <span>Google Drive</span>
                        </a>
                        <button type="button" id="readerModalClose" class="btn-modal-close" title="Close Reader">✕</button>
                    </div>
                </div>
                <div class="pdf-modal-body">
                    <div class="pdf-modal-loader" id="modalLoader">
                        <div class="loader-spinner"></div>
                        <span>Loading digital reader...</span>
                    </div>
                    <iframe id="readerModalFrame" class="pdf-reader-iframe" title="PDF Viewer" allow="autoplay"></iframe>
                </div>
            </div>
        </div>
    `;

    // DOM Elements
    const breadcrumbsEl = document.getElementById('explorerBreadcrumbs');
    const countEl = document.getElementById('explorerCount');
    const driveFolderLink = document.getElementById('driveFolderLink');
    const searchInput = document.getElementById('explorerSearchInput');
    const searchClear = document.getElementById('explorerSearchClear');
    const sortSelect = document.getElementById('explorerSortSelect');
    const itemsContainer = document.getElementById('explorerItemsContainer');
    const filterPills = document.querySelectorAll('.filter-pill');
    const toggleRawBtn = document.getElementById('toggleRawFrameBtn');
    const closeRawBtn = document.getElementById('closeRawFrameBtn');
    const rawFrameContainer = document.getElementById('rawDriveFrameContainer');

    // Modal DOM Elements
    const readerModal = document.getElementById('pdfReaderModal');
    const modalBackdrop = document.getElementById('modalBackdrop');
    const modalClose = document.getElementById('readerModalClose');
    const modalTitle = document.getElementById('readerModalTitle');
    const modalDriveLink = document.getElementById('readerModalDriveLink');
    const modalFrame = document.getElementById('readerModalFrame');
    const modalLoader = document.getElementById('modalLoader');

    // Modal Functions
    const openReader = (id, title) => {
        modalTitle.textContent = title;
        modalDriveLink.href = `https://drive.google.com/file/d/${id}/view?usp=sharing`;
        modalLoader.style.display = 'flex';
        modalFrame.src = `https://drive.google.com/file/d/${id}/preview`;
        modalFrame.onload = () => {
            modalLoader.style.display = 'none';
        };
        readerModal.classList.add('active');
        readerModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };

    const closeReader = () => {
        modalFrame.src = 'about:blank';
        readerModal.classList.remove('active');
        readerModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    modalClose.addEventListener('click', closeReader);
    modalBackdrop.addEventListener('click', closeReader);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && readerModal.classList.contains('active')) {
            closeReader();
        }
    });

    // Navigation into folder
    const navigateToFolder = (folderId, folderTitle) => {
        currentFolderId = folderId;
        currentFolderName = folderTitle;
        driveFolderLink.href = `https://drive.google.com/drive/folders/${folderId}?usp=sharing`;

        // Check if already in history
        const existingIdx = folderBreadcrumbs.findIndex(b => b.id === folderId);
        if (existingIdx !== -1) {
            folderBreadcrumbs = folderBreadcrumbs.slice(0, existingIdx + 1);
        } else {
            folderBreadcrumbs.push({ id: folderId, title: folderTitle });
        }

        renderExplorer();
    };

    // Render Breadcrumbs
    const renderBreadcrumbs = () => {
        let html = '';
        if (folderBreadcrumbs.length > 1) {
            const parent = folderBreadcrumbs[folderBreadcrumbs.length - 2];
            html += `
                <button type="button" class="breadcrumb-up-btn" data-id="${parent.id}" data-title="${parent.title}" title="Back to ${parent.title}">
                    <ion-icon name="arrow-back-outline"></ion-icon> Back
                </button>
            `;
        }

        folderBreadcrumbs.forEach((crumb, idx) => {
            const isLast = idx === folderBreadcrumbs.length - 1;
            if (isLast) {
                html += `<span class="breadcrumb-item current">${crumb.title}</span>`;
            } else {
                html += `
                    <button type="button" class="breadcrumb-item link" data-id="${crumb.id}" data-title="${crumb.title}">
                        ${crumb.title}
                    </button>
                    <span class="breadcrumb-sep">/</span>
                `;
            }
        });

        breadcrumbsEl.innerHTML = html;

        // Attach breadcrumb click events
        breadcrumbsEl.querySelectorAll('.breadcrumb-item.link, .breadcrumb-up-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                navigateToFolder(btn.dataset.id, btn.dataset.title);
            });
        });
    };

    // Filter and Sort Items
    const getFilteredItems = () => {
        // Items in current folder (or all items if searching globally)
        let items = allBooks.filter(item => {
            if (searchQuery.trim().length > 0) {
                return item.title.toLowerCase().includes(searchQuery.toLowerCase());
            }
            return item.parentId === currentFolderId;
        });

        // Filter by type
        if (currentFilter === 'folders') {
            items = items.filter(item => item.isFolder);
        } else if (currentFilter === 'pdfs') {
            items = items.filter(item => !item.isFolder);
        }

        // Sorting
        items.sort((a, b) => {
            if (currentSort === 'folders-first') {
                if (a.isFolder && !b.isFolder) return -1;
                if (!a.isFolder && b.isFolder) return 1;
                return a.title.localeCompare(b.title);
            }
            if (currentSort === 'name-asc') {
                return a.title.localeCompare(b.title);
            }
            if (currentSort === 'name-desc') {
                return b.title.localeCompare(a.title);
            }
            if (currentSort === 'date-desc') {
                return new Date(b.date || 0) - new Date(a.date || 0);
            }
            if (currentSort === 'date-asc') {
                return new Date(a.date || 0) - new Date(b.date || 0);
            }
            return 0;
        });

        return items;
    };

    // Render Explorer Items (Details View)
    const renderExplorer = () => {
        renderBreadcrumbs();
        const items = getFilteredItems();

        const folderCount = items.filter(i => i.isFolder).length;
        const fileCount = items.filter(i => !i.isFolder).length;
        countEl.textContent = `${items.length} items (${folderCount} ${folderCount === 1 ? 'folder' : 'folders'}, ${fileCount} PDFs)`;

        if (items.length === 0) {
            itemsContainer.innerHTML = `
                <div class="explorer-empty">
                    <ion-icon name="folder-open-outline"></ion-icon>
                    <h3>No items found</h3>
                    <p>${searchQuery ? `No matches for "${searchQuery}". Try different keywords.` : 'This folder is currently empty.'}</p>
                </div>
            `;
            return;
        }

        // Details Table View
        let tableHtml = `
            <div class="explorer-table-responsive">
                <table class="explorer-table">
                    <thead>
                        <tr>
                            <th class="th-name">Book / Treatise Name</th>
                            <th class="th-type">Type</th>
                            <th class="th-date">Date Modified</th>
                            <th class="th-action" style="text-align: right;">Action</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        items.forEach(item => {
            const icon = item.isFolder 
                ? '<ion-icon name="folder" class="table-icon folder"></ion-icon>' 
                : '<ion-icon name="document-text" class="table-icon pdf"></ion-icon>';
            const typeText = item.isFolder ? 'Folder' : 'PDF Document';
            const actionBtn = item.isFolder 
                ? `<button type="button" class="btn-table-action open-folder" data-id="${item.id}" data-title="${encodeURIComponent(item.title)}"><span>Browse Inside</span> <ion-icon name="arrow-forward-outline"></ion-icon></button>`
                : `<button type="button" class="btn-table-action read-pdf" data-id="${item.id}" data-title="${encodeURIComponent(item.title)}"><ion-icon name="eye-outline"></ion-icon> <span>Read Online</span></button>`;

            tableHtml += `
                <tr class="explorer-table-row ${item.isFolder ? 'is-folder' : 'is-file'}" data-id="${item.id}" data-title="${encodeURIComponent(item.title)}" data-type="${item.isFolder ? 'folder' : 'pdf'}">
                    <td class="table-col-name">
                        <div class="table-name-wrapper">
                            ${icon}
                            <span class="table-item-title" title="${item.title}">${item.title}</span>
                        </div>
                    </td>
                    <td class="table-col-type"><span class="badge-type ${item.isFolder ? 'folder' : 'pdf'}">${typeText}</span></td>
                    <td class="table-col-date">${item.date || '—'}</td>
                    <td class="table-col-action">
                        <div class="table-action-group">
                            ${actionBtn}
                            <a href="https://drive.google.com/${item.isFolder ? 'drive/folders' : 'file/d'}/${item.id}/view?usp=sharing" target="_blank" rel="noopener noreferrer" class="table-ext-link" title="Open in Google Drive (External)">
                                <ion-icon name="open-outline"></ion-icon>
                            </a>
                        </div>
                    </td>
                </tr>
            `;
        });

        tableHtml += `</tbody></table></div>`;
        itemsContainer.innerHTML = tableHtml;

        // Row Click: entire row is interactive
        itemsContainer.querySelectorAll('.explorer-table-row').forEach(row => {
            row.addEventListener('click', (e) => {
                if (e.target.closest('.table-ext-link')) return;
                const id = row.dataset.id;
                const title = decodeURIComponent(row.dataset.title);
                const isFolder = row.dataset.type === 'folder';

                if (isFolder) {
                    navigateToFolder(id, title);
                } else {
                    openReader(id, title);
                }
            });
        });
    };

    // Search events
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        searchClear.style.display = searchQuery ? 'inline-block' : 'none';
        renderExplorer();
    });

    searchClear.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        searchClear.style.display = 'none';
        renderExplorer();
    });

    // Filter pills
    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentFilter = pill.dataset.filter;
            renderExplorer();
        });
    });

    // Sort select
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderExplorer();
    });

    // Toggle Raw Frame
    if (toggleRawBtn && rawFrameContainer) {
        toggleRawBtn.addEventListener('click', () => {
            const isVisible = rawFrameContainer.style.display !== 'none';
            rawFrameContainer.style.display = isVisible ? 'none' : 'block';
            toggleRawBtn.querySelector('span').textContent = isVisible 
                ? 'Toggle Embedded Google Frame View' 
                : 'Hide Embedded Google Frame View';
        });

        if (closeRawBtn) {
            closeRawBtn.addEventListener('click', () => {
                rawFrameContainer.style.display = 'none';
                toggleRawBtn.querySelector('span').textContent = 'Toggle Embedded Google Frame View';
            });
        }
    }

    // Initial render
    renderExplorer();
});
