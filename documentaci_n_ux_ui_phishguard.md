# PhishGuard — Diseño UX/UI y Arquitectura de Navegación

Este documento detalla el proceso de diseño de interfaz (UI) y experiencia de usuario (UX) para **PhishGuard**, una herramienta enfocada en la detección y análisis de mensajes sospechosos de *phishing*.

---

## 🗺️ Mapa de Navegabilidad

El mapa de navegabilidad define la estructura jerárquica y el flujo de pantallas que el usuario puede seguir dentro de PhishGuard.

<img width="412" height="574" alt="image" src="https://github.com/user-attachments/assets/d94c9c22-0df6-4e75-9a0f-fe6e0eafd22e" />


### Explicación del Flujo:
* **Página Inicial (Landing Page):** Es el nodo central de acceso. Permite navegar hacia el inicio de sesión, registro o hacia las secciones informativas y operativas.
* **Autenticación (Inicio de sesión / Registro):** Conectados bidireccionalmente para facilitar la alternancia entre ambos estados.
* **Sección Informativa («¿Cómo funcionamos?»):** Accesible directamente desde la página inicial para orientar a nuevos usuarios sobre el proceso de detección.
* **Proceso de Análisis («Escanear» $\rightarrow$ «Panel de escaneo»):** Desde la página inicial o tras autenticarse, el usuario accede a la vista de pegado/escaneo del mensaje. Tras procesarlo, es redirigido al panel con los resultados del análisis de riesgo.

---

## 📐 Wireframe (Baja Fidelidad)

En esta etapa se definió la disposición estructural y jerarquía visual del contenido sin distracciones estilísticas o cromáticas.

<img width="729" height="842" alt="image" src="https://github.com/user-attachments/assets/7d39248a-aee7-4e47-8d5c-2dc471438f58" />


### Componentes Clave:
1. **Acceso / Autenticación:** Formularios limpios y centrados para ingreso y registro.
2. **Landing Page:** Encabezado claro con CTA (*Call to Action*) principal para escanear directamente y enlace explicativo.
3. **Sección Informativa:** Bloques explicativos organizados paso a paso (Pasos 1 al 4) y preguntas frecuentes.
4. **Entrada de Datos:** Área de texto amplia para pegar el mensaje sospechoso junto a recomendaciones de seguridad.
5. **Dashboard de Resultados:** Desglose del análisis con un indicador de nivel de riesgo y parámetros específicos.

---

## 🎨 Mockup (Alta Fidelidad)

El mockup representa el diseño visual final con la paleta de colores, tipografías y componentes interactivos aplicados.

<img width="695" height="796" alt="image" src="https://github.com/user-attachments/assets/4c55f13d-b1aa-40c9-8027-83230be1e671" />


### Decisiones de Diseño:
* **Paleta de Colores:** Uso de un fondo oscuro (*Dark Mode*) para reducir la fatiga visual y proyectar una estética moderna de ciberseguridad, complementado con un **azul eléctrico brillante** en botones y bloques activos para resaltar las acciones principales.
* **Jerarquía de Riesgo:** En la pantalla final de análisis, se utiliza un indicador destacado con tipografía clara para indicar el **Nivel de Riesgo (p. ej., ALTO)** junto a un desglose puntual de indicadores detectados (urgencia, enlaces sospechosos, etc.).

---

## Paleta de colores

<img width="872" height="580" alt="image" src="https://github.com/user-attachments/assets/e50b875c-fb51-4a74-bec4-c4959a4c5f43" />

