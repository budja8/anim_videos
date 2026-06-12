// Application State
let state = {
    theme: 'light',
    viewMode: 'home',
    globalThumbnail: null,
    cards: []
};

// Default premium gradients for thumbnails
const gradients = [
    'linear-gradient(135deg, #a78bfa, #f472b6)', // Violet to Pink
    'linear-gradient(135deg, #fbcfe8, #fecaca)', // Light Pink to Coral
    'linear-gradient(135deg, #818cf8, #c084fc)', // Indigo to Purple
    'linear-gradient(135deg, #a7f3d0, #fde047)', // Emerald to Yellow
    'linear-gradient(135deg, #fcd34d, #f97316)', // Amber to Orange
    'linear-gradient(135deg, #93c5fd, #c084fc)', // Sky to Purple
    'linear-gradient(135deg, #a5f3fc, #818cf8)', // Cyan to Indigo
    'linear-gradient(135deg, #fda4af, #f43f5e)'  // Rose to Deep Rose
];

// Helper functions for random metrics
function generateRandomViews() {
    const units = ['', 'K', 'M'];
    const unitIndex = Math.floor(Math.random() * 3);
    if (unitIndex === 0) {
        return (Math.floor(Math.random() * 900) + 100).toString();
    } else if (unitIndex === 1) {
        const val = (Math.random() * 998 + 1).toFixed(1);
        return val + 'K';
    } else {
        const val = (Math.random() * 9 + 1).toFixed(1);
        return val + 'M';
    }
}

function generateRandomDate() {
    const options = [
        { value: 24, label: 'horas', singular: 'hora' },
        { value: 30, label: 'días', singular: 'día' },
        { value: 4, label: 'semanas', singular: 'semana' },
        { value: 12, label: 'meses', singular: 'mes' },
        { value: 5, label: 'años', singular: 'año' }
    ];
    const opt = options[Math.floor(Math.random() * options.length)];
    const num = Math.floor(Math.random() * opt.value) + 1;
    if (num === 1) {
        return `hace 1 ${opt.singular}`;
    }
    return `hace ${num} ${opt.label}`;
}

// Initial demo cards in Spanish
const defaultCards = [
    {
        id: 'placeholder-1',
        title: 'Prueba la longitud del título de tu vídeo de YouTube agregándolo arriba para ver cuándo se corta',
        channelName: 'Nombre del Canal',
        views: generateRandomViews(),
        date: generateRandomDate(),
        thumbnailImage: null,
        thumbnailGradient: gradients[0],
        avatarImage: null,
        avatarGradient: gradients[0],
        isPlaceholder: true
    },
    {
        id: 'placeholder-2',
        title: 'Agrega varios títulos de vídeo, uno tras otro, para ver cómo se ven juntos',
        channelName: 'Nombre del Canal',
        views: generateRandomViews(),
        date: generateRandomDate(),
        thumbnailImage: null,
        thumbnailGradient: gradients[1],
        avatarImage: null,
        avatarGradient: gradients[1],
        isPlaceholder: true
    },
    {
        id: 'placeholder-3',
        title: 'Asegúrate de que tus palabras clave y el gancho estén al principio de tus títulos',
        channelName: 'Nombre del Canal',
        views: generateRandomViews(),
        date: generateRandomDate(),
        thumbnailImage: null,
        thumbnailGradient: gradients[2],
        avatarImage: null,
        avatarGradient: gradients[2],
        isPlaceholder: true
    }
];

// DOM Elements
const titleInput = document.getElementById('title-input');
const charCounter = document.getElementById('char-counter');
const addTitleForm = document.getElementById('add-title-form');
const themeToggle = document.getElementById('theme-toggle');
const cardsGrid = document.getElementById('cards-grid');
const viewFeedBtn = document.getElementById('view-feed');
const viewSidebarBtn = document.getElementById('view-sidebar');
const globalImageUpload = document.getElementById('global-image-upload');
const globalUploadLabel = document.getElementById('global-upload-label');
const clearAllBtn = document.getElementById('clear-all-btn');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const sidebar = document.getElementById('sidebar');

// Modal Elements
const modalTriggers = {
    'nav-instructions': 'modal-instructions',
    'nav-updates': 'modal-updates',
    'nav-feedback': 'modal-feedback',
    'nav-about': 'modal-about',
    'nav-roadmap': 'modal-roadmap',
    'nav-donate': 'modal-donate'
};

/* Core Functions */

// Initialize App
function init() {
    loadState();
    setupEventListeners();
    applyTheme();
    applyViewMode();
    renderCards();
}

// Load State from LocalStorage
function loadState() {
    const savedState = localStorage.getItem('tube_title_tester_state_v2');
    if (savedState) {
        try {
            state = JSON.parse(savedState);
        } catch (e) {
            console.error('Error parsing saved state, resetting', e);
            resetToDefaultState();
        }
    } else {
        resetToDefaultState();
    }
    
    // Sync with global theme
    const globalTheme = localStorage.getItem('global_theme');
    if (globalTheme) {
        state.theme = globalTheme;
    } else {
        localStorage.setItem('global_theme', state.theme);
    }
}

// Reset to initial settings
function resetToDefaultState() {
    state = {
        theme: 'light',
        viewMode: 'home',
        globalThumbnail: null,
        cards: [...defaultCards]
    };
    saveState();
}

// Save State to LocalStorage
function saveState() {
    localStorage.setItem('tube_title_tester_state_v2', JSON.stringify(state));
}

// Apply Theme (light/dark)
function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
}

// Apply View Mode (home/sidebar)
function applyViewMode() {
    if (state.viewMode === 'home') {
        cardsGrid.className = 'cards-grid view-home';
        viewFeedBtn.classList.add('active');
        viewSidebarBtn.classList.remove('active');
    } else {
        cardsGrid.className = 'cards-grid view-sidebar';
        viewFeedBtn.classList.remove('active');
        viewSidebarBtn.classList.add('active');
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Character Counter
    titleInput.addEventListener('input', () => {
        const count = titleInput.value.length;
        charCounter.textContent = `${count}/100`;
    });

    // Form Submission
    addTitleForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const titleText = titleInput.value.trim();
        if (!titleText) return;

        addNewCard(titleText);
        titleInput.value = '';
        charCounter.textContent = '0/100';
    });

    // Theme Toggle
    themeToggle.addEventListener('click', () => {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        applyTheme();
        saveState();
        localStorage.setItem('global_theme', state.theme);
    });

    // Mobile Navigation Drawer Toggle
    mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (sidebar.classList.contains('active') && 
            !sidebar.contains(e.target) && 
            e.target !== mobileMenuBtn && 
            !mobileMenuBtn.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    });

    // Layout Switchers
    viewFeedBtn.addEventListener('click', () => {
        state.viewMode = 'home';
        applyViewMode();
        saveState();
    });

    viewSidebarBtn.addEventListener('click', () => {
        state.viewMode = 'sidebar';
        applyViewMode();
        saveState();
    });

    // Global Image Upload
    globalImageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            resizeAndCompressImage(file, 640, 360, (dataUrl) => {
                state.globalThumbnail = dataUrl;
                state.cards.forEach(card => {
                    card.thumbnailImage = dataUrl;
                });
                globalUploadLabel.querySelector('span').textContent = 'Miniatura Aplicada';
                saveState();
                renderCards();
            });
        }
    });

    // Clear All Button
    clearAllBtn.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que deseas limpiar todas las tarjetas?')) {
            state.cards = [];
            state.globalThumbnail = null;
            globalUploadLabel.querySelector('span').textContent = 'Establecer Miniatura Global';
            saveState();
            renderCards();
        }
    });

    // Setup Modals
    setupModals();
}

// Setup Modal Windows Open/Close
function setupModals() {
    Object.keys(modalTriggers).forEach(triggerId => {
        const btn = document.getElementById(triggerId);
        const modalId = modalTriggers[triggerId];
        const modal = document.getElementById(modalId);
        
        if (btn && modal) {
            btn.addEventListener('click', () => {
                modal.classList.add('active');
                // Close mobile menu if active
                sidebar.classList.remove('active');
            });
            
            const closeBtn = modal.querySelector('.modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    modal.classList.remove('active');
                });
            }
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        }
    });
}

// Add a New Video Card
function addNewCard(titleText) {
    const randomGradient = gradients[state.cards.length % gradients.length];
    
    // Check if any placeholder cards exist and clear them
    const hasPlaceholders = state.cards.some(c => c.isPlaceholder);
    if (hasPlaceholders) {
        state.cards = [];
    }

    const newCard = {
        id: 'card-' + Date.now(),
        title: titleText,
        channelName: 'Nombre del Canal',
        views: generateRandomViews(),
        date: generateRandomDate(),
        thumbnailImage: state.globalThumbnail || null,
        thumbnailGradient: randomGradient,
        avatarImage: null,
        avatarGradient: randomGradient,
        isPlaceholder: false
    };

    state.cards.unshift(newCard); // Add to the beginning of the list
    saveState();
    renderCards();
}

// Delete Card
function deleteCard(id) {
    state.cards = state.cards.filter(c => c.id !== id);
    saveState();
    renderCards();
}

// Resize and compress uploaded images
function resizeAndCompressImage(file, targetWidth, targetHeight, callback) {
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext('2d');
            
            // Handle aspect ratio cropping (center cover crop)
            const imgRatio = img.width / img.height;
            const targetRatio = targetWidth / targetHeight;
            let sx = 0, sy = 0, sw = img.width, sh = img.height;
            
            if (imgRatio > targetRatio) {
                sw = img.height * targetRatio;
                sx = (img.width - sw) / 2;
            } else if (imgRatio < targetRatio) {
                sh = img.width / targetRatio;
                sy = (img.height - sh) / 2;
            }
            
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);
            
            // Convert to JPEG format with 75% quality for performance
            const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
            callback(dataUrl);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

// Helper to determine title character length indicator class
function getTitleLenClass(len) {
    if (len <= 60) return 'len-good';
    if (len <= 80) return 'len-warning';
    return 'len-danger';
}

// Helper to determine title character length status label
function getTitleLenStatus(len) {
    if (len === 0) return 'Vacío';
    if (len <= 50) return `${len}/100 (Corto)`;
    if (len <= 60) return `${len}/100 (Ideal)`;
    if (len <= 80) return `${len}/100 (Largo)`;
    return `${len}/100 (Cortado en búsqueda)`;
}

// Render All Cards
function renderCards() {
    cardsGrid.innerHTML = '';

    if (state.cards.length === 0) {
        cardsGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
                <svg viewBox="0 0 24 24" style="width: 64px; fill: currentColor; opacity: 0.5; margin-bottom: 16px;"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0-2-.9-2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/></svg>
                <h3>No hay títulos para probar</h3>
                <p style="margin-top: 8px;">Introduce un título arriba para empezar a simular tu miniatura.</p>
            </div>
        `;
        return;
    }

    state.cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'yt-card';
        cardElement.dataset.id = card.id;

        // Build thumbnail HTML
        let thumbnailHTML = '';
        if (card.thumbnailImage) {
            thumbnailHTML = `<img src="${card.thumbnailImage}" class="thumbnail-image" alt="Miniatura">`;
        } else {
            thumbnailHTML = `<div class="thumbnail-gradient" style="background: ${card.thumbnailGradient};"></div>`;
        }

        // Build avatar HTML
        let avatarHTML = '';
        if (card.avatarImage) {
            avatarHTML = `<img src="${card.avatarImage}" class="avatar-image" alt="Avatar">`;
        } else {
            avatarHTML = `<div class="avatar-gradient" style="background: ${card.avatarGradient || card.thumbnailGradient};"></div>`;
        }

        cardElement.innerHTML = `
            <button class="card-delete-btn" title="Eliminar tarjeta">&times;</button>
            <div class="thumbnail-container">
                ${thumbnailHTML}
                <!-- Hover Upload Overlay -->
                <div class="upload-overlay">
                    <svg viewBox="0 0 24 24"><path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"/></svg>
                    <span class="upload-overlay-text">Cambiar Miniatura</span>
                    <span class="upload-overlay-subtext">Haz click o arrastra una imagen</span>
                    <div class="upload-overlay-actions">
                        ${card.thumbnailImage ? `
                            <button class="btn-overlay btn-clear-thumb" title="Quitar imagen y usar gradiente">
                                <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                            </button>
                        ` : ''}
                        ${card.thumbnailImage ? `
                            <button class="btn-overlay btn-copy-thumb" title="Aplicar esta miniatura a todas las tarjetas">
                                <svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0-2-.9-2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
            
            <div class="card-details">
                <div class="avatar-container" title="Cambiar foto de perfil">
                    ${avatarHTML}
                </div>
                
                <div class="meta-container">
                    <!-- Title -->
                    <h3 class="card-title editable" contenteditable="true" spellcheck="false" data-field="title" title="Editar título">${card.title}</h3>
                    
                    <!-- Channel Name -->
                    <span class="channel-name editable" contenteditable="true" spellcheck="false" data-field="channelName" title="Editar canal">${card.channelName}</span>
                    
                    <!-- Stats Line -->
                    <div class="card-stats">
                        <span class="editable" contenteditable="true" spellcheck="false" data-field="views" title="Editar vistas">${card.views} vistas</span>
                        <span>&bull;</span>
                        <span class="editable" contenteditable="true" spellcheck="false" data-field="date" title="Editar tiempo transcurrido">${card.date}</span>
                    </div>

                    <!-- Characters limit status indicator -->
                    <span class="card-len-indicator ${getTitleLenClass(card.title.length)}">
                        ${getTitleLenStatus(card.title.length)}
                    </span>
                </div>
            </div>
        `;

        // Attach listeners for Card Actions
        
        // Delete Card Button
        cardElement.querySelector('.card-delete-btn').addEventListener('click', () => {
            deleteCard(card.id);
        });

        // Click to Upload Thumbnail image
        const uploadOverlay = cardElement.querySelector('.upload-overlay');
        uploadOverlay.addEventListener('click', (e) => {
            // Prevent if clicked on overlay sub-action buttons
            if (e.target.closest('.btn-overlay')) return;
            
            triggerCardImageUpload(card.id);
        });

        // Clear Thumbnail action
        const clearThumbBtn = cardElement.querySelector('.btn-clear-thumb');
        if (clearThumbBtn) {
            clearThumbBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                card.thumbnailImage = null;
                saveState();
                renderCards();
            });
        }

        // Apply Thumbnail to All action
        const copyThumbBtn = cardElement.querySelector('.btn-copy-thumb');
        if (copyThumbBtn) {
            copyThumbBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const image = card.thumbnailImage;
                state.cards.forEach(c => c.thumbnailImage = image);
                saveState();
                renderCards();
            });
        }

        // Drag & Drop Thumbnail Upload
        const thumbContainer = cardElement.querySelector('.thumbnail-container');
        setupDragAndDrop(thumbContainer, (file) => {
            resizeAndCompressImage(file, 640, 360, (dataUrl) => {
                card.thumbnailImage = dataUrl;
                saveState();
                renderCards();
            });
        });

        // Avatar Image Upload
        const avatarContainer = cardElement.querySelector('.avatar-container');
        if (avatarContainer) {
            avatarContainer.addEventListener('click', () => {
                triggerAvatarUpload(card.id);
            });
        }

        // Inline Text Editing handlers
        const editableFields = cardElement.querySelectorAll('.editable');
        editableFields.forEach(field => {
            // Prevent pasting styled HTML/rich text
            field.addEventListener('paste', (e) => {
                e.preventDefault();
                const text = (e.originalEvent || e).clipboardData.getData('text/plain');
                document.execCommand('insertText', false, text);
            });

            // Prevent Enter key on metadata fields (views, date, channel)
            field.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    field.blur();
                }
            });

            // Handle save on blur
            field.addEventListener('blur', () => {
                const fieldName = field.dataset.field;
                let value = field.innerText.trim();

                // Validation or format cleanups
                if (fieldName === 'title') {
                    // Truncate locally if they pasted longer than 100 characters
                    if (value.length > 100) {
                        value = value.substring(0, 100);
                        field.innerText = value;
                    }
                    card.title = value || 'Vídeo sin título';
                } else if (fieldName === 'channelName') {
                    card.channelName = value || 'Nombre del Canal';
                } else if (fieldName === 'views') {
                    // YouTube views styling
                    value = value.replace(/\s*vistas/gi, ''); // remove views label if typed
                    card.views = value || '0';
                    field.innerText = `${card.views} vistas`;
                } else if (fieldName === 'date') {
                    card.date = value || 'Hace un momento';
                }

                saveState();
                
                // If it's title, update character length badge without re-rendering everything (prevents cursor jump)
                if (fieldName === 'title') {
                    const badge = cardElement.querySelector('.card-len-indicator');
                    if (badge) {
                        badge.className = `card-len-indicator ${getTitleLenClass(card.title.length)}`;
                        badge.textContent = getTitleLenStatus(card.title.length);
                    }
                }
            });
        });

        cardsGrid.appendChild(cardElement);
    });
}

// Trigger image upload for specific card thumbnail
function triggerCardImageUpload(cardId) {
    const card = state.cards.find(c => c.id === cardId);
    if (!card) return;

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    
    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            resizeAndCompressImage(file, 640, 360, (dataUrl) => {
                card.thumbnailImage = dataUrl;
                saveState();
                renderCards();
            });
        }
    };
    fileInput.click();
}

// Trigger avatar upload for specific card profile icon
function triggerAvatarUpload(cardId) {
    const card = state.cards.find(c => c.id === cardId);
    if (!card) return;

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    
    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            resizeAndCompressImage(file, 80, 80, (dataUrl) => {
                card.avatarImage = dataUrl;
                saveState();
                renderCards();
            });
        }
    };
    fileInput.click();
}

// Setup Drag & Drop Listeners
function setupDragAndDrop(element, onDropCallback) {
    ['dragenter', 'dragover'].forEach(eventName => {
        element.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            element.classList.add('drag-over');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        element.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            element.classList.remove('drag-over');
        }, false);
    });

    element.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const file = dt.files[0];
        if (file && file.type.startsWith('image/')) {
            onDropCallback(file);
        }
    }, false);
}

// Initialize on Load
window.addEventListener('DOMContentLoaded', init);
