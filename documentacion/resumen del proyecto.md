# 🛡️ PhishGuard

> **Plataforma web para la detección y análisis de ataques de phishing en tiempo real.**

![Status](https://img.shields.io/badge/Status-En_Desarrollo-yellow?style=for-the-badge)
![Security](https://img.shields.io/badge/Focus-Cybersecurity-blue?style=for-the-badge)
![FP-Project](https://img.shields.io/badge/FP-ASIR-orange?style=for-the-badge)

---

## 📌 El Problema

El **phishing** se ha consolidado como el fraude digital más extendido en la población española (suplantaciones de SMS/emails de Correos, entidades bancarias, etc.). 

**PhishGuard** nace para solucionar este peligro ofreciendo una herramienta accesible que permite a cualquier usuario **verificar la legitimidad de un mensaje sospechoso antes de hacer clic**.

---

## 🎯 ¿Qué es PhishGuard?

La plataforma consta de dos componentes principales interconectados:

1. **🌐 Producto (Cara Pública):**  
   Interfaz donde el usuario introduce un mensaje, enlace o cabeceras de correo electrónico. El sistema evalúa el contenido y devuelve un veredicto (*"Alto riesgo"*, *"Sospechoso"*, *"Parece legítimo"*) acompañado de una explicación detallada de las señales de alarma detectadas.
   
2. **🧪 Laboratorio (Infraestructura ASIR):**  
   Entorno controlado e aislado sobre **Proxmox VE** con servidor de correo propio (Postfix/Dovecot). Permite generar y probar patrones de phishing en un entorno seguro y ético sin afectar a terceros.

---

## 🔍 ¿Cómo analiza el phishing?

Para garantizar total transparencia ante el tribunal de evaluación, PhishGuard utiliza un **Motor de Reglas/Scoring propio** (no dependiente de IA de forma nativa):

* **Evaluación determinista:** Cada señal detectada suma un número específico de puntos de riesgo.
  * **Análisis de Dominio:** Antigüedad (WHOIS), detecciones de *typosquatting* y acortadores de URL.
  * **Autenticación de Correo:** Verificación de registros SPF, DKIM y DMARC.
  * **Análisis Semántico:** Frases de urgencia, patrones sospechosos y peticiones directas de datos bancarios.
* **Módulo opcional (LLM):** Comparativa experimental contra una API de IA para contrastar resultados sin comprometer la lógica base del motor.

---

## 🛠️ Arquitectura Técnica

| Capa | Tecnología / Herramienta |
| :--- | :--- |
| **Hipervisor** | Proxmox VE |
| **Sistema Operativo** | Debian / Ubuntu Server |
| **Frontend** | React / Vue.js |
| **Backend** | Python (Flask / FastAPI) |
| **Base de Datos** | PostgreSQL |
| **Servidor Web** | Nginx + TLS (Let's Encrypt) |
| **Servidor de Correo (Lab)** | Postfix + Dovecot |
| **Servicios DNS/Seguridad Correo** | BIND9 / dnsmasq (SPF, DKIM, DMARC) |
| **Red y Segmentación** | iptables / nftables |
| **Protección Pública** | Cloudflare |

---

## 🚀 Funcionalidades

### 🔴 Altas (Prioridad Principal)
- [ ] Registro e inicio de sesión con control de roles.
- [ ] Análisis de mensajes, enlaces y cabeceras.
- [ ] Verificación automatizada de dominios.
- [ ] Laboratorio de correo aislado en infraestructura propia.

### 🟡 Medias (Requeridas)
- [ ] Configuración e integración completa de SPF/DKIM/DMARC en el laboratorio.
- [ ] Histórico de análisis por usuario.
- [ ] Panel de administración con métricas y estadísticas.

### 🟢 Bajas (Extras / Wishlist)
- [ ] Generación e exportadores de informes en PDF.
- [ ] Módulo de simulación de campañas de concienciación.
- [ ] Extensión dedicada para navegadores web.

---

## 📅 Planning y Metodología

El desarrollo sigue las fases metodológicas fijadas para el proyecto de FP:

```text
[ Briefing ] ➔ [ Arquitectura/Diseño ] ➔ [ Ejecución (4 Sprints) ] ➔ [ Control ] ➔ [ Presentación ]
   (Sept)           (1-11 Oct)             (15 Oct - 9 Nov)        (17-20 Nov)      (3 Dic)
```

- **Gestión del Código y Tareas:** GitHub Repositories + GitHub Projects (Kanban).
- **Documentación / Memoria:** GitBook / Markdown (desarrollada en paralelo durante todo el curso).

---

## 👥 Equipo

* **Abdellah Chahmi Bahaqqy** — *Perfil Técnico en Redes y Seguridad / Comunicación y Responsabilidad*
* **Eric Reinaldo Salvador** — *Perfil Técnico en Redes y Seguridad / Iniciativa y Adaptabilidad*
