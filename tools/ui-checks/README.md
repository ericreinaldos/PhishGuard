# Comprobaciones de interfaz

Scripts que se usaron durante el rediseño de la interfaz (rama `feature/ui-ux-redesign`) para medir la interfaz en un navegador real y detectar regresiones. Abren Microsoft Edge sin ventana (headless), lo controlan por el protocolo de DevTools y miden la página ya renderizada.

No usan dependencias externas ni tocan `frontend/package.json`: solo hace falta Node y Edge.

## Requisitos

- **Node 22 o superior.** Usan el `fetch` y el `WebSocket` que trae Node de serie (probado con Node 26).
- **Microsoft Edge** en `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`. Esa ruta está escrita en cada script; en otro sistema hay que cambiarla.
- **La aplicación arrancada.** Casi todos los scripts esperan el servidor de desarrollo en `http://localhost:5173`:

  ```powershell
  cd frontend
  npm run dev
  ```

  `final.mjs` y `border.mjs` reciben la URL como argumento, así que también sirven contra la build (`npm run build` y `npx vite preview`, que usa `http://localhost:4173`).

## Regresión completa: `final.mjs`

Es la comprobación principal y la que conviene ejecutar antes de subir cambios.

```powershell
node tools/ui-checks/final.mjs dev  http://localhost:5173
node tools/ui-checks/final.mjs prod http://localhost:4173
```

El primer argumento es una etiqueta para el informe; el segundo es la URL base. Recorre 14 rutas (portada, login, registro, panel, las tres pestañas del analizador, los tres estados de resultados, historial, ajustes, administración y la página 404) en cuatro tamaños de pantalla:

| Tamaño | Escala | Qué representa |
| --- | --- | --- |
| 1440×900 | 1 | Portátil grande |
| 1366×768 | 1 | Portátil común |
| 1536×730 | 1,25 | Pantalla de 1920×1080 al 125 %, descontando la interfaz del navegador |
| 375×812 | 2 | Móvil (iPhone) |

En cada una de las 56 combinaciones comprueba:

- que no haya scroll horizontal ni elementos que se salgan del ancho;
- que el texto cumpla el contraste WCAG AA;
- que haya exactamente un `h1`;
- las zonas táctiles de menos de 24 px (se excluye el enlace «Saltar al contenido», que solo aparece al enfocarlo);
- los errores y avisos de consola, las excepciones y los fallos de red.

Muestra un resumen en la consola y guarda el detalle en `final-<etiqueta>.json`. Una pasada limpia termina con `incidencias de diseño: 0` y `errores/avisos de consola y red: 0`.

La lista de zonas táctiles de menos de 24 px es informativa y no cuenta como incidencia. Mide la caja de cada elemento, no la zona que de verdad recibe el clic, así que hoy incluye estos avisos conocidos, que no son problemas reales:

- **Casillas del login y el registro** (16×16 px): van dentro de su `<label>`, que mide 24 px o más y también las marca.
- **«Regístrate», «Inicia sesión», «términos de uso» y «política de privacidad»**: son enlaces dentro de una frase, un caso que WCAG 2.5.8 exime.
- **«Ver detalle del análisis…»** (23 px) en el Panel y el Historial: el enlace se extiende con `::after` sobre toda la fila, que mide 66 px de alto en escritorio y 92 px en móvil.

Cualquier elemento nuevo en esa lista sí merece revisarse.

Las mediciones de contraste, desbordamiento y zonas táctiles están en la constante `AUDIT` de `audit.mjs`; `final.mjs` la lee de ese archivo, así que los dos deben estar en la misma carpeta.

## Otros scripts

Se escribieron para bloques concretos del rediseño. Comprueban el comportamiento tal como quedó al cerrar cada bloque, así que, si un bloque posterior cambió algo a propósito, alguna comprobación antigua puede fallar sin que sea una regresión.

Los comandos de estas tablas se ejecutan desde `tools/ui-checks`.

### Auditoría general

| Script | Qué hace | Uso |
| --- | --- | --- |
| `audit.mjs` | Auditoría inicial en 1440×900, 768×1024 y 375×812: contraste, desbordamiento, zonas táctiles, tamaños de letra, encabezados, orden de foco en el login, movimiento reducido y menú móvil. Guarda capturas en `shots/` y el detalle en `results.json`. | `node audit.mjs` |
| `verify.mjs` | Verificación de problemas concretos de la auditoría: foco al navegar, flujo del analizador, persistencia al cambiar de pestaña, preferencias y menú móvil. Guarda `verify.json`. | `node verify.mjs` |
| `compare.mjs` | Compara dos `results.json` de `audit.mjs` (antes y después) y lista las rutas que empeoran. | `node compare.mjs antes.json despues.json` |
| `tally.mjs` | Cuenta en el código fuente los tamaños de letra, duraciones, radios y colores escritos a mano. Sirve para seguir la migración a los tokens de diseño. | `node tally.mjs ../../frontend/src` |
| `border.mjs` | Lee en el login los colores de borde, el tamaño de letra de los campos y la transición del botón. | `node border.mjs http://localhost:5173 <carpeta-de-perfil>` |

### Pruebas de comportamiento por bloque

Cada línea muestra `OK` o `FALLA`. Si alguna falla, el script termina con código 2.

| Script | Qué comprueba | Uso |
| --- | --- | --- |
| `block2-test.mjs` | Bloque 2: orden de tabulación, foco en el primer error, validación de URL, foco al navegar, menú móvil (fondo `inert`, Escape) y zonas táctiles. | `node block2-test.mjs` |
| `b3-test.mjs` | Ctrl/Cmd+Enter en el analizador y animaciones según `APP_MOTION`. El argumento debe coincidir con el valor de `APP_MOTION` en `frontend/src/lib/gsap.ts`. | `node b3-test.mjs subtle` o `full` |
| `b4-test.mjs` | C3 (borradores del analizador y scroll), C2 (filas de tabla clicables) y B4 (limpiar filtros del historial). | `node b4-test.mjs [c3,c2,b4]` |
| `b5-test.mjs` | Contador de caracteres, acción principal del panel (B2) e informe de resultados (B3). | `node b5-test.mjs [counter,b2,b3]` |
| `b6-test.mjs` | Panel, servicio de preferencias (incluido almacenamiento corrupto o bloqueado), diálogo de confirmación y acceso a informes desde el historial (C5). | `node b6-test.mjs [panel,prefs,dialog,c5]` |
| `b7-test.mjs` | Nota de privacidad del analizador y respeto de `prefers-reduced-motion` aunque el interruptor de la app esté apagado. | `node b7-test.mjs` |

Los argumentos entre corchetes son opcionales; sin ellos se ejecutan todas las secciones.

### Capturas antes/después

Los scripts `*-capture.mjs` y `b4-states.mjs` hacen capturas en los cuatro tamaños de pantalla y las guardan en `b3/`, `b5/`, `b6/` o `c1/`, en una subcarpeta con la etiqueta que se les pase. Los `*-compose.ps1` juntan dos de esas carpetas en imágenes lado a lado.

```powershell
node tools/ui-checks/b6-capture.mjs antes
# ... aplicar el cambio ...
node tools/ui-checks/b6-capture.mjs despues
powershell -File tools/ui-checks/b3-compose.ps1 -Root tools/ui-checks/b6 -Left antes -Right despues `
  -LeftLabel ANTES -RightLabel DESPUES -OutName comparado -Names "settings-1440x900,settings-375x812"
```

## Archivos generados

Los scripts escriben capturas, informes JSON y perfiles temporales de Edge (`profile*`) dentro de esta carpeta. El `.gitignore` de la carpeta los excluye del repositorio. Cada script borra su perfil al terminar; si se interrumpe a mitad, la carpeta del perfil puede quedarse y se puede borrar sin problema.

Cada script usa su propio puerto de depuración (9333–9348), así que se pueden ejecutar varios a la vez.
