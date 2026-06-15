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
    
    // Select targets based on staggerMode
    let targets;
    if (config.staggerMode === 'word') {
        targets = element.querySelectorAll('.word-span');
    } else if (config.staggerMode === 'line') {
        targets = element.querySelectorAll('.line-container');
    } else {
        targets = element.querySelectorAll('.char-span');
    }
    
    if (targets.length === 0) return tl;
    
    const duration = Number(config.duration) || 1.0;
    const delay = Number(config.delay) || 0;
    const ease = config.ease || "power2.out";
    const stagger = Number(config.stagger) || 0.05;
    
    // --- STAGE 1: INTRO ---
    let introTween = null;
    switch (config.preset) {
        case 'fade':
            introTween = gsap.fromTo(targets, { opacity: 0 }, { opacity: 1, duration: duration, ease: ease, stagger: stagger });
            break;
            
        case 'slide-up':
            introTween = gsap.fromTo(targets, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: duration, ease: ease, stagger: stagger });
            break;
            
        case 'slide-down':
            introTween = gsap.fromTo(targets, { opacity: 0, y: -50 }, { opacity: 1, y: 0, duration: duration, ease: ease, stagger: stagger });
            break;
            
        case 'zoom-in':
            introTween = gsap.fromTo(targets, { opacity: 0, scale: 0, transformOrigin: "center center" }, { opacity: 1, scale: 1, duration: duration, ease: ease, stagger: stagger });
            break;
            
        case 'blur-reveal':
            introTween = gsap.fromTo(targets, { opacity: 0, filter: "blur(15px)", y: 15 }, { opacity: 1, filter: "blur(0px)", y: 0, duration: duration, ease: ease, stagger: stagger });
            break;
            
        case 'elastic-bounce':
            introTween = gsap.fromTo(targets, { opacity: 0, y: 80, scaleY: 1.8 }, { opacity: 1, y: 0, scaleY: 1, duration: duration, ease: ease, stagger: stagger });
            break;
            
        case 'typewriter':
            introTween = gsap.fromTo(targets, { opacity: 0 }, { 
                opacity: 1, 
                duration: 0.01, 
                ease: "none", 
                stagger: {
                    each: duration / targets.length,
                }
            });
            break;
            
        case 'kinetic-wave':
            introTween = gsap.timeline();
            introTween.fromTo(targets, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: duration * 0.4, ease: "power1.out", stagger: stagger });
            introTween.to(targets, {
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
            }, 0.3);
            break;
            
        case 'none':
            introTween = gsap.fromTo(targets, { opacity: 1 }, { opacity: 1, duration: 0.01 });
            break;
            
        default:
            introTween = gsap.fromTo(targets, { opacity: 0 }, { opacity: 1, duration: duration, ease: ease, stagger: stagger });
    }
    
    tl.add(introTween, delay);
    
    // Calculate end of Intro animation
    const introEndTime = delay + tl.duration();
    const holdDuration = Number(config.holdDuration) || 3.0;
    
    // --- STAGE 2: LOOP / EMPHASIS ---
    if (config.loopPreset && config.loopPreset !== 'none') {
        const loopCycle = Number(config.loopCycleDuration) || 1.5;
        const intensity = Number(config.loopIntensity) || 1.0;
        const repeats = Math.max(1, Math.round(holdDuration / loopCycle));
        
        switch (config.loopPreset) {
            case 'pulse':
                tl.to(targets, {
                    scale: 1 + (0.15 * intensity),
                    duration: loopCycle / 2,
                    yoyo: true,
                    repeat: repeats * 2 - 1,
                    ease: "power1.inOut",
                    stagger: stagger
                }, introEndTime);
                break;
            case 'float':
                tl.to(targets, {
                    y: -15 * intensity,
                    duration: loopCycle / 2,
                    yoyo: true,
                    repeat: repeats * 2 - 1,
                    ease: "power1.inOut",
                    stagger: stagger
                }, introEndTime);
                break;
            case 'glow':
                tl.to(targets, {
                    filter: `brightness(${1 + 0.35 * intensity})`,
                    duration: loopCycle / 2,
                    yoyo: true,
                    repeat: repeats * 2 - 1,
                    ease: "power1.inOut",
                    stagger: stagger
                }, introEndTime);
                break;
            case 'flicker':
                tl.to(targets, {
                    opacity: 0.4 + (0.3 * (1 - Math.min(1, intensity/5))),
                    duration: 0.1,
                    yoyo: true,
                    repeat: Math.round(holdDuration / 0.2),
                    ease: "steps(1)"
                }, introEndTime);
                break;
        }
    }
    
    // --- STAGE 3: OUTRO ---
    const outroStartTime = introEndTime + holdDuration;
    if (config.outroPreset && config.outroPreset !== 'none') {
        const outroDuration = Number(config.outroDuration) || 1.0;
        const outroEase = config.outroEase || "power2.in";
        
        switch (config.outroPreset) {
            case 'fade':
                tl.to(targets, {
                    opacity: 0,
                    duration: outroDuration,
                    ease: outroEase,
                    stagger: stagger
                }, outroStartTime);
                break;
            case 'slide-up':
                tl.to(targets, {
                    opacity: 0,
                    y: -60,
                    duration: outroDuration,
                    ease: outroEase,
                    stagger: stagger
                }, outroStartTime);
                break;
            case 'slide-down':
                tl.to(targets, {
                    opacity: 0,
                    y: 60,
                    duration: outroDuration,
                    ease: outroEase,
                    stagger: stagger
                }, outroStartTime);
                break;
            case 'zoom-out':
                tl.to(targets, {
                    opacity: 0,
                    scale: 0,
                    duration: outroDuration,
                    ease: outroEase,
                    stagger: stagger
                }, outroStartTime);
                break;
        }
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
