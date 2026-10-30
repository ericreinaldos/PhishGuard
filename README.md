# 🛡️ PhishGuard

> **Plataforma web para la detección y análisis de ataques de phishing.**

![Status](https://img.shields.io/badge/Status-En_Desarrollo-yellow?style=for-the-badge)
![Security](https://img.shields.io/badge/Focus-Cybersecurity-blue?style=for-the-badge)
![FP-Project](https://img.shields.io/badge/FP-ASIR-orange?style=for-the-badge)

El phishing es el fraude digital más extendido en España: SMS y correos que suplantan a Correos, bancos u organismos públicos.
**PhishGuard** permite a cualquier persona comprobar si un mensaje, un enlace o las cabeceras de un correo son sospechosos **antes de
hacer clic**. Devuelve un veredicto («Alto riesgo», «Sospechoso», «Parece legítimo») y explica las señales de alarma detectadas.

El análisis se basa en un **motor de reglas y puntuación propio**, transparente y determinista: cada señal (dominio, autenticación
SPF/DKIM/DMARC, lenguaje de urgencia…) suma puntos de riesgo. El proyecto incluye además un **laboratorio** aislado sobre Proxmox VE con
servidor de correo propio para probar patrones de phishing de forma segura y ética.

## Estructura del repositorio

```
PhishGuard/
├── frontend/         Aplicación web (React + TypeScript + Vite + Tailwind CSS)
├── documentacion/    Resumen, arquitectura, planificación, base de datos y diseño UX/UI
└── README.md         Este archivo
```

## Frontend

La interfaz web está en [`frontend/`](frontend/). Instrucciones completas, tecnologías, rutas y sistema de diseño en el
[README del frontend](frontend/README.md).

```bash
cd frontend
npm install
npm run dev       # http://localhost:5173
npm run build     # build de producción en frontend/dist
```

Requiere [Node.js](https://nodejs.org/) 20 LTS o superior.

> **Fase actual:** solo frontend. Todavía no hay backend integrado, así que los datos que se muestran son de demostración.

### Despliegue en Vercel

En el proyecto de Vercel, el **Root Directory** debe ser `frontend`
(`Settings → Build and Deployment → Root Directory`). El resto de la configuración está en
[`frontend/vercel.json`](frontend/vercel.json).

## Documentación

| Documento                                                                          | Contenido                                                            |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| [Resumen del proyecto](documentacion/RESUMEN%20DEL%20PROYECTO.md)                  | Problema, objetivos, componentes y funcionamiento del motor de reglas |
| [Arquitectura y planificación](documentacion/arquitectura-y-planificacion.md)      | Arquitectura del sistema, módulos del backend, mapa del sitio        |
| [Base de datos con Supabase](documentacion/Supabase%20PhishGuard.md)               | Diseño e integración de la base de datos                             |
| [Diseño UX/UI](documentacion/documentaci_n_ux_ui_phishguard.md)                    | Mapa de navegación, wireframes y mockups                             |
