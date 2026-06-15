const loadedFonts = new Set(['Outfit']);

/**
 * Formats a given string according to the specified case style.
 * @param {string} text - The input text to format
 * @param {string} caseType - The type of case format (uppercase, lowercase, titlecase, camelcase)
 * @returns {string} The formatted text
 */
export function formatTextCase(text, caseType) {
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

/**
 * Converts a hex color string to an RGBA color string with alpha opacity.
 * @param {string} hex - Hex color string (e.g. #ffffff or #fff)
 * @param {number} alpha - Alpha opacity (0.0 to 1.0)
 * @returns {string} RGBA color string
 */
export function hexToRgba(hex, alpha) {
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

/**
 * Dynamically loads a Google Font by adding a link tag to the head.
 * @param {string} fontName - The name of the Google Font to load
 * @param {Function} callback - Callback function executed once the font is loaded
 */
export function loadGoogleFont(fontName, callback) {
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
