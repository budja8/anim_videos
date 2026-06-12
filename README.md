# ChromaText Studio 🎥✨

Generador de animaciones de texto fluidas con fondo chroma (verde/azul) y transparente, diseñado especialmente para creadores de contenido que buscan añadir textos dinámicos a sus videos.

---

## 🚀 Características principales
* **Modos de texto**: Soporte para texto estático/frases y contadores/cronómetros dinámicos.
* **Personalización tipográfica**: Integración con Google Fonts (Outfit, Montserrat, Bebas Neue, Anton, etc.).
* **Fondo Chroma y Transparencia**: Fondos verde chroma, azul chroma, transparente (con canal Alfa para superposiciones directas) y colores personalizados.
* **Control de Estilo**: Ajustes detallados de tamaño, grosor, color, bordes (stroke) y sombras del texto.
* **Motor de Animaciones**: Animaciones optimizadas y fluidas impulsadas por GSAP.

---

## 🛠️ Requisitos previos
Para inicializar y ejecutar el proyecto localmente, necesitas tener instalado:
* [Node.js](https://nodejs.org/) (versión 18 o superior recomendada)
* Un gestor de paquetes como `npm` (incluido con Node.js)

---

## 📦 Inicialización e Instalación

Sigue estos pasos para levantar el entorno de desarrollo localmente:

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Iniciar servidor de desarrollo**:
   ```bash
   npm run dev
   ```
   *Esto iniciará un servidor local con Vite (normalmente en `http://localhost:5173`).*

3. **Construir para producción**:
   ```bash
   npm run build
   ```

---

## ⚠️ Estado Actual del Proyecto
> [!IMPORTANT]
> **Versión Inicial**
> Actualmente el proyecto se encuentra en su fase inicial de desarrollo.
> 
> * **Limitación conocida**: Por el momento, la descarga del archivo de video genera un **video estático**. La grabación fluida de las animaciones en tiempo real usando el canvas está en proceso de optimización para futuras versiones.
