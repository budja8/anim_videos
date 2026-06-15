export class CanvasManager {
    constructor(options) {
        this.viewport = options.viewport;
        this.animationContainer = options.animationContainer;
        this.safeZones = options.safeZones;
        this.canvasResolution = options.canvasResolution;
        this.resolutionBadge = options.resolutionBadge;
        this.onScale = options.onScale || null;
        
        this.visualScale = 1;
        this.init();
    }

    init() {
        // Handle viewport resize events
        const resizeObserver = new ResizeObserver(() => this.scaleCanvas());
        resizeObserver.observe(this.viewport);

        this.scaleCanvas();
    }

    getResolution() {
        const val = this.canvasResolution.value || "2560x1440";
        const [w, h] = val.split('x').map(Number);
        return { width: w || 2560, height: h || 1440 };
    }

    scaleCanvas() {
        const { width, height } = this.getResolution();
        
        // Update unscaled dimension styles
        this.animationContainer.style.width = `${width}px`;
        this.animationContainer.style.height = `${height}px`;
        
        // Calculate fit scale factor (leaving margin inside viewport)
        const viewportWidth = this.viewport.clientWidth - 80;
        const viewportHeight = this.viewport.clientHeight - 80;
        
        const scaleX = viewportWidth / width;
        const scaleY = viewportHeight / height;
        this.visualScale = Math.min(scaleX, scaleY, 1); // Max scale of 1
        
        // Apply transform scale
        this.animationContainer.style.transform = `scale(${this.visualScale})`;
        
        // Update Safe Zones overlay sizes
        this.safeZones.style.width = `${width}px`;
        this.safeZones.style.height = `${height}px`;
        this.safeZones.style.transform = `scale(${this.visualScale})`;
        
        // Update resolution badge
        if (this.resolutionBadge) {
            this.resolutionBadge.textContent = `${width} x ${height}`;
        }

        if (this.onScale) {
            this.onScale(this.visualScale);
        }
    }
}
