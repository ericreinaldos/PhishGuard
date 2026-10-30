# PhishGuard — Arquitectura y planificación

> Documento de referencia para la memoria del proyecto. Generado a partir de las decisiones tomadas en equipo durante la fase de planificación (SEM 4-5).

## 1. Arquitectura del sistema

| Componente | Tecnología | Versión concreta | Puerto | Descripción |
|---|---|---|---|---|
| Hipervisor | Proxmox VE | 9.2 | 8006 | Última versión estable (mayo 2026), basada en Debian 13 |
| SO (host y VMs) | Debian | 13 "Trixie" | — | Base de Proxmox VE 9.x; estable y con soporte largo |
| Frontend | React | 18.x | 3000 (dev) | Interfaz del analizador y paneles |
| Backend | Python + Flask | Python 3.13 / Flask 3.x | 5000 | API REST, motor de scoring |
| Servidor web | Nginx | 1.27 | 80/443 | Proxy inverso + TLS |
| Base de datos | PostgreSQL | 17.11 | 5432 | Versión estable y madura (17 tiene más tiempo en producción y mejor soporte de librerías Python que la 18, que es la más reciente) |
| Correo (laboratorio) | Postfix + Dovecot | Última de repositorio Debian 13 | 25 / 993 | Generación de casos de prueba |
| DNS | BIND9 | Última de repositorio Debian 13 | 53 | SPF/DKIM/DMARC del laboratorio |
| Cifrado | Let's Encrypt / Certbot | — | — | TLS de la plataforma pública |
| Firewall | nftables | Incluido en Debian 13 | — | Segmentación lab / producción (sustituye a iptables como estándar actual) |

### Hardware

| Elemento | Especificación recomendada | Justificación |
|---|---|---|
| CPU | Soporte de virtualización (Intel VT-x / AMD-V) | Imprescindible para Proxmox |
| RAM | 16 GB mínimo (idealmente 32 GB) | 4-5 VMs simultáneas sin ahogar el host |
| Disco | SSD, 250 GB+ | Las VMs y los logs de análisis crecen rápido |
| Red | 1 interfaz física mínimo, idealmente 2 | Permite segmentar físicamente el lab del resto |

### Lógica de negocio (Backend) — módulos

| Módulo | Función |
|---|---|
| `auth` | Registro, login, gestión de roles (usuario/admin) |
| `analyzer` | Motor de scoring: WHOIS, typosquatting, SPF/DKIM/DMARC, patrones de texto |
| `history` | Guarda y sirve el histórico de análisis por usuario |
| `admin` | Estadísticas agregadas, gestión de campañas del laboratorio |
| `lab_bridge` | Conecta el backend con el servidor de correo del laboratorio |

## 2. Diseño de la aplicación web

### Mapa del sitio

```
Home / Analizador (acceso libre)
├── Registro / Login
├── Histórico (requiere sesión)
└── Panel admin (requiere rol admin)
    └── Laboratorio (simulación de campañas)
```

### Mockups — disposición y paleta

Paleta corporativa: navy `#1E2761` + azul hielo `#CADCFC` + blanco.

- **Home/Analizador:** cabecera navy con logo, cuadro de texto grande centrado, botón "Analizar" en navy sólido. Resultado con tarjeta de color según veredicto (verde=seguro, ámbar=sospechoso, rojo=phishing).
- **Registro/Login:** formulario simple centrado, mismos colores corporativos.
- **Histórico:** tabla con fecha, tipo de contenido, veredicto y botón "ver detalle".
- **Panel admin:** menú lateral navy fijo (Estadísticas / Laboratorio / Usuarios), gráficas simples.

**Navegación:** cabecera fija con logo (vuelve a Home); si hay sesión, enlaces a Histórico y, si es admin, a Panel admin.

## 3. Objetivos y funcionalidades

| ID | Prioridad | Objetivo | Funcionalidad | SEM | Estado |
|---|---|---|---|---|---|
| ID1 | Alta | Registro/login con roles | Formulario + gestión de sesión | SEM 4-5 / SEM 6 | Pendiente |
| ID2 | Alta | Analizar mensaje pegado | Motor de scoring + resultado explicado | SEM 7 | Pendiente |
| ID3 | Alta | Verificar dominio/enlace | WHOIS + typosquatting + listas negras | SEM 7 | Pendiente |
| ID4 | Alta | Laboratorio de correo aislado | Postfix/Dovecot en red segmentada | SEM 5-6 | Pendiente |
| ID5 | Media | SPF/DKIM/DMARC en el lab | Generar casos de prueba válidos/falsos | SEM 6 | Pendiente |
| ID6 | Media | Histórico por usuario | Guardar y listar análisis previos | SEM 8 | Pendiente |
| ID7 | Media | Panel admin con estadísticas | Dashboard de nº análisis y % phishing | SEM 8 | Pendiente |

## 4. Roles fijos del equipo

| Rol | Persona | Por qué | Tareas principales |
|---|---|---|---|
| Infraestructura y laboratorio | Abdellah Chahmi Bahaqqy | Responsabilidad y comunicación constante, clave en la parte que bloquea al resto si falla | Proxmox, VMs, DNS, Postfix/Dovecot, segmentación de red, hardening |
| Backend y motor de análisis | Eric Reinaldo Salvador | Iniciativa y adaptabilidad, clave en la parte con más decisiones de diseño sobre la marcha | Flask/FastAPI, lógica de scoring, conexión con PostgreSQL |

Frontend y documentación se reparten por sprint según disponibilidad. Cada uno revisa la parte del otro antes de darla por cerrada.

**Se añadirá una máquina virtual Debian 13 la cual sera utilizada para gran parte del proyecto en conjunto a proxmox**
