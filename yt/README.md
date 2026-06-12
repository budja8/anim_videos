# Tube Title Tester 🎥🏷️

**Tube Title Tester** es una herramienta web interactiva de alto rendimiento y diseño premium que permite a los creadores de contenido de YouTube previsualizar, experimentar y optimizar la apariencia de sus títulos y miniaturas antes de publicarlos de manera oficial.

El CTR (Click-Through Rate) depende principalmente de la combinación visual entre el título y la miniatura. Con este simulador interactivo, puedes verificar si tu texto se corta (truncación), probar armonías de colores side-by-side y emular cómo te verán tus potenciales espectadores bajo las configuraciones oficiales de YouTube.

---

## ✨ Características Clave

1. **Simulación de Vistas Oficiales de YouTube:**
   * **Vista de Inicio (Home Feed):** Representación estándar de tarjeta completa en una cuadrícula auto-ajustable similar a la página principal de YouTube Desktop.
   * **Vista de Recomendados (Sidebar):** Formato de lista horizontal idéntico a la columna lateral derecha de la página de reproducción de un vídeo.

2. **Personalización de Miniatura (Subida y Drag & Drop):**
   * Pasa el cursor por encima del banner de cualquier tarjeta para revelar el menú de carga.
   * Puedes hacer clic para seleccionar un archivo de imagen o **arrastrar y soltar (drag & drop)** cualquier imagen directamente.
   * Cuenta con un botón para copiar y propagar la miniatura actual a todas las variaciones creadas, o bien utilizar el botón de **"Miniatura Global"** en la barra de herramientas.

3. **Optimización de Almacenamiento Local Inteligente:**
   * Las imágenes de miniatura y avatares se redimensionan y comprimen en formato JPEG a nivel de cliente usando la API de `<canvas>` (thumbnails a 640x360, avatares a 80x80).
   * Esto mantiene un peso óptimo en disco (~15KB a ~40KB por tarjeta), lo que permite guardar múltiples tarjetas y miniaturas directamente en el `localStorage` del navegador sin superar la cuota máxima del navegador (5MB) y evitando enlaces rotos al recargar.

4. **Edición Interactiva Inline (En Pantalla):**
   * Modifica los títulos, nombres de canal, cantidad de vistas o fechas directamente haciendo clic sobre ellos en la tarjeta.
   * Permite subir avatares personalizados para cada canal haciendo clic en el círculo de perfil.

5. **Medición Dinámica de Longitud de Títulos:**
   * Cada tarjeta incluye un semáforo/badge que indica de manera dinámica el largo del título:
     * **Verde (Óptimo/Ideal):** Títulos de hasta 60 caracteres (visibilidad perfecta en la mayoría de dispositivos).
     * **Amarillo (Largo):** Títulos entre 61 y 80 caracteres (posibilidad de cortes menores).
     * **Rojo (Cortado en búsqueda):** Títulos de más de 80 caracteres (se truncarán en la mayoría de feeds de YouTube).

6. **Temas Sincronizados (Modo Oscuro / Claro):**
   * Alterna entre modo claro y oscuro con un solo clic. El fondo de la aplicación y la paleta de colores de las tarjetas simuladas cambian imitando los esquemas exactos de YouTube Light/Dark.

7. **Privacidad Garantizada:**
   * La aplicación procesa toda la información del lado del cliente. Ningún título, imagen o dato personal es subido a servidores externos.

---

## 🛠️ Tecnologías Utilizadas

El proyecto fue desarrollado utilizando estándares modernos web nativos para garantizar ligereza, modularidad y carga instantánea:
* **HTML5:** Marcado semántico estructurado.
* **CSS3:** Variables dinámicas (custom properties) para la gestión del diseño responsivo y la conmutación de temas, transiciones fluidas de micro-animaciones y efectos glassmorphism.
* **Vanilla JavaScript (ES6):** Gestión del estado dinámico de tarjetas, controladores de eventos drag-and-drop, procesamiento de compresión en lienzo gráfico (Canvas API) e integraciones con `localStorage`.

---

## 📂 Estructura del Proyecto

```bash
test-tb/
│
├── index.html       # Estructura e interfaz semántica de la SPA
├── styles.css       # Sistema de diseño, temas de color y layouts responsive
├── app.js           # Lógica de estados, persistencia y procesamiento gráfico
├── package.json     # Definición de scripts del entorno de desarrollo
└── README.md        # Documentación técnica general
```

---

## 🚀 Instalación y Uso Local

### Requisitos previos
* Disponer de un navegador web moderno (Chrome, Edge, Safari, Firefox).
* Opcional: Tener instalado [Node.js](https://nodejs.org/) si deseas utilizar el servidor de desarrollo local pre-configurado.

### Instrucciones de ejecución

#### Opción A: Servidor de desarrollo local (Recomendado)
1. Abre tu terminal en la carpeta del proyecto.
2. Levanta el servidor local ejecutando el siguiente comando:
   ```bash
   npm run dev
   ```
3. El servidor arrancará por defecto en el puerto **3010**. Abre tu navegador e ingresa a:
   [http://localhost:3010](http://localhost:3010)

#### Opción B: Ejecución directa sin Node.js
* Simplemente haz doble clic en el archivo [index.html](file:///c:/Users/Daniel%20Rodriguez/Documents/Tests/test-tb/index.html) para abrirlo directamente en el navegador. *(Nota: Algunas características del navegador podrían requerir servirlo vía HTTP local para ciertos permisos de almacenamiento persistente óptimo).*

---

## ⚙️ Directrices de Uso

1. **Añadir títulos:** Escribe una idea en la barra de búsqueda del encabezado y pulsa "Agregar Título". Los placeholders iniciales desaparecerán para centrar la visualización en tus ideas.
2. **Cambiar la miniatura:** Pasa el cursor sobre la imagen de la tarjeta y haz clic en "Cambiar Miniatura" para subir tu diseño. También puedes arrastrar el archivo directamente.
3. **Optimizar metadatos:** Haz clic sobre el nombre del canal para renombrarlo con el tuyo, o edita la cantidad de vistas de forma inline para simular un caso real de visualización.
4. **Verificar visibilidad:** Activa la vista "Recomendados (Sidebar)" para corroborar si tus primeras palabras captan la atención del usuario en espacios pequeños.
