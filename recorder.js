/**
 * CHROMA TEXT STUDIO - VIDEO RECORDER
 * Captures HTML text animations into high-quality WebM videos with chroma green or alpha transparency.
 */

class AnimationRecorder {
    constructor(animationContainer, targetTextElement) {
        this.container = animationContainer;
        this.textElement = targetTextElement;
        
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d', { alpha: true });
        
        this.isRecording = false;
        this.chunks = [];
        this.recorder = null;
        
        // Bind methods
        this.drawFrame = this.drawFrame.bind(this);
    }

    /**
     * Parse text shadow string into canvas shadow parameters
     */
    parseTextShadow(shadowStr) {
        if (!shadowStr || shadowStr === 'none') return null;
        
        // Handle multiple shadows (just grab the first one for simplicity)
        const singleShadow = shadowStr.split(',')[0].trim();
        
        // Regex to match colors (rgb/rgba/hex) and numbers
        const colorRegex = /(rgba?\(.*?\)|#[a-fA-F0-9]{3,8}|[a-zA-Z]+)/;
        const colorMatch = singleShadow.match(colorRegex);
        
        if (!colorMatch) return null;
        
        const color = colorMatch[0];
        const rest = singleShadow.replace(color, '').trim();
        const parts = rest.split(/\s+/).map(p => parseFloat(p) || 0);
        
        return {
            color: color,
            offsetX: parts[0] || 0,
            offsetY: parts[1] || 0,
            blur: parts[2] || 0
        };
    }

    /**
     * Draws the current HTML animation state onto the export canvas
     */
    drawFrame(width, height, bgType, customBgColor) {
        const ctx = this.ctx;
        
        // 1. Reset and clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // 2. Draw background
        if (bgType === 'chroma-green') {
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(0, 0, width, height);
        } else if (bgType === 'chroma-blue') {
            ctx.fillStyle = '#0000ff';
            ctx.fillRect(0, 0, width, height);
        } else if (bgType === 'custom') {
            ctx.fillStyle = customBgColor || '#00ff00';
            ctx.fillRect(0, 0, width, height);
        } else {
            // Transparent - do nothing, keep clear
        }

        // 3. Find all character spans to draw
        const chars = this.textElement.querySelectorAll('.char-span');
        const containerRect = this.container.getBoundingClientRect();
        
        // Calculate visual scale of preview container (to map to actual export resolution)
        const previewWidth = containerRect.width;
        const previewHeight = containerRect.height;
        const scaleX = previewWidth / width;
        const scaleY = previewHeight / height;
        
        // Read parent text wrapper scale to apply to canvas exporter
        const wrapper = this.textElement.parentElement; // #animated-text-wrapper
        let wrapperScale = 1;
        if (wrapper) {
            const wrapperStyle = window.getComputedStyle(wrapper);
            if (wrapperStyle.transform && wrapperStyle.transform !== 'none') {
                const match = wrapperStyle.transform.match(/matrix\(([^,]+),([^,]+),([^,]+),([^,]+),([^,]+),([^,]+)\)/);
                if (match) {
                    wrapperScale = parseFloat(match[1]); // Scale X
                }
            }
        }

        // Apply wrapper scale from the center of the export canvas
        if (wrapperScale !== 1) {
            ctx.save();
            ctx.translate(width / 2, height / 2);
            ctx.scale(wrapperScale, wrapperScale);
            ctx.translate(-width / 2, -height / 2);
        }

        if (chars.length > 0) {
            chars.forEach(char => {
                const style = window.getComputedStyle(char);
                const opacity = parseFloat(style.opacity);
                if (opacity <= 0.01) return; // Skip invisible characters
                
                // Get layout coordinates (untransformed)
                const charX = char.offsetLeft;
                const charY = char.offsetTop;
                
                // Get dimensions
                const charWidth = char.offsetWidth;
                const charHeight = char.offsetHeight;
                
                ctx.save();
                
                // Apply global opacity
                ctx.globalAlpha = opacity;
                
                // 4. Handle CSS Transforms relative to the character's center
                const originX = charX + charWidth / 2;
                const originY = charY + charHeight / 2;
                
                // Set origin on canvas
                ctx.translate(originX, originY);
                
                // Parse matrix transform
                let a = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0;
                if (style.transform && style.transform !== 'none') {
                    const match = style.transform.match(/matrix\(([^,]+),([^,]+),([^,]+),([^,]+),([^,]+),([^,]+)\)/);
                    if (match) {
                        a = parseFloat(match[1]);
                        b = parseFloat(match[2]);
                        c = parseFloat(match[3]);
                        d = parseFloat(match[4]);
                        // Scale translations to export resolution if needed, but since offsetLeft/offsetTop 
                        // are unscaled, we translate them directly
                        tx = parseFloat(match[5]) / scaleX;
                        ty = parseFloat(match[6]) / scaleY;
                    }
                }
                
                // Apply transform matrix
                ctx.transform(a, b, c, d, tx, ty);
                
                // Reset origin back
                ctx.translate(-originX, -originY);
                
                // 5. Apply Text Styling
                ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
                ctx.textBaseline = 'top';
                ctx.textAlign = 'left';
                
                // Shadows
                const shadow = this.parseTextShadow(style.textShadow);
                if (shadow) {
                    ctx.shadowColor = shadow.color;
                    ctx.shadowBlur = shadow.blur;
                    ctx.shadowOffsetX = shadow.offsetX;
                    ctx.shadowOffsetY = shadow.offsetY;
                }
                
                // Text stroke (Border)
                const strokeWidth = parseFloat(style.webkitTextStrokeWidth) || 0;
                const strokeColor = style.webkitTextStrokeColor;
                
                // Draw text fill
                ctx.fillStyle = style.color;
                ctx.fillText(char.textContent, charX, charY);
                
                // Draw text outline (behind shadow settings)
                if (strokeWidth > 0) {
                    ctx.shadowColor = 'transparent'; // Disable shadow on stroke to avoid double shadow
                    ctx.strokeStyle = strokeColor;
                    ctx.lineWidth = strokeWidth;
                    ctx.lineJoin = 'round';
                    ctx.strokeText(char.textContent, charX, charY);
                }
                
                ctx.restore();
            });
        } else {
            // Draw full text as single block if no split spans exist (e.g. backup or single counter text)
            const style = window.getComputedStyle(this.textElement);
            const opacity = parseFloat(style.opacity);
            
            if (opacity > 0.01) {
                ctx.save();
                ctx.globalAlpha = opacity;
                
                ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center';
                
                // Style properties
                ctx.fillStyle = style.color;
                
                // Shadows
                const shadow = this.parseTextShadow(style.textShadow);
                if (shadow) {
                    ctx.shadowColor = shadow.color;
                    ctx.shadowBlur = shadow.blur;
                    ctx.shadowOffsetX = shadow.offsetX;
                    ctx.shadowOffsetY = shadow.offsetY;
                }
                
                // Draw at center of canvas
                ctx.fillText(this.textElement.textContent, width / 2, height / 2);
                
                const strokeWidth = parseFloat(style.webkitTextStrokeWidth) || 0;
                if (strokeWidth > 0) {
                    ctx.shadowColor = 'transparent';
                    ctx.strokeStyle = style.webkitTextStrokeColor;
                    ctx.lineWidth = strokeWidth;
                    ctx.lineJoin = 'round';
                    ctx.strokeText(this.textElement.textContent, width / 2, height / 2);
                }
                
                ctx.restore();
            }
        }

        // Restore context if scale was applied
        if (wrapperScale !== 1) {
            ctx.restore();
        }
    }

    /**
     * Runs deterministic frame-by-frame rendering and recording
     */
    exportVideo(timeline, config, onProgress, onComplete) {
        if (this.isRecording) return;
        this.isRecording = true;
        this.chunks = [];
        
        const width = Number(config.width) || 1920;
        const height = Number(config.height) || 1080;
        
        // Configure export canvas resolution
        this.canvas.width = width;
        this.canvas.height = height;
        
        // Pause and reset timeline to start
        timeline.pause();
        timeline.progress(0);
        
        const fps = 60;
        const totalDuration = timeline.totalDuration();
        // Record 1.5 seconds of static screen at the end to allow video editing room
        const recordDuration = totalDuration + 1.5; 
        const totalFrames = Math.ceil(recordDuration * fps);
        
        // Capture stream at locked frame rate
        const stream = this.canvas.captureStream(fps);
        
        // Determine supported codecs (VP9 is preferred for WebM Alpha channel transparency)
        let options = { mimeType: 'video/webm;codecs=vp9' };
        if (config.bgType !== 'transparent' || !MediaRecorder.isTypeSupported(options.mimeType)) {
            options = { mimeType: 'video/webm;codecs=vp8' };
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options = { mimeType: 'video/webm' }; // Fallback
            }
        }
        
        this.recorder = new MediaRecorder(stream, options);
        
        this.recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
                this.chunks.push(e.data);
            }
        };
        
        this.recorder.onstop = () => {
            const blob = new Blob(this.chunks, { type: options.mimeType });
            const videoUrl = URL.createObjectURL(blob);
            
            // Clean up
            this.isRecording = false;
            timeline.play(); // Resume normal playback in UI
            
            onComplete(videoUrl);
        };
        
        // Start recording
        this.recorder.start();
        
        let currentFrame = 0;
        
        const renderNextFrame = () => {
            if (currentFrame > totalFrames) {
                // Done recording
                this.recorder.stop();
                return;
            }
            
            // Seek timeline to exact time slice
            const time = (currentFrame / totalFrames) * recordDuration;
            if (time <= totalDuration) {
                timeline.seek(time);
            } else {
                timeline.seek(totalDuration); // Hold last frame static
            }
            
            // Wait for DOM styles/layout to settle, then draw to canvas
            requestAnimationFrame(() => {
                this.drawFrame(width, height, config.bgType, config.customBgColor);
                
                // Update progress callback
                onProgress(currentFrame / totalFrames);
                
                currentFrame++;
                
                // Request next frame with 16ms delay (which mimics ~60fps encoding speed)
                setTimeout(renderNextFrame, 16);
            });
        };
        
        // Kick off rendering loop
        renderNextFrame();
    }
}
