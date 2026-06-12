/**
 * CHROMA TEXT STUDIO - ANIMATION ENGINE (GSAP)
 * Handles text splitting and timeline creations for all presets.
 */

// Helper to split text into characters and words while preserving line breaks
function splitTextIntoSpans(element) {
    const rawText = element.textContent;
    element.innerHTML = '';
    
    // Split by lines first
    const lines = rawText.split('\n');
    
    lines.forEach((line, lineIndex) => {
        const lineDiv = document.createElement('div');
        lineDiv.className = 'line-container';
        lineDiv.style.display = 'block';
        lineDiv.style.minHeight = '1em'; // Prevent empty lines collapsing
        
        // Split line by words
        const words = line.split(' ');
        words.forEach((word, wordIndex) => {
            if (word === '' && words.length > 1) return;
            
            const wordSpan = document.createElement('span');
            wordSpan.className = 'word-span';
            
            // Split word by characters
            const chars = word.split('');
            chars.forEach(char => {
                const charSpan = document.createElement('span');
                charSpan.className = 'char-span';
                charSpan.textContent = char;
                wordSpan.appendChild(charSpan);
            });
            
            lineDiv.appendChild(wordSpan);
            
            // Add spacing between words
            if (wordIndex < words.length - 1) {
                const space = document.createTextNode(' ');
                lineDiv.appendChild(space);
            }
        });
        
        element.appendChild(lineDiv);
    });
}

/**
 * Creates and runs a GSAP Timeline based on user configuration
 * @param {HTMLElement} element - The target text element
 * @param {Object} config - Configuration parameters
 * @returns {gsap.core.Timeline} The GSAP timeline object
 */
export function animateText(element, config) {
    // 1. Kill any existing animations on this element
    gsap.killTweensOf(element);
    gsap.killTweensOf(element.querySelectorAll('.char-span, .word-span, .line-container'));
    
    // Reset only animated element styles to preserve manual font/color/shadow/stroke styles
    gsap.set(element, { clearProps: "opacity,x,y,scale,scaleX,scaleY,rotation,transform,filter" });

    
    const tl = gsap.timeline({
        onStart: config.onStart || null,
        onUpdate: config.onUpdate || null,
        onComplete: config.onComplete || null
    });
    
    // Check if it's a counter animation
    if (config.textType === 'counter') {
        runCounterAnimation(element, config, tl);
        return tl;
    }
    
    // 2. Prepare text for static character animation
    // Force set text content first, then split it
    element.textContent = config.text || "Texto Animado";
    splitTextIntoSpans(element);
    
    const chars = element.querySelectorAll('.char-span');
    if (chars.length === 0) return tl;
    
    const duration = Number(config.duration) || 1.0;
    const delay = Number(config.delay) || 0;
    const ease = config.ease || "power2.out";
    const stagger = Number(config.stagger) || 0.05;
    
    // 3. Apply animations based on selected preset
    switch (config.preset) {
        case 'fade':
            tl.fromTo(chars, 
                { opacity: 0 },
                { opacity: 1, duration: duration, ease: ease, stagger: stagger },
                delay
            );
            break;
            
        case 'slide-up':
            tl.fromTo(chars, 
                { opacity: 0, y: 50 },
                { opacity: 1, y: 0, duration: duration, ease: ease, stagger: stagger },
                delay
            );
            break;
            
        case 'slide-down':
            tl.fromTo(chars, 
                { opacity: 0, y: -50 },
                { opacity: 1, y: 0, duration: duration, ease: ease, stagger: stagger },
                delay
            );
            break;
            
        case 'zoom-in':
            tl.fromTo(chars, 
                { opacity: 0, scale: 0, transformOrigin: "center center" },
                { opacity: 1, scale: 1, duration: duration, ease: ease, stagger: stagger },
                delay
            );
            break;
            
        case 'blur-reveal':
            tl.fromTo(chars, 
                { opacity: 0, filter: "blur(15px)", y: 15 },
                { opacity: 1, filter: "blur(0px)", y: 0, duration: duration, ease: ease, stagger: stagger },
                delay
            );
            break;
            
        case 'elastic-bounce':
            tl.fromTo(chars, 
                { opacity: 0, y: 80, scaleY: 1.8 },
                { opacity: 1, y: 0, scaleY: 1, duration: duration, ease: ease, stagger: stagger },
                delay
            );
            break;
            
        case 'typewriter':
            // Fast toggle from invisible to visible
            tl.fromTo(chars, 
                { opacity: 0 },
                { 
                    opacity: 1, 
                    duration: 0.01, 
                    ease: "none", 
                    stagger: {
                        each: duration / chars.length,
                    }
                },
                delay
            );
            break;
            
        case 'kinetic-wave':
            // Slide up, then settle back down in wave format
            tl.fromTo(chars,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: duration * 0.4, ease: "power1.out", stagger: stagger },
                delay
            );
            
            // Continuous wave hover effect if configured for looping, or just an extra bounce
            tl.to(chars, {
                y: -15,
                duration: 0.25,
                ease: "power1.inOut",
                stagger: {
                    each: stagger,
                    grid: "auto",
                    from: "start"
                },
                repeat: 1,
                yoyo: true
            }, delay + 0.3);
            break;
            
        default:
            // Default Fade
            tl.fromTo(chars, 
                { opacity: 0 },
                { opacity: 1, duration: duration, ease: ease, stagger: stagger },
                delay
            );
    }
    
    return tl;
}

/**
 * Creates a counter animation timeline
 */
function runCounterAnimation(element, config, timeline) {
    const start = Number(config.counterConfig.start) ?? 1;
    const end = Number(config.counterConfig.end) ?? 6;
    const prefix = config.counterConfig.prefix || '';
    const suffix = config.counterConfig.suffix || '';
    const popEffect = config.counterConfig.popEffect !== false;
    
    const duration = Number(config.duration) || 2.0;
    const delay = Number(config.delay) || 0;
    const ease = config.ease || "power1.inOut";
    
    // Set initial text state
    element.textContent = `${prefix}${start}${suffix}`;
    
    // Object containing target variable to Tween
    const countObj = { value: start };
    let lastFloorValue = start;
    
    // Add tween to timeline
    timeline.to(countObj, {
        value: end,
        duration: duration,
        ease: ease,
        onStart: () => {
            element.textContent = `${prefix}${start}${suffix}`;
        },
        onUpdate: () => {
            // Standard rounded value
            const currentFloorValue = Math.round(countObj.value);
            element.textContent = `${prefix}${currentFloorValue}${suffix}`;
            
            // Trigger pop effect on integer changes
            if (popEffect && currentFloorValue !== lastFloorValue) {
                lastFloorValue = currentFloorValue;
                
                // Fast pop animation
                gsap.fromTo(element, 
                    { scale: 1.3, filter: "brightness(1.5)" },
                    { scale: 1, filter: "brightness(1)", duration: 0.35, ease: "back.out(2)" }
                );
            }
        },
        onComplete: () => {
            element.textContent = `${prefix}${end}${suffix}`;
        }
    }, delay);
}
