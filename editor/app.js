import { animateText } from './animations.js';
import { AnimationRecorder } from './recorder.js';

document.addEventListener('DOMContentLoaded', () => {

    // Initialize Lucide Icons
    lucide.createIcons();

    // DOM Elements
    const inputText = document.getElementById('input-text');
    const textType = document.getElementById('text-type');
    const staticTextFields = document.getElementById('static-text-fields');
    const counterTextFields = document.getElementById('counter-text-fields');
    
    const counterStart = document.getElementById('counter-start');
    const counterEnd = document.getElementById('counter-end');
    const counterPrefix = document.getElementById('counter-prefix');
    const counterSuffix = document.getElementById('counter-suffix');
    const counterPopEffect = document.getElementById('counter-pop-effect');
    
    const fontFamily = document.getElementById('font-family');
    const customFontContainer = document.getElementById('custom-font-input-container');
    const customFontName = document.getElementById('custom-font-name');
    const btnLoadFont = document.getElementById('btn-load-font');
    const uploadFont = document.getElementById('upload-font');
    const uploadedFontStatus = document.getElementById('uploaded-font-status');
    
    const textCase = document.getElementById('text-case');
    const fontSize = document.getElementById('font-size');
    const fontWeight = document.getElementById('font-weight');
    const textScale = document.getElementById('text-scale');
    const textScaleValue = document.getElementById('text-scale-value');
    
    const textColor = document.getElementById('text-color');
    const strokeColor = document.getElementById('stroke-color');
    const strokeWidth = document.getElementById('stroke-width');
    
    const enableShadow = document.getElementById('enable-shadow');
    const shadowControls = document.getElementById('shadow-controls');
    const shadowColor = document.getElementById('shadow-color');
    const shadowBlur = document.getElementById('shadow-blur');
    const shadowAngle = document.getElementById('shadow-angle');
    const shadowDistance = document.getElementById('shadow-distance');
    const shadowOpacity = document.getElementById('shadow-opacity');
    
    const animPreset = document.getElementById('anim-preset');
    const animDuration = document.getElementById('anim-duration');
    const animDelay = document.getElementById('anim-delay');
    const animEase = document.getElementById('anim-ease');
    const staggerSpeed = document.getElementById('stagger-speed');
    const staggerValue = document.getElementById('stagger-value');
    
    const bgType = document.getElementById('bg-type');
    const customBgContainer = document.getElementById('custom-bg-color-container');
    const customBgColor = document.getElementById('custom-bg-color');
    const canvasResolution = document.getElementById('canvas-resolution');
    
    const btnPlay = document.getElementById('btn-play');
    const btnRecord = document.getElementById('btn-record');
    const btnFullscreen = document.getElementById('btn-fullscreen');
    const btnSafeZones = document.getElementById('btn-safe-zones');
    const btnThemeToggle = document.getElementById('btn-theme-toggle');
    
    const viewport = document.getElementById('viewport');
    const animationContainer = document.getElementById('animation-container');
    const animatedText = document.getElementById('animated-text');
    const safeZones = document.getElementById('safe-zones');
    
    const recordingOverlay = document.getElementById('recording-overlay');
    const recordingStatus = document.getElementById('recording-status');
    const recordingProgress = document.getElementById('recording-progress');

    // App State
    let currentTimeline = null;
    let visualScale = 1;
    const recorder = new AnimationRecorder(animationContainer, animatedText);
    const loadedFonts = new Set(['Outfit']);

    // ==========================================================================
    // UI LAYOUT & CANVAS SCALING
    // ==========================================================================

    function getResolution() {
        const val = canvasResolution.value || "2560x1440";
        const [w, h] = val.split('x').map(Number);
        return { width: w || 2560, height: h || 1440 };
    }

    function scaleCanvas() {
        const { width, height } = getResolution();
        
        // Update unscaled dimension styles
        animationContainer.style.width = `${width}px`;
        animationContainer.style.height = `${height}px`;
        
        // Calculate fit scale factor (leaving margin inside viewport)
        const viewportWidth = viewport.clientWidth - 80;
        const viewportHeight = viewport.clientHeight - 80;
        
        const scaleX = viewportWidth / width;
        const scaleY = viewportHeight / height;
        visualScale = Math.min(scaleX, scaleY, 1); // Max scale of 1
        
        // Apply transform scale
        animationContainer.style.transform = `scale(${visualScale})`;
        
        // Update Safe Zones overlay sizes
        safeZones.style.width = `${width}px`;
        safeZones.style.height = `${height}px`;
        safeZones.style.transform = `scale(${visualScale})`;
        
        // Update resolution badge
        document.getElementById('canvas-resolution-badge').textContent = `${width} x ${height}`;
    }

    // Handle viewport resize events
    const resizeObserver = new ResizeObserver(() => scaleCanvas());
    resizeObserver.observe(viewport);

    // ==========================================================================
    // GOOGLE FONTS DYNAMIC LOADER
    // ==========================================================================

    // ==========================================================================
    // UTILITY HELPERS FOR TEXT STYLING
    // ==========================================================================

    function formatTextCase(text, caseType) {
        if (!text) return "";
        switch (caseType) {
            case 'uppercase':
                return text.toUpperCase();
            case 'lowercase':
                return text.toLowerCase();
            case 'titlecase': // Camel Case with spaces
                return text.split(/\s+/).map(word => {
                    if (!word) return '';
                    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                }).join(' ');
            case 'camelcase': // CamelCase without spaces
                return text.split(/\s+/).map(word => {
                    if (!word) return '';
                    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                }).join('');
            default:
                return text;
        }
    }

    function hexToRgba(hex, alpha) {
        const cleanHex = hex.replace('#', '');
        let r, g, b;
        if (cleanHex.length === 3) {
            r = parseInt(cleanHex.charAt(0) + cleanHex.charAt(0), 16);
            g = parseInt(cleanHex.charAt(1) + cleanHex.charAt(1), 16);
            b = parseInt(cleanHex.charAt(2) + cleanHex.charAt(2), 16);
        } else if (cleanHex.length === 6) {
            r = parseInt(cleanHex.substring(0, 2), 16);
            g = parseInt(cleanHex.substring(2, 4), 16);
            b = parseInt(cleanHex.substring(4, 6), 16);
        } else {
            return hex;
        }
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // ==========================================================================
    // GOOGLE FONTS DYNAMIC LOADER
    // ==========================================================================

    function loadGoogleFont(fontName, callback) {
        const trimmedName = fontName.trim();
        if (!trimmedName || loadedFonts.has(trimmedName)) {
            if (callback) callback();
            return;
        }
        
        const fontUrlName = trimmedName.replace(/\s+/g, '+');
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        
        // Single weight presets
        const singleWeightFonts = ['Anton', 'Lilita One', 'Luckiest Guy', 'Bangers'];
        if (singleWeightFonts.includes(trimmedName)) {
            link.href = `https://fonts.googleapis.com/css2?family=${fontUrlName}&display=swap`;
        } else {
            link.href = `https://fonts.googleapis.com/css2?family=${fontUrlName}:wght@300;400;600;800&display=swap`;
        }
        
        link.onload = () => {
            loadedFonts.add(trimmedName);
            console.log(`Font loaded successfully: ${trimmedName}`);
            
            document.fonts.ready.then(() => {
                if (callback) callback();
            });
        };
        
        link.onerror = () => {
            // Fallback for custom search fonts or single-weight fonts
            const fallbackLink = document.createElement('link');
            fallbackLink.rel = 'stylesheet';
            fallbackLink.href = `https://fonts.googleapis.com/css2?family=${fontUrlName}&display=swap`;
            
            fallbackLink.onload = () => {
                loadedFonts.add(trimmedName);
                document.fonts.ready.then(() => {
                    if (callback) callback();
                });
            };
            
            fallbackLink.onerror = () => {
                alert(`No se pudo encontrar o cargar la fuente "${trimmedName}" de Google Fonts. Asegúrate de que el nombre esté bien escrito.`);
            };
            
            document.head.appendChild(fallbackLink);
        };
        
        document.head.appendChild(link);
    }

    // ==========================================================================
    // STYLING & ANIMATION APPLICATION
    // ==========================================================================

    function applyStylesAndPlay() {
        // 1. Gather Font Family
        let selectedFont = fontFamily.value;
        if (selectedFont === 'custom') {
            selectedFont = customFontName.value.trim() || 'Outfit';
        }
        
        // 2. Apply typography & styling directly to text element
        animatedText.style.fontFamily = `"${selectedFont}", sans-serif`;
        animatedText.style.fontSize = `${fontSize.value}px`;
        animatedText.style.fontWeight = fontWeight.value;
        animatedText.style.color = textColor.value;
        
        // Apply text scale factor to wrapper element (so GSAP char-span math remains unaffected)
        const scaleVal = parseFloat(textScale.value) || 1;
        const textWrapper = document.getElementById('animated-text-wrapper');
        if (textWrapper) {
            textWrapper.style.transform = `scale(${scaleVal})`;
        }
        
        // Stroke
        const strokeW = parseFloat(strokeWidth.value) || 0;
        if (strokeW > 0) {
            // Since we paint stroke first, then fill (using paint-order: stroke fill),
            // the fill covers the inner half of the stroke. We double the width to keep the same visual thickness.
            animatedText.style.webkitTextStroke = `${strokeW * 2}px ${strokeColor.value}`;
        } else {
            animatedText.style.webkitTextStroke = 'unset';
        }
        
        // Shadow (Advanced controls)
        if (enableShadow.checked) {
            const blurVal = parseInt(shadowBlur.value) || 0;
            const angleDeg = parseFloat(shadowAngle.value) ?? 45;
            const distance = parseFloat(shadowDistance.value) ?? 6;
            const angleRad = (angleDeg * Math.PI) / 180;
            const offsetX = (distance * Math.cos(angleRad)).toFixed(1);
            const offsetY = (distance * Math.sin(angleRad)).toFixed(1);
            const opacityVal = (parseInt(shadowOpacity.value) ?? 50) / 100;
            const rgbaColor = hexToRgba(shadowColor.value, opacityVal);
            animatedText.style.textShadow = `${rgbaColor} ${offsetX}px ${offsetY}px ${blurVal}px`;
        } else {
            animatedText.style.textShadow = 'none';
        }

        // 3. Compile Animation Config
        const isCounter = textType.value === 'counter';
        const textCaseVal = textCase.value;
        
        const config = {
            textType: textType.value,
            text: isCounter ? "" : formatTextCase(inputText.value, textCaseVal),
            preset: animPreset.value,
            duration: parseFloat(animDuration.value) || 1.5,
            delay: parseFloat(animDelay.value) || 0.2,
            ease: animEase.value,
            stagger: parseFloat(staggerSpeed.value) || 0.05,
            counterConfig: {
                start: parseInt(counterStart.value) ?? 1,
                end: parseInt(counterEnd.value) ?? 6,
                prefix: formatTextCase(counterPrefix.value, textCaseVal),
                suffix: formatTextCase(counterSuffix.value, textCaseVal),
                popEffect: counterPopEffect.checked
            }
        };

        // 4. Run Animation Timeline
        currentTimeline = animateText(animatedText, config);
        
        // Update duration badge
        const totalDuration = currentTimeline.totalDuration();
        const exportDuration = totalDuration + 1.5;
        const durationBadge = document.getElementById('animation-duration-badge');
        if (durationBadge) {
            durationBadge.textContent = `Duración: ${totalDuration.toFixed(1)}s (Exportación: ${exportDuration.toFixed(1)}s)`;
        }

    }

    // Helper to start styles & font load sequence
    function triggerUpdate() {
        let selectedFont = fontFamily.value;
        if (selectedFont === 'custom') {
            const name = customFontName.value.trim();
            if (name) {
                loadGoogleFont(name, applyStylesAndPlay);
                return;
            }
        }
        applyStylesAndPlay();
    }

    // ==========================================================================
    // EVENT LISTENERS & INTERACTION
    // ==========================================================================

    // Toggle Text Type (Static vs Counter fields)
    textType.addEventListener('change', () => {
        if (textType.value === 'static') {
            staticTextFields.classList.remove('hidden');
            counterTextFields.classList.add('hidden');
        } else {
            staticTextFields.classList.add('hidden');
            counterTextFields.classList.remove('hidden');
        }
        triggerUpdate();
    });

    // Font selection changes
    fontFamily.addEventListener('change', () => {
        if (fontFamily.value === 'custom') {
            customFontContainer.classList.remove('hidden');
        } else {
            customFontContainer.classList.add('hidden');
            // Check standard preloaded fonts
            const googlePresets = [
                'Montserrat', 'Playfair Display', 'Bebas Neue', 'Fredoka', 'Space Grotesk',
                'Anton', 'Poppins', 'Lilita One', 'Luckiest Guy', 'Oswald'
            ];
            if (googlePresets.includes(fontFamily.value)) {
                loadGoogleFont(fontFamily.value, applyStylesAndPlay);
            } else {
                applyStylesAndPlay();
            }
        }
    });

    btnLoadFont.addEventListener('click', () => {
        const name = customFontName.value.trim();
        if (name) {
            loadGoogleFont(name, applyStylesAndPlay);
        }
    });

    // Custom Font File Upload handling
    uploadFont.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            // Create a unique clean font name from the file name
            const fontName = 'uploaded_' + file.name.substring(0, file.name.lastIndexOf('.')).replace(/[^a-zA-Z0-9]/g, '_');
            
            const fontFace = new FontFace(fontName, e.target.result);
            fontFace.load().then(function(loadedFace) {
                document.fonts.add(loadedFace);
                
                // Add option to select dropdown and select it
                let customOption = document.createElement('option');
                customOption.value = fontName;
                customOption.textContent = `Local: ${file.name}`;
                customOption.selected = true;
                
                fontFamily.appendChild(customOption);
                
                // Show status
                uploadedFontStatus.textContent = `¡Fuente "${file.name}" cargada con éxito!`;
                uploadedFontStatus.classList.remove('hidden');
                
                // Reset file input so same file can be uploaded again if needed
                uploadFont.value = '';
                
                // Trigger update
                triggerUpdate();
            }).catch(function(error) {
                console.error(error);
                alert('Error al procesar el archivo de fuente. Asegúrate de usar un formato válido (.ttf, .otf, .woff, o .woff2).');
            });
        };
        reader.readAsArrayBuffer(file);
    });

    // Background type changes
    bgType.addEventListener('change', () => {
        // Clear background classes
        animationContainer.className = '';
        animationContainer.removeAttribute('style'); // Clear custom color
        
        const selectedBg = bgType.value;
        if (selectedBg === 'chroma-green') {
            animationContainer.classList.add('chroma-green');
            customBgContainer.classList.add('hidden');
        } else if (selectedBg === 'chroma-blue') {
            animationContainer.classList.add('chroma-blue');
            customBgContainer.classList.add('hidden');
        } else if (selectedBg === 'transparent') {
            animationContainer.classList.add('chroma-transparent');
            customBgContainer.classList.add('hidden');
        } else {
            customBgContainer.classList.remove('hidden');
            animationContainer.style.backgroundColor = customBgColor.value;
        }
        scaleCanvas(); // Trigger rescale
    });

    customBgColor.addEventListener('input', () => {
        animationContainer.style.backgroundColor = customBgColor.value;
    });

    // Text scale slider update
    textScale.addEventListener('input', () => {
        textScaleValue.textContent = `${parseFloat(textScale.value).toFixed(1)}x`;
        triggerUpdate();
    });

    // Toggle shadow sub-fields
    enableShadow.addEventListener('change', () => {
        if (enableShadow.checked) {
            shadowControls.classList.remove('hidden');
        } else {
            shadowControls.classList.add('hidden');
        }
        triggerUpdate();
    });

    // Stagger slide text update
    staggerSpeed.addEventListener('input', () => {
        staggerValue.textContent = `${staggerSpeed.value}s`;
        triggerUpdate();
    });

    // Resolution changes
    canvasResolution.addEventListener('change', () => {
        scaleCanvas();
        triggerUpdate();
    });

    // Inline triggers for styled elements (to react instantly to sliders/pickers)
    const instantControls = [
        inputText, counterStart, counterEnd, counterPrefix, counterSuffix, 
        counterPopEffect, fontSize, fontWeight, textColor, strokeColor, 
        strokeWidth, shadowColor, shadowBlur, shadowAngle, shadowDistance,
        shadowOpacity, textCase, animPreset, animDuration, animDelay, animEase
    ];
    
    instantControls.forEach(control => {
        if (control) {
            control.addEventListener('input', () => triggerUpdate());
            control.addEventListener('change', () => triggerUpdate());
        }
    });

    // Action Buttons
    btnPlay.addEventListener('click', () => {
        triggerUpdate();
    });

    btnSafeZones.addEventListener('click', () => {
        safeZones.classList.toggle('hidden');
        btnSafeZones.classList.toggle('btn-secondary');
    });

    if (btnThemeToggle) {
        btnThemeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('global_theme', newTheme);
        });
    }

    btnFullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            // Enter fullscreen for viewport container to allow clean OBS capture
            animationContainer.classList.add('fullscreen-canvas');
            animationContainer.style.transform = 'none';
            
            animationContainer.requestFullscreen().catch(err => {
                alert(`Error al activar pantalla completa: ${err.message}`);
                animationContainer.classList.remove('fullscreen-canvas');
                scaleCanvas();
            });
        } else {
            document.exitFullscreen();
        }
    });

    // Exit fullscreen clean-up
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            animationContainer.classList.remove('fullscreen-canvas');
            scaleCanvas();
            triggerUpdate();
        }
    });

    // ==========================================================================
    // EXPORT VIDEO IMPLEMENTATION
    // ==========================================================================

    btnRecord.addEventListener('click', () => {
        // Ensure styles and timeline are up-to-date
        triggerUpdate();
        
        if (!currentTimeline) {
            alert('Error: No hay una animación cargada para exportar.');
            return;
        }

        // Pause timeline immediately at 0 so it doesn't play during the transition delay
        currentTimeline.pause(0);

        // Disable UI buttons
        btnPlay.disabled = true;
        btnRecord.disabled = true;
        recordingOverlay.classList.remove('hidden');
        recordingProgress.style.width = '0%';
        recordingStatus.textContent = 'Inicializando el renderizador...';

        const { width, height } = getResolution();
        const exportConfig = {
            width: width,
            height: height,
            bgType: bgType.value,
            customBgColor: customBgColor.value
        };

        // Delay starting slightly to let overlay overlay transition
        setTimeout(() => {
            recorder.exportVideo(
                currentTimeline,
                exportConfig,
                (progress) => {
                    // Progress callback
                    const percent = Math.round(progress * 100);
                    recordingProgress.style.width = `${percent}%`;
                    recordingStatus.textContent = `Renderizando animación: ${percent}% (60fps sin lag)`;
                },
                (videoUrl) => {
                    // Complete callback
                    recordingStatus.textContent = 'Codificación completada. Descargando video...';
                    
                    // Create automatic download link
                    const isTransparent = bgType.value === 'transparent';
                    const fileExtension = 'webm';
                    
                    const a = document.createElement('a');
                    a.href = videoUrl;
                    a.download = `animacion-texto-${textType.value === 'counter' ? 'cronometro' : 'chroma'}.${fileExtension}`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    
                    // Delay hiding overlay to let download initiate
                    setTimeout(() => {
                        recordingOverlay.classList.add('hidden');
                        btnPlay.disabled = false;
                        btnRecord.disabled = false;
                    }, 1000);
                }
            );
        }, 500);
    });

    // ==========================================================================
    // SLIDER AND NUMBER SYNC
    // ==========================================================================
    function linkSliderAndNumber(sliderId, numberId) {
        const slider = document.getElementById(sliderId);
        const number = document.getElementById(numberId);
        if (!slider || !number) return;
        
        slider.addEventListener('input', () => {
            number.value = slider.value;
            // Dispatch input event to trigger the main update listener
            number.dispatchEvent(new Event('input'));
        });
        
        number.addEventListener('input', () => {
            const val = parseFloat(number.value);
            if (!isNaN(val)) {
                slider.value = val;
            }
        });
    }

    // Link all slider-number pairs
    linkSliderAndNumber('font-size-slider', 'font-size');
    linkSliderAndNumber('stroke-width-slider', 'stroke-width');
    linkSliderAndNumber('shadow-blur-slider', 'shadow-blur');
    linkSliderAndNumber('shadow-angle-slider', 'shadow-angle');
    linkSliderAndNumber('shadow-distance-slider', 'shadow-distance');
    linkSliderAndNumber('shadow-opacity-slider', 'shadow-opacity');
    linkSliderAndNumber('anim-duration-slider', 'anim-duration');
    linkSliderAndNumber('anim-delay-slider', 'anim-delay');

    // Initial load trigger
    scaleCanvas();
    setTimeout(() => triggerUpdate(), 300);
});
