import { getTitleLenClass, getTitleLenStatus, resizeAndCompressImage, generateRandomViews, generateRandomDate } from './utils.js';
import { GRADIENTS } from './config.js';

export class CardManager {
    constructor(options) {
        this.state = options.state;
        this.cardsGrid = options.cardsGrid;
        this.saveState = options.saveState;
        this.globalUploadLabel = options.globalUploadLabel;
    }

    renderCards() {
        this.cardsGrid.innerHTML = '';

        if (this.state.cards.length === 0) {
            this.cardsGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
                    <svg viewBox="0 0 24 24" style="width: 64px; fill: currentColor; opacity: 0.5; margin-bottom: 16px;"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0-2-.9-2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/></svg>
                    <h3>No hay títulos para probar</h3>
                    <p style="margin-top: 8px;">Introduce un título arriba para empezar a simular tu miniatura.</p>
                </div>
            `;
            return;
        }

        this.state.cards.forEach(card => {
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
                this.deleteCard(card.id);
            });

            // Click to Upload Thumbnail image
            const uploadOverlay = cardElement.querySelector('.upload-overlay');
            uploadOverlay.addEventListener('click', (e) => {
                // Prevent if clicked on overlay sub-action buttons
                if (e.target.closest('.btn-overlay')) return;
                
                this.triggerCardImageUpload(card.id);
            });

            // Clear Thumbnail action
            const clearThumbBtn = cardElement.querySelector('.btn-clear-thumb');
            if (clearThumbBtn) {
                clearThumbBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    card.thumbnailImage = null;
                    this.saveState();
                    this.renderCards();
                });
            }

            // Apply Thumbnail to All action
            const copyThumbBtn = cardElement.querySelector('.btn-copy-thumb');
            if (copyThumbBtn) {
                copyThumbBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const image = card.thumbnailImage;
                    this.state.cards.forEach(c => c.thumbnailImage = image);
                    this.saveState();
                    this.renderCards();
                });
            }

            // Drag & Drop Thumbnail Upload
            const thumbContainer = cardElement.querySelector('.thumbnail-container');
            this.setupDragAndDrop(thumbContainer, (file) => {
                resizeAndCompressImage(file, 640, 360, (dataUrl) => {
                    card.thumbnailImage = dataUrl;
                    this.saveState();
                    this.renderCards();
                });
            });

            // Avatar Image Upload
            const avatarContainer = cardElement.querySelector('.avatar-container');
            if (avatarContainer) {
                avatarContainer.addEventListener('click', () => {
                    this.triggerAvatarUpload(card.id);
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

                    this.saveState();
                    
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

            this.cardsGrid.appendChild(cardElement);
        });
    }

    addNewCard(titleText) {
        const randomGradient = GRADIENTS[this.state.cards.length % GRADIENTS.length];
        
        // Check if any placeholder cards exist and clear them
        const hasPlaceholders = this.state.cards.some(c => c.isPlaceholder);
        if (hasPlaceholders) {
            this.state.cards = [];
        }

        const newCard = {
            id: 'card-' + Date.now(),
            title: titleText,
            channelName: 'Nombre del Canal',
            views: generateRandomViews(),
            date: generateRandomDate(),
            thumbnailImage: this.state.globalThumbnail || null,
            thumbnailGradient: randomGradient,
            avatarImage: null,
            avatarGradient: randomGradient,
            isPlaceholder: false
        };

        this.state.cards.unshift(newCard); // Add to the beginning of the list
        this.saveState();
        this.renderCards();
    }

    deleteCard(id) {
        this.state.cards = this.state.cards.filter(c => c.id !== id);
        this.saveState();
        this.renderCards();
    }

    triggerCardImageUpload(cardId) {
        const card = this.state.cards.find(c => c.id === cardId);
        if (!card) return;

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                resizeAndCompressImage(file, 640, 360, (dataUrl) => {
                    card.thumbnailImage = dataUrl;
                    this.saveState();
                    this.renderCards();
                });
            }
        };
        fileInput.click();
    }

    triggerAvatarUpload(cardId) {
        const card = this.state.cards.find(c => c.id === cardId);
        if (!card) return;

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                resizeAndCompressImage(file, 80, 80, (dataUrl) => {
                    card.avatarImage = dataUrl;
                    this.saveState();
                    this.renderCards();
                });
            }
        };
        fileInput.click();
    }

    setupDragAndDrop(element, onDropCallback) {
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
}
