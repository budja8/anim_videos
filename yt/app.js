import { resizeAndCompressImage } from './utils.js';
import { GRADIENTS, getDefaultCards } from './config.js';
import { ModalManager } from './modal-manager.js';
import { CardManager } from './card-manager.js';

// Application State
let state = {
    theme: 'light',
    viewMode: 'home',
    globalThumbnail: null,
    cards: []
};

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

// Modal Elements Configuration
const modalTriggers = {
    'nav-instructions': 'modal-instructions',
    'nav-updates': 'modal-updates',
    'nav-feedback': 'modal-feedback',
    'nav-about': 'modal-about',
    'nav-roadmap': 'modal-roadmap',
    'nav-donate': 'modal-donate'
};

// Managers
let cardManager = null;
let modalManager = null;

/* Core Functions */

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
        cards: getDefaultCards()
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

        cardManager.addNewCard(titleText);
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
                cardManager.renderCards();
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
            cardManager.renderCards();
        }
    });
}

// Initialize App
function init() {
    loadState();

    // Initialize Managers
    cardManager = new CardManager({
        state: state,
        cardsGrid: cardsGrid,
        saveState: saveState,
        globalUploadLabel: globalUploadLabel
    });

    modalManager = new ModalManager(modalTriggers, sidebar);

    setupEventListeners();
    applyTheme();
    applyViewMode();
    
    // Sync UI text if global thumbnail exists
    if (state.globalThumbnail) {
        globalUploadLabel.querySelector('span').textContent = 'Miniatura Aplicada';
    }

    cardManager.renderCards();
}

// Initialize on Load
window.addEventListener('DOMContentLoaded', init);
