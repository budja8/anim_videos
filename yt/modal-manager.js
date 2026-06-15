export class ModalManager {
    constructor(triggers, sidebar) {
        this.triggers = triggers;
        this.sidebar = sidebar;
        this.init();
    }

    init() {
        Object.keys(this.triggers).forEach(triggerId => {
            const btn = document.getElementById(triggerId);
            const modalId = this.triggers[triggerId];
            const modal = document.getElementById(modalId);
            
            if (btn && modal) {
                btn.addEventListener('click', () => {
                    modal.classList.add('active');
                    // Close mobile menu/sidebar if active
                    if (this.sidebar) {
                        this.sidebar.classList.remove('active');
                    }
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
}
