# PhishGuard — Frontend

Interfaz web de **PhishGuard**, una plataforma de ciberseguridad para detectar señales de phishing en mensajes, enlaces y cabeceras de correo.

> Este README describe la carpeta `frontend/`. La presentación del proyecto y la documentación están en el
> [README principal](../README.md) y en [`documentacion/`](../documentacion/). Todos los comandos se ejecutan dentro de `frontend/`.

> **Fase actual: solo frontend.** Todavía **no existe un backend integrado**: no hay servidor, base de datos, autenticación real ni motor de
> análisis. Los formularios validan en el navegador y muestran un aviso de «pendiente de integración». Todos los datos de demostración están
> marcados con la etiqueta **Demo** o con un aviso de «Datos de demostración».

## Tecnologías

| Paquete                       | Uso                                                        |
| ----------------------------- | ---------------------------------------------------------- |
| React 18 + TypeScript         | Interfaz y tipado                                          |
| Vite 5                        | Servidor de desarrollo y build                             |
| Tailwind CSS 3                | Estilos, conectados a variables CSS del sistema de diseño  |
| React Router 6                | Navegación entre las 9 rutas y la 404                      |
| Lucide React                  | Iconos                                                     |
| **GSAP 3.13** + ScrollTrigger | Animaciones de entrada y vinculadas al scroll *(fase 2)*   |
| **@gsap/react**               | Hook `useGSAP` con limpieza automática *(fase 2)*          |
| **Lenis 1.3**                 | Scroll suave en la zona pública *(fase 2)*                 |

Tipografías (Google Fonts): **Archivo**, con eje de anchura variable (titulares anchos, texto normal), y **JetBrains Mono** para datos técnicos.

## Requisitos

- [Node.js](https://nodejs.org/) **20 LTS o superior** (incluye `npm`).
- Visual Studio Code (recomendado: extensión *Tailwind CSS IntelliSense*).

```bash
node -v
npm -v
```

## Ejecutar en local (Windows + VS Code)

1. Abre la carpeta del repositorio en VS Code (`Archivo → Abrir carpeta…`).
2. Abre una terminal integrada (`Terminal → Nueva terminal`) y entra en la carpeta del frontend:

   ```bash
   cd frontend
   ```

3. Instala las dependencias (la primera vez, o tras actualizar el proyecto):

   ```bash
   npm install
   ```

4. Arranca el servidor de desarrollo:

   ```bash
   npm run dev
   ```

5. Vite abrirá el navegador en **http://localhost:5173**. Para detenerlo, pulsa <kbd>Ctrl</kbd>+<kbd>C</kbd>.

> Si PowerShell muestra «la ejecución de scripts está deshabilitada en este sistema» al ejecutar `npm`, usa la terminal *Command Prompt* de
> VS Code o ejecuta una vez: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

## Versión de producción

```bash
npm run build     # comprueba tipos (tsc) y genera dist/
npm run preview   # sirve dist/ en http://localhost:4173
```

Al ser una SPA, el servidor que publique `dist/` debe redirigir las rutas desconocidas a `index.html` (en Vercel lo hace `vercel.json`).

| Script              | Descripción                                    |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Servidor de desarrollo con recarga en caliente |
| `npm run build`     | Comprobación de tipos + build de producción    |
| `npm run preview`   | Previsualiza el build de producción            |
| `npm run typecheck` | Solo comprobación de tipos                     |

## Despliegue en Vercel

1. En [vercel.com](https://vercel.com), `Add New… → Project` e importa el repositorio de GitHub.
2. En **Root Directory** selecciona `frontend` (en un proyecto ya creado: `Settings → Build and Deployment → Root Directory`).
   El frontend vive en esa carpeta del repositorio, no en la raíz.
3. Vercel detecta Vite automáticamente. `frontend/vercel.json` fija el build (`npm run build`), la salida (`dist`) y la redirección de todas las
   rutas a `index.html`, para que recargar `/dashboard` o abrir un enlace directo no devuelva 404.
4. Variables de entorno: de momento no hace falta ninguna. Cuando exista backend, añade `VITE_API_URL` en
   `Settings → Environment Variables` (nunca subas un `.env` con valores reales al repositorio).

Cada `git push` a `main` genera un despliegue de producción; las demás ramas generan despliegues de previsualización.

## Rutas

| Ruta         | Página                                                      |
| ------------ | ----------------------------------------------------------- |
| `/`          | Landing editorial (hero, problema, cómo funciona, FAQ…)     |
| `/login`     | Inicio de sesión (visual)                                   |
| `/register`  | Registro (visual)                                           |
| `/dashboard` | Panel con resumen de actividad (demo)                       |
| `/analyzer`  | Analizador: `?mode=url` o `?mode=headers`                   |
| `/results`   | Informe de resultados (`?demo=1` muestra el ejemplo)        |
| `/history`   | Historial con búsqueda y filtros (demo)                     |
| `/settings`  | Perfil y configuración                                      |
| `/admin`     | Panel de administración (demo)                              |
| `*`          | Página 404                                                  |

## Estructura

```
src/
├── components/
│   ├── ui/          Primitivas: Button, Input, Textarea, Checkbox, Switch, Badge, Alert, Tabs, Spinner
│   ├── common/      Estructura editorial (PageHeader, Section, Panel, Rule) y dominio (RiskBadge, RiskScale,
│   │                ScoreGauge, StatCard/StatGrid, DataTable, AnalysesTable, Accordion, EmptyState, DemoNotice…)
│   ├── layout/      SiteHeader (cabecera común), Navbar (pública), AppNavbar + AccountMenu (aplicación), Footer
│   ├── charts/      BarChart, RiskDistribution, HorizontalBars (sin librerías externas)
│   ├── landing/     Hero, HeroSpecimen, Problem, HowItWorks, HowFrames, Transparency, AnalyzerAccess, Faq, FinalCta
│   ├── analyzer/    Formularios de cada modalidad, consejos y panel de resultado
│   └── results/     Señales, mensaje subrayado, desglose por categoría, recomendaciones, metadatos
├── context/         ToastContext (avisos) y SmoothScrollContext (Lenis)
├── data/            Datos de demostración y textos de la landing (separados de los componentes)
├── hooks/           useReveal, useSmoothScroll, usePrefersReducedMotion, useAnalysisSubmit, useToast…
├── layouts/         PublicLayout (con Lenis), AuthLayout, AppLayout
├── lib/             gsap.ts: registro único de GSAP, ScrollTrigger y useGSAP
├── pages/           Una página por ruta
├── routes/          AppRouter
├── services/        Contratos de API (aún sin implementar)
├── types/           Tipos: análisis, señales, resultados, usuarios, estadísticas
└── utils/           Niveles de riesgo, validaciones, formato, cn()
```

## Sistema de diseño

Todo sale de las variables CSS de `src/index.css` (`:root`), que Tailwind lee mediante `tailwind.config.js`:

- **Color**: fondo carbón y azul eléctrico del diseño de Figma (`--accent-strong: #1f5cff` para rellenos y titulares grandes;
  `--accent: #5a8bff` para texto y marcas pequeñas, con contraste AA). Rojo, ámbar y verde se reservan para los niveles de riesgo.
- **Superficies y bordes**: `--bg`, `--surface`, `--surface-2/3`, `--line`, `--line-strong`.
- **Texto**: `--fg`, `--muted`, `--subtle`.
- **Radios**: `--radius-xs/sm/md/lg` (las clases `rounded-*` de Tailwind están redefinidas para usarlos).
- **Espaciado**: `--space-section` (ritmo vertical de la landing) y `--gutter` (márgenes laterales).
- **Movimiento**: `--ease-out`, `--duration-fast`, `--duration`.
- **Tipografía**: utilidades `font-wide` / `font-semiwide` controlan el eje de anchura de Archivo.

### Piezas compartidas entre la home y las páginas interiores

La home es la referencia visual. Las páginas interiores no usan tarjetas de dashboard: se construyen con las mismas piezas editoriales.

| Componente   | Qué aporta                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------------- |
| `SiteHeader` | La misma cabecera fija en toda la web, con menú móvil a pantalla completa                         |
| `PageHeader` | Etiqueta técnica, titular grande en mayúsculas, descripción gris y línea con segmento azul        |
| `Section`    | Bloque numerado separado por una línea fina (etiqueta a la izquierda o encima del contenido)     |
| `Panel`      | Superficie con barra técnica superior, igual que el correo de ejemplo del hero                    |
| `Rule`       | Línea divisoria con el segmento azul de la home                                                   |
| `StatGrid`   | Cifras grandes separadas por líneas, sin tarjetas                                                  |

## Animaciones y scroll suave

- **GSAP** se registra una sola vez en `src/lib/gsap.ts`. Todas las animaciones usan `useGSAP` con un `scope`, por lo que se revierten al
  desmontar el componente: no quedan disparadores duplicados al cambiar de ruta.
- **Entrada del hero**: aparición letra a letra de PHISHGUARD, regla, titular, texto, botones y anotaciones del correo de ejemplo.
- **ScrollTrigger**: revelado de secciones (`useReveal` + atributo `data-reveal`), frase «encendida» palabra a palabra en «El problema»,
  paso activo y barra de progreso en «¿Cómo funcionamos?», y un ligero parallax del nombre al salir del hero.
- **Páginas interiores**: entrada breve de la cabecera (≈0,6 s) y revelado de cada `Section` al entrar en pantalla. Nada bloquea la
  interacción: el analizador se puede usar desde el primer momento.
- **Lenis** solo se activa en la zona pública (`PublicLayout`); las páginas de trabajo usan scroll nativo. Se sincroniza con ScrollTrigger
  mediante el ticker de GSAP y se destruye al salir de la landing. En táctil se mantiene el scroll nativo del dispositivo.
- **Anclas**: `ScrollToTop` desplaza a la sección (con Lenis o nativo), compensa la altura de la navbar y mueve el foco al destino para que
  la navegación con teclado continúe allí. Repetir el mismo enlace también funciona.

## Responsive y accesibilidad

- PHISHGUARD está centrado respecto a la página (flex + interletraje con márgenes, compensando los márgenes laterales de la P y la D) y
  escala con el ancho de la ventana, con un tope que garantiza que quepa en el contenedor. Sin desbordamiento horizontal de 360 px a 2560 px.
- Móvil diseñado aparte: menú a pantalla completa (bloquea el scroll de fondo y se cierra con Escape), ilustraciones de cada paso en línea
  en lugar de la columna fija, tablas que ocultan columnas secundarias.
- **`prefers-reduced-motion`**: no se crea Lenis, GSAP no aplica ninguna animación de movimiento (todo se envuelve en
  `gsap.matchMedia`) y las transiciones CSS se anulan. El contenido nunca depende de una animación para verse.
- Foco visible en todos los controles, pestañas con flechas de teclado, roles ARIA en pestañas, acordeón e interruptores, enlace «Saltar al
  contenido» y contraste AA en el texto.

## Estado de las funcionalidades

**Implementado (frontend):** las 9 rutas y la 404, navegación con estado activo, landing animada, analizador con tres modalidades
(validación, contador, ejemplos, ayuda, parámetro `?mode=`), informe de resultados de demostración, historial con búsqueda y filtros,
configuración, panel de administración con gráficos, avisos de «funcionalidad pendiente» en cada acción no implementada.

**Pendiente (requiere backend):** motor de reglas, autenticación y sesiones, historial persistente, exportar y compartir informes,
consultas externas de dominios, integración con el laboratorio de ciberseguridad.

## Preparado para las siguientes fases

- **Servicios** (`src/services/`): `analysisService` y `authService` tienen sus firmas tipadas definitivas. Hoy lanzan
  `ServiceUnavailableError` y la interfaz lo muestra como «pendiente de integración». Para conectar el backend en Python, implementa esas
  funciones con `fetch` contra `API_BASE_URL` (variable `VITE_API_URL`, ver `.env.example`).
- **Tipos** (`src/types/`): `AnalysisResult`, `DetectedSignal`, `AnalysisSummary`, `User`… describen el contrato esperado de la API.
- **Datos demo** (`src/data/demo*.ts`): llegan a componentes genéricos (`AnalysesTable`, `StatCard`, `RiskDistribution`…), así que
  sustituirlos por datos reales no requiere cambiar la interfaz.
- **Niveles de riesgo** (`src/utils/risk.ts`): umbrales, etiquetas, colores, iconos y nombres de categoría en un único sitio.
- **Rutas protegidas**: `AppRouter` indica dónde envolver las rutas privadas y `/admin` cuando exista autenticación.
