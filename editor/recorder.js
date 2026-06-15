/**
 * CHROMA TEXT STUDIO - VIDEO RECORDER
 * Captures HTML text animations into high-quality WebM videos with chroma green or alpha transparency.
 */

import { Muxer, ArrayBufferTarget } from 'webm-muxer';

export class AnimationRecorder {
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
     * Parse CSS transform computed style string (matrix or matrix3d)
     * into translation, scaling, and skewing factors.
     */
    parseTransform(transformStr) {
        const defaultTransform = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
        if (!transformStr || transformStr === 'none') {
            return defaultTransform;
        }

        if (transformStr.startsWith('matrix3d(')) {
            const values = transformStr.slice(9, -1).split(',').map(parseFloat);
            if (values.length >= 16) {
                return {
                    a: values[0],   // scaleX
                    b: values[1],   // skewY
                    c: values[4],   // skewX
                    d: values[5],   // scaleY
                    tx: values[12], // translateX
                    ty: values[13]  // translateY
                };
            }
        } else if (transformStr.startsWith('matrix(')) {
            const values = transformStr.slice(7, -1).split(',').map(parseFloat);
            if (values.length >= 6) {
                return {
                    a: values[0],   // scaleX
                    b: values[1],   // skewY
                    c: values[2],   // skewX
                    d: values[3],   // scaleY
                    tx: values[4],  // translateX
                    ty: values[5]   // translateY
                };
            }
        }

        return defaultTransform;
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
                const matrix = this.parseTransform(wrapperStyle.transform);
                wrapperScale = matrix.a; // Scale X
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
                const wordSpan = char.closest('.word-span');
                const lineContainer = char.closest('.line-container');
                
                const wordStyle = wordSpan ? window.getComputedStyle(wordSpan) : null;
                const lineStyle = lineContainer ? window.getComputedStyle(lineContainer) : null;

                // 1. Calculate accumulated opacity
                let opacity = parseFloat(style.opacity);
                if (wordStyle) opacity *= parseFloat(wordStyle.opacity);
                if (lineStyle) opacity *= parseFloat(lineStyle.opacity);

                if (opacity <= 0.01) return; // Skip invisible characters

                // Get layout coordinates (untransformed) relative to container
                let charX = 0;
                let charY = 0;
                let currentEl = char;
                while (currentEl && currentEl !== this.container) {
                    charX += currentEl.offsetLeft;
                    charY += currentEl.offsetTop;
                    currentEl = currentEl.offsetParent;
                }

                // Get dimensions
                const charWidth = char.offsetWidth;
                const charHeight = char.offsetHeight;

                ctx.save();

                // Apply global opacity
                ctx.globalAlpha = opacity;

                // 2. Determine which element's transform we are applying (supporting word and line stagger modes)
                let transformEl = char;
                let transformStr = style.transform;
                if (!transformStr || transformStr === 'none') {
                    if (wordStyle && wordStyle.transform && wordStyle.transform !== 'none') {
                        transformStr = wordStyle.transform;
                        transformEl = wordSpan;
                    } else if (lineStyle && lineStyle.transform && lineStyle.transform !== 'none') {
                        transformStr = lineStyle.transform;
                        transformEl = lineContainer;
                    }
                }

                // 3. Calculate transform origin relative to container
                let transX = 0;
                let transY = 0;
                let currentTransEl = transformEl;
                while (currentTransEl && currentTransEl !== this.container) {
                    transX += currentTransEl.offsetLeft;
                    transY += currentTransEl.offsetTop;
                    currentTransEl = currentTransEl.offsetParent;
                }
                const transWidth = transformEl.offsetWidth || charWidth;
                const transHeight = transformEl.offsetHeight || charHeight;

                const originX = transX + transWidth / 2;
                const originY = transY + transHeight / 2;

                // Set origin on canvas
                ctx.translate(originX, originY);

                // Parse matrix transform
                let a = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0;
                if (transformStr && transformStr !== 'none') {
                    const matrix = this.parseTransform(transformStr);
                    a = matrix.a;
                    b = matrix.b;
                    c = matrix.c;
                    d = matrix.d;
                    tx = matrix.tx;
                    ty = matrix.ty;
                }

                // Apply transform matrix
                ctx.transform(a, b, c, d, tx, ty);

                // Reset origin back
                ctx.translate(-originX, -originY);

                // 4. Apply CSS filters (like blur reveal)
                let filterStr = style.filter;
                if (!filterStr || filterStr === 'none') {
                    if (wordStyle && wordStyle.filter && wordStyle.filter !== 'none') {
                        filterStr = wordStyle.filter;
                    } else if (lineStyle && lineStyle.filter && lineStyle.filter !== 'none') {
                        filterStr = lineStyle.filter;
                    }
                }
                if (filterStr && filterStr !== 'none') {
                    ctx.filter = filterStr;
                } else {
                    ctx.filter = 'none';
                }

                // 5. Apply Text Styling
                ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
                ctx.textBaseline = 'top';
                ctx.textAlign = 'left';

                // Text stroke (Border)
                const strokeWidth = parseFloat(style.webkitTextStrokeWidth) || 0;
                const strokeColor = style.webkitTextStrokeColor;

                // Draw outline first (without shadow to avoid double shadow)
                if (strokeWidth > 0) {
                    ctx.strokeStyle = strokeColor;
                    ctx.lineWidth = strokeWidth;
                    ctx.lineJoin = 'round';
                    ctx.strokeText(char.textContent, charX, charY);
                }

                // Neon vs Standard Shadow (Apply right before fillText)
                const enableNeon = style.getPropertyValue('--enable-neon') === 'true';
                if (enableNeon) {
                    const neonColor = style.getPropertyValue('--neon-color') || '#ff007f';
                    const neonBlur = parseFloat(style.getPropertyValue('--neon-blur')) || 20;
                    ctx.shadowColor = neonColor;
                    ctx.shadowBlur = neonBlur;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 0;
                } else {
                    const shadow = this.parseTextShadow(style.textShadow);
                    if (shadow) {
                        ctx.shadowColor = shadow.color;
                        ctx.shadowBlur = shadow.blur;
                        ctx.shadowOffsetX = shadow.offsetX;
                        ctx.shadowOffsetY = shadow.offsetY;
                    } else {
                        ctx.shadowColor = 'transparent';
                    }
                }

                // Gradient vs Solid Fill
                const colorType = style.getPropertyValue('--color-type') || 'solid';
                if (colorType === 'gradient') {
                    const g1 = style.getPropertyValue('--gradient-color-1') || '#ff007f';
                    const g2 = style.getPropertyValue('--gradient-color-2') || '#7f00ff';
                    const angleDeg = parseFloat(style.getPropertyValue('--gradient-angle')) || 90;

                    // Bounding box of the main text element relative to container
                    let textX = 0;
                    let textY = 0;
                    let currentEl = this.textElement;
                    while (currentEl && currentEl !== this.container) {
                        textX += currentEl.offsetLeft;
                        textY += currentEl.offsetTop;
                        currentEl = currentEl.offsetParent;
                    }

                    const textWidth = this.textElement.offsetWidth || 500;
                    const textHeight = this.textElement.offsetHeight || 150;

                    const cx = textX + textWidth / 2;
                    const cy = textY + textHeight / 2;
                    const r = Math.sqrt(textWidth * textWidth + textHeight * textHeight) / 2;

                    const angleRad = (angleDeg * Math.PI) / 180;
                    const x1 = cx - r * Math.cos(angleRad);
                    const y1 = cy - r * Math.sin(angleRad);
                    const x2 = cx + r * Math.cos(angleRad);
                    const y2 = cy + r * Math.sin(angleRad);

                    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
                    gradient.addColorStop(0, g1);
                    gradient.addColorStop(1, g2);

                    ctx.fillStyle = gradient;
                } else {
                    ctx.fillStyle = style.color;
                }

                // Draw text fill on top of outline
                ctx.fillText(char.textContent, charX, charY);

                ctx.restore();
            });
        } else {
            // Draw full text as single block if no split spans exist (e.g. backup or single counter text)
            const style = window.getComputedStyle(this.textElement);
            const opacity = parseFloat(style.opacity);

            if (opacity > 0.01) {
                ctx.save();
                ctx.globalAlpha = opacity;

                // Apply transforms (like pop scale animation) relative to the center of the canvas
                let a = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0;
                if (style.transform && style.transform !== 'none') {
                    const matrix = this.parseTransform(style.transform);
                    a = matrix.a;
                    b = matrix.b;
                    c = matrix.c;
                    d = matrix.d;
                    tx = matrix.tx;
                    ty = matrix.ty;
                }

                ctx.translate(width / 2, height / 2);
                ctx.transform(a, b, c, d, tx, ty);
                ctx.translate(-width / 2, -height / 2);

                ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center';

                // Text stroke (Border)
                const strokeWidth = parseFloat(style.webkitTextStrokeWidth) || 0;

                // Draw outline first (without shadow to avoid double shadow)
                if (strokeWidth > 0) {
                    ctx.strokeStyle = style.webkitTextStrokeColor;
                    ctx.lineWidth = strokeWidth;
                    ctx.lineJoin = 'round';
                    ctx.strokeText(this.textElement.textContent, width / 2, height / 2);
                }

                // Neon vs Standard Shadow
                const enableNeon = style.getPropertyValue('--enable-neon') === 'true';
                if (enableNeon) {
                    const neonColor = style.getPropertyValue('--neon-color') || '#ff007f';
                    const neonBlur = parseFloat(style.getPropertyValue('--neon-blur')) || 20;
                    ctx.shadowColor = neonColor;
                    ctx.shadowBlur = neonBlur;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 0;
                } else {
                    const shadow = this.parseTextShadow(style.textShadow);
                    if (shadow) {
                        ctx.shadowColor = shadow.color;
                        ctx.shadowBlur = shadow.blur;
                        ctx.shadowOffsetX = shadow.offsetX;
                        ctx.shadowOffsetY = shadow.offsetY;
                    } else {
                        ctx.shadowColor = 'transparent';
                    }
                }

                // Gradient vs Solid Fill
                const colorType = style.getPropertyValue('--color-type') || 'solid';
                if (colorType === 'gradient') {
                    const g1 = style.getPropertyValue('--gradient-color-1') || '#ff007f';
                    const g2 = style.getPropertyValue('--gradient-color-2') || '#7f00ff';
                    const angleDeg = parseFloat(style.getPropertyValue('--gradient-angle')) || 90;

                    const textWidth = this.textElement.offsetWidth || 500;
                    const textHeight = this.textElement.offsetHeight || 150;

                    const cx = width / 2;
                    const cy = height / 2;
                    const r = Math.sqrt(textWidth * textWidth + textHeight * textHeight) / 2;

                    const angleRad = (angleDeg * Math.PI) / 180;
                    const x1 = cx - r * Math.cos(angleRad);
                    const y1 = cy - r * Math.sin(angleRad);
                    const x2 = cx + r * Math.cos(angleRad);
                    const y2 = cy + r * Math.sin(angleRad);

                    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
                    gradient.addColorStop(0, g1);
                    gradient.addColorStop(1, g2);

                    ctx.fillStyle = gradient;
                } else {
                    ctx.fillStyle = style.color;
                }

                // Draw text fill on top of outline
                ctx.fillText(this.textElement.textContent, width / 2, height / 2);

                ctx.restore();
            }
        }

        // Restore context if scale was applied
        if (wrapperScale !== 1) {
            ctx.restore();
        }
    }

    /**
     * Runs offline deterministic frame-by-frame rendering and records it using WebCodecs and webm-muxer.
     */
    async exportVideo(timeline, config, onProgress, onComplete) {
        if (this.isRecording) return;
        this.isRecording = true;

        const width = Number(config.width) || 1920;
        const height = Number(config.height) || 1080;

        // Configure export canvas resolution
        this.canvas.width = width;
        this.canvas.height = height;

        const fps = 60;
        const totalDuration = timeline.totalDuration();
        // Record 1.5 seconds of static screen at the end to allow video editing room
        const recordDuration = totalDuration + 1.5;
        const totalFrames = Math.ceil(recordDuration * fps);
        const startDelay = 500; // 500ms delay at the beginning to capture the initial frame
        const delayFrames = Math.ceil((startDelay / 1000) * fps);
        const totalRecordFrames = totalFrames + delayFrames;

        // 1. Initialize webm-muxer
        const muxer = new Muxer({
            target: new ArrayBufferTarget(),
            video: {
                codec: 'V_VP9',
                width: width,
                height: height,
                frameRate: fps
            }
        });

        // 2. Initialize VideoEncoder
        const videoEncoder = new VideoEncoder({
            output: (chunk, metadata) => muxer.addVideoChunk(chunk, metadata),
            error: (e) => console.error('VideoEncoder error:', e)
        });

        // VP9 Profile 0 supports alpha channel
        const hasAlpha = config.bgType === 'transparent';
        videoEncoder.configure({
            codec: 'vp09.00.10.08',
            width: width,
            height: height,
            bitrate: 6e6,
            alpha: hasAlpha ? 'keep' : 'discard',
            latencyMode: 'quality'
        });

        // Reset and pause timeline to 0
        timeline.pause(0);

        let currentFrame = 0;
        const frameDurationUs = 1000000 / fps;

        const renderFrame = async () => {
            if (!this.isRecording) return;

            if (currentFrame >= totalRecordFrames) {
                // Flush encoder and finalize video
                await videoEncoder.flush();
                muxer.finalize();

                const { buffer } = muxer.target;
                const blob = new Blob([buffer], { type: 'video/webm' });
                const videoUrl = URL.createObjectURL(blob);

                this.isRecording = false;
                timeline.play(0); // Resume normal playback in UI

                onComplete(videoUrl);
                return;
            }

            // Determine virtual time for animation seek
            let time = 0;
            if (currentFrame >= delayFrames) {
                const animFrame = currentFrame - delayFrames;
                time = (animFrame / totalFrames) * recordDuration;
            }

            if (time <= totalDuration) {
                timeline.seek(time, false);
            } else {
                timeline.seek(totalDuration, false); // Hold last frame static
            }

            // Wait for DOM styles/layout to settle, then draw and encode
            requestAnimationFrame(async () => {
                // Draw to export canvas
                this.drawFrame(width, height, config.bgType, config.customBgColor);

                // Create VideoFrame and encode
                const timestampUs = currentFrame * frameDurationUs;
                const frame = new VideoFrame(this.canvas, { timestamp: timestampUs });

                videoEncoder.encode(frame, { keyFrame: currentFrame % 60 === 0 });
                frame.close();

                // Update progress
                onProgress(currentFrame / totalRecordFrames);

                currentFrame++;

                // Yield thread to keep UI responsive
                setTimeout(renderFrame, 0);
            });
        };

        // Start render loop
        setTimeout(renderFrame, 0);
    }


}
