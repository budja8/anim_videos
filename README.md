# Herramientas de Previsualización y Edición para Creadores de YouTube 🎥🎬

Colección de herramientas web optimizadas para creadores de contenido de YouTube. El proyecto incluye un **Editor de Animaciones Chroma** (para títulos y contadores cinemáticos con exportación WebM de 60 FPS) y un **Simulador de Miniaturas de YouTube** (para probar y comparar el impacto y legibilidad de miniaturas y títulos en la interfaz real de la plataforma).

El acceso y control de tema visual está centralizado desde una **Landing Page** responsiva con diseño minimalista premium.

---

## 🚀 Estructura del Proyecto y Rutas (MPA)

El proyecto está estructurado como una aplicación multipágina (MPA) construida y empaquetada mediante **Vite**. Las rutas están organizadas de la siguiente manera:

* **Página de Inicio (`/`)**: Landing page interactiva inspirada en la interacción de Rockstar Games. Permite la selección directa de las herramientas y centraliza el control de tema claro/oscuro.
* **Editor de Animaciones Chroma (`/editor/`)**: Herramienta de diseño para generar y animar textos con fondo croma o transparencia total.
* **Simulador de Miniaturas (`/yt/`)**: Recreación premium del feed de YouTube para validar títulos y miniaturas.

---

## 🛠️ Detalle de Cambios e Implementaciones Realizadas

### 1. Reorganización y Aislamiento de Módulos
* **Aislamiento del Editor**: Agrupamos todos los scripts, estilos y la interfaz del editor ([editor/index.html](./editor/index.html), [editor/app.js](./editor/app.js), [editor/style.css](./editor/style.css), [editor/animations.js](./editor/animations.js), [editor/recorder.js](./editor/recorder.js)) dentro de la subcarpeta `/editor`, despejando por completo la raíz del repositorio.
* **Eliminación de Redundancias**: Se limpiaron los archivos obsoletos de la raíz y se eliminó por completo la carpeta temporal `test-tb` tras integrar el simulador bajo la ruta dedicada `/yt`.

### 2. Unificación Estética del Tema Oscuro
* **Eliminación del Tono Azul**: Reemplazamos los fondos azulados oscuros de la Landing y el Editor por los tonos gris oscuro neutrales de YouTube en el simulador:
  - Fondo de aplicación: `#0f0f12`
  - Paneles/Tarjetas: `#18181c`
  - Controles/Hover: `#1e1e24`
  - Bordes divisores: `#2d2d34`
  - Vista previa de lienzo: `#0f0f0f`
* **Sincronización Global de Temas**: Implementamos persistencia mediante `localStorage` bajo la clave `'global_theme'`. El cambio de tema (claro/oscuro) en cualquier página se refleja inmediatamente en todo el ecosistema al navegar o recargar.

### 3. Editor de Animaciones Chroma (`/editor/`)
* **Corrección de Pérdida de Estilo (GSAP)**: Modificamos el parámetro `clearProps` en la línea de tiempo de GSAP para limpiar únicamente los valores de transformación (`opacity, x, y, scale, transform`), previniendo que se borren los estilos en línea de tipografía configurados por el usuario.
* **Solapamiento de Trazados (Stroke)**: Añadimos la propiedad CSS `paint-order: stroke fill` en el texto y actualizamos la secuencia en el canvas de exportación (`recorder.js`) para pintar el borde antes que el relleno. Esto elimina las costuras y líneas internas en letras cursivas o juntas.
* **Control de Sombras por Coordenadas Polares**: Sustituimos los deslizadores X/Y por un control trigonométrico basado en **Ángulo (Dirección °)** y **Distancia (px)**.
* **Sliders Sincronizados**: Acoplamos barras deslizantes con cajas numéricas para todos los valores del panel.
* **Configuración Inicial**: Se predeterminó la resolución de renderizado en **2K (2560x1440)** y el fondo inicial de la vista previa en **Verde Chroma** (`#00ff00`).

### 4. Simulador de Miniaturas de YouTube (`/yt/`)
* **Simulación Completa**: Permite comparar legibilidad e inserción en el feed de inicio y columna lateral de recomendados.
* **Subida de Recursos**: Soporte para cargar y previsualizar imágenes personalizadas para las miniaturas (de forma individual o global a todas las tarjetas) y avatares de canal.
* **Botón de Regreso**: Añadimos un acceso directo elegante en la barra de navegación lateral para volver al menú de inicio (`/`).

### 5. Pulido de la Landing Page
* **Proporción y Altura de Tarjetas**: Redujimos la altura de las tarjetas de `420px` a `380px` (y de `480px` a `440px` en dispositivos móviles).
* **Flex Layout**: Añadimos `flex: 1` a los bloques de contenido y asignamos `margin-top: auto` a los botones de inicio para alinearlos de forma horizontal uniforme al fondo de la tarjeta.

---

## 💻 Requisitos de Ejecución y Despliegue

### Requisitos Previos
* [Node.js](https://nodejs.org/) (Versión 18 o superior).
* Gestor de paquetes `npm`.

### Dependencias
* **Vite** (como empaquetador del entorno multipágina).
* **webm-muxer** (usado para codificar y exportar las animaciones en archivos WebM con transparencia a 60 FPS directamente en el navegador).

### Comandos de Consola

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Ejecutar servidor local de desarrollo**:
   ```bash
   npm run dev
   ```

3. **Compilar compilación estática para producción**:
   ```bash
   npm run build
   ```

4. **Visualizar la compilación de producción**:
   ```bash
   npm run preview
   ```

---

## 📝 Lista de Cosas por Hacer / Roadmap

### Simulador de Miniaturas (`/yt/`)
- [ ] **Simulador Móvil**: Diseñar la visualización en formato vertical simulando la aplicación oficial de YouTube para celulares.
- [ ] **Calculadora de Contraste**: Validar automáticamente la legibilidad del texto en miniatura calculando el contraste frente al fondo de la imagen subida.
- [ ] **Guardado Local de Proyectos**: Permitir exportar e importar archivos JSON con colecciones de títulos y miniaturas para continuar trabajando más tarde.

### Editor de Animaciones Chroma (`/editor/`)
- [ ] **Historial de Fuentes Recientes**: Almacenar en caché del navegador las fuentes TTF/OTF locales subidas por el usuario.
- [ ] **Presets de Animaciones de Salida**: Implementar transiciones de desaparición (Fade Out, Slide Down, Zoom Out) programables para el final del video.
- [ ] **Línea de Tiempo Visual**: Incluir un control deslizante de tiempo interactivo para poder pausar, avanzar o retroceder la animación de texto frame a frame de forma manual.
