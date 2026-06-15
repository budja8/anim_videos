/**
 * Generates a random YouTube view count string (e.g. 350, 4.2K, 1.5M)
 * @returns {string} The view count string
 */
export function generateRandomViews() {
    const units = ['', 'K', 'M'];
    const unitIndex = Math.floor(Math.random() * 3);
    if (unitIndex === 0) {
        return (Math.floor(Math.random() * 900) + 100).toString();
    } else if (unitIndex === 1) {
        const val = (Math.random() * 998 + 1).toFixed(1);
        return val + 'K';
    } else {
        const val = (Math.random() * 9 + 1).toFixed(1);
        return val + 'M';
    }
}

/**
 * Generates a random YouTube publish date string (e.g. hace 2 horas, hace 1 semana)
 * @returns {string} The date string
 */
export function generateRandomDate() {
    const options = [
        { value: 24, label: 'horas', singular: 'hora' },
        { value: 30, label: 'días', singular: 'día' },
        { value: 4, label: 'semanas', singular: 'semana' },
        { value: 12, label: 'meses', singular: 'mes' },
        { value: 5, label: 'años', singular: 'año' }
    ];
    const opt = options[Math.floor(Math.random() * options.length)];
    const num = Math.floor(Math.random() * opt.value) + 1;
    if (num === 1) {
        return `hace 1 ${opt.singular}`;
    }
    return `hace ${num} ${opt.label}`;
}

/**
 * Resize and compress uploaded images using HTML5 Canvas.
 * Cropped from the center to cover target dimensions.
 * @param {File} file - The image file
 * @param {number} targetWidth - Target width in pixels
 * @param {number} targetHeight - Target height in pixels
 * @param {Function} callback - Callback function with base64 data URL
 */
export function resizeAndCompressImage(file, targetWidth, targetHeight, callback) {
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext('2d');
            
            // Handle aspect ratio cropping (center cover crop)
            const imgRatio = img.width / img.height;
            const targetRatio = targetWidth / targetHeight;
            let sx = 0, sy = 0, sw = img.width, sh = img.height;
            
            if (imgRatio > targetRatio) {
                sw = img.height * targetRatio;
                sx = (img.width - sw) / 2;
            } else if (imgRatio < targetRatio) {
                sh = img.width / targetRatio;
                sy = (img.height - sh) / 2;
            }
            
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);
            
            // Convert to JPEG format with 75% quality for performance
            const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
            callback(dataUrl);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

/**
 * Returns the CSS class name based on character length.
 * @param {number} len - Character length
 * @returns {string} The CSS class name
 */
export function getTitleLenClass(len) {
    if (len <= 60) return 'len-good';
    if (len <= 80) return 'len-warning';
    return 'len-danger';
}

/**
 * Returns the status text indicating title length quality.
 * @param {number} len - Character length
 * @returns {string} The status text
 */
export function getTitleLenStatus(len) {
    if (len === 0) return 'Vacío';
    if (len <= 50) return `${len}/100 (Corto)`;
    if (len <= 60) return `${len}/100 (Ideal)`;
    if (len <= 80) return `${len}/100 (Largo)`;
    return `${len}/100 (Cortado en búsqueda)`;
}
