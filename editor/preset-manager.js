import { DEFAULT_PRESETS } from './presets.js';

export class PresetManager {
    constructor(options) {
        this.presetSelect = options.presetSelect;
        this.btnSavePreset = options.btnSavePreset;
        this.btnDeletePreset = options.btnDeletePreset;
        this.elementsToSave = options.elementsToSave;
        this.onLoadPreset = options.onLoadPreset;
        this.storageKey = 'chroma_studio_presets';
        this.customPresets = {};

        this.init();
    }

    init() {
        this.initPresets();

        // Preset selection change listener
        this.presetSelect.addEventListener('change', () => {
            const val = this.presetSelect.value;
            if (!val) return;
            
            let presetData = null;
            if (val.startsWith('factory:')) {
                const name = val.substring(8);
                presetData = DEFAULT_PRESETS[name];
            } else if (val.startsWith('user:')) {
                const name = val.substring(5);
                presetData = this.customPresets[name];
            }
            
            if (presetData) {
                this.loadPresetData(presetData);
            }
        });

        // Save preset listener
        this.btnSavePreset.addEventListener('click', () => {
            this.savePreset();
        });

        // Delete preset listener
        this.btnDeletePreset.addEventListener('click', () => {
            this.deletePreset();
        });
    }

    initPresets() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.customPresets = JSON.parse(stored);
            }
        } catch (e) {
            console.error('Error loading presets from localStorage:', e);
        }
        this.renderPresetSelect();
    }

    renderPresetSelect() {
        this.presetSelect.innerHTML = '<option value="">-- Selecciona un Preset --</option>';
        
        const factoryGroup = document.createElement('optgroup');
        factoryGroup.label = 'Predeterminados de Fábrica';
        for (const name of Object.keys(DEFAULT_PRESETS)) {
            const opt = document.createElement('option');
            opt.value = 'factory:' + name;
            opt.textContent = name;
            factoryGroup.appendChild(opt);
        }
        this.presetSelect.appendChild(factoryGroup);
        
        if (Object.keys(this.customPresets).length > 0) {
            const userGroup = document.createElement('optgroup');
            userGroup.label = 'Mis Presets';
            for (const name of Object.keys(this.customPresets)) {
                const opt = document.createElement('option');
                opt.value = 'user:' + name;
                opt.textContent = name;
                userGroup.appendChild(opt);
            }
            this.presetSelect.appendChild(userGroup);
        }
    }

    loadPresetData(presetData) {
        for (const [id, value] of Object.entries(presetData)) {
            const el = document.getElementById(id);
            if (!el) continue;
            
            if (el.type === 'checkbox') {
                el.checked = value === 'true';
            } else {
                el.value = value;
            }
            // Dispatch input and change events to sync UI and sliders
            el.dispatchEvent(new Event('input'));
            el.dispatchEvent(new Event('change'));
        }

        if (this.onLoadPreset) {
            this.onLoadPreset(presetData);
        }
    }

    savePreset() {
        const name = prompt('Escribe el nombre de tu nuevo preset:');
        if (!name) return;
        
        const cleanName = name.trim();
        if (!cleanName) return;
        
        const presetData = {};
        this.elementsToSave.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                if (el.type === 'checkbox') {
                    presetData[id] = el.checked ? 'true' : 'false';
                } else {
                    presetData[id] = el.value;
                }
            }
        });
        
        this.customPresets[cleanName] = presetData;
        
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.customPresets));
            alert(`Preset "${cleanName}" guardado correctamente.`);
            this.renderPresetSelect();
            this.presetSelect.value = 'user:' + cleanName;
        } catch (e) {
            alert('Error al guardar el preset: LocalStorage lleno o deshabilitado.');
        }
    }

    deletePreset() {
        const val = this.presetSelect.value;
        if (!val) {
            alert('Por favor selecciona un preset de la lista para eliminarlo.');
            return;
        }
        
        if (val.startsWith('factory:')) {
            alert('No se pueden eliminar los presets predeterminados de fábrica.');
            return;
        }
        
        const name = val.substring(5);
        if (confirm(`¿Estás seguro de que deseas eliminar el preset "${name}"?`)) {
            delete this.customPresets[name];
            try {
                localStorage.setItem(this.storageKey, JSON.stringify(this.customPresets));
                alert(`Preset "${name}" eliminado.`);
                this.renderPresetSelect();
            } catch (e) {
                console.error(e);
            }
        }
    }
}
