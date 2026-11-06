# Proxmox VE — Guía rápida para el proyecto PhishGuard (ASIX 2)

## 1. Preguntas teóricas (respuestas directas)

**¿Qué es un clúster de Proxmox?**  
Es un grupo de varios servidores físicos (nodos) que trabajan como si fueran uno solo. Comparten configuración y pueden mover máquinas virtuales o contenedores de un nodo a otro automáticamente si uno falla, para que los servicios no se caigan.

**¿De qué otro modo se puede emular un clúster de Proxmox?**  
La forma más común en un laboratorio es instalar varias máquinas virtuales de Proxmox dentro de un hipervisor (VirtualBox, VMware) y conectarlas entre sí mediante redes virtuales. Así puedes probar la configuración de clúster sin tener varios equipos físicos.

**¿Qué tecnologías permiten crear un clúster de alta disponibilidad?**  
Las dos piezas clave son **Corosync** (se encarga de que los nodos se comuniquen y detecten fallos) y **Ceph** (proporciona almacenamiento compartido y replicado, para que los datos estén disponibles desde cualquier nodo).

**¿Qué son los hipervisores? ¿Tipo 1 o tipo 2? Ejemplos.**  
Un hipervisor es el software que permite ejecutar varias máquinas virtuales sobre un hardware.

- **Tipo 1 (bare-metal):** se instala directamente sobre el hardware, sin sistema operativo anfitrión. Ejemplos: **Proxmox VE**, VMware ESXi, Microsoft Hyper-V.
- **Tipo 2 (hosted):** se instala como una aplicación sobre un sistema operativo normal. Ejemplos: **VirtualBox**, VMware Workstation.

**¿En qué sistema operativo se basa Proxmox?**  
En **Debian Linux**. De hecho, el instalador de Proxmox no es más que un Debian con los paquetes de Proxmox ya integrados.

**¿Qué tipos de virtualización están disponibles por defecto en Proxmox?**  
Dos: **KVM** para máquinas virtuales completas (cualquier sistema operativo) y **LXC** para contenedores Linux, que son mucho más ligeros porque comparten el kernel del host.

**¿Qué es QEMU, KVM, noVNC, Ceph? Características principales.**

- **QEMU:** el emulador que “construye” el hardware virtual de la VM.
- **KVM:** el módulo del kernel de Linux que acelera la virtualización usando las extensiones del procesador (Intel VT / AMD-V).
- **noVNC:** el cliente web que te permite ver y controlar la pantalla de una VM directamente desde el navegador, sin instalar nada.
- **Ceph:** un sistema de almacenamiento distribuido. En Proxmox se usa para tener discos de VM replicados y disponibles en todos los nodos del clúster.

**¿Qué roles de usuario y grupos se pueden configurar en Proxmox?**  
Proxmox usa un sistema de permisos basado en roles. Los más típicos son:

- **Administrator:** acceso total.
- **PVEAdmin:** gestiona la mayoría de recursos, pero no toca la configuración del sistema.
- **PVEDatastoreAdmin:** crea y asigna espacio de almacenamiento y plantillas.
- **PVEDatastoreUser:** solo ve el almacenamiento y asigna espacio de backup.
- **PVETemplateUser:** únicamente puede ver y clonar plantillas.
- **NoAccess:** sin permisos.

Además, se pueden crear **grupos** de usuarios para asignarles un rol de golpe y simplificar la gestión.

**¿Dónde se almacenan las ISOs y templates?**  
En los **datastores** (almacenes de datos) que definas. Lo normal es usar el almacenamiento `local` del nodo. Dentro de él, hay una carpeta específica para **ISOs** y otra para **Templates** de contenedores. Se suben y se gestionan desde la interfaz web: *Datacenter → Storage → local → Content*.

---

## 2. Configuración de un clúster en Proxmox (ejemplo práctico)

### 1. Hardware especificado (ejemplo de laboratorio)

- **3 nodos** (pueden ser VMs dentro de VirtualBox/VMware).
- **CPU:** 2 vCPUs por nodo (con VT-x/AMD-V activado).
- **RAM:** 4 GB por nodo (mínimo 2 GB para el sistema + 2 GB para las VMs de prueba).
- **Disco:** 20 GB por nodo.
- **Red:** 2 interfaces virtuales por nodo:
  - `vmbr0` → red de gestión (ej. `10.10.10.0/24`).
  - `vmbr1` → red dedicada a Corosync (ej. `10.10.11.0/24`).

### 2. ¿Cómo lo he configurado? (resumen de pasos)

1. Instalar Proxmox VE en cada nodo (o crear las VMs con la ISO de Proxmox).
2. Acceder a la web de uno de los nodos (`https://IP:8006`).
3. Ir a **Datacenter → Cluster → Create Cluster**, ponerle un nombre y anotar la “Join Information” que genera.
4. En los otros dos nodos, ir a **Datacenter → Cluster → Join Cluster** y pegar la información del primer nodo.
5. Verificar con `pvecm status` que el clúster está “Quorate” (con quórum) y que los 3 nodos aparecen.
6. (Opcional para HA) Configurar **Ceph** en los tres nodos para tener almacenamiento compartido y luego marcar las VMs como recursos HA con `ha-manager add vm:<ID>`.

### 3. Incidencias técnicas y solución (las típicas)

- **“No quorum” después de añadir nodos:** suele ser porque la red de Corosync no está bien aislada o hay pérdida de paquetes. Solución: revisar que `vmbr1` esté dedicada solo a Corosync y que los nodos se vean entre sí por esa red.
- **El nodo no aparece en el clúster:** a veces los servicios `pve-cluster` y `corosync` no arrancan correctamente. Se soluciona reiniciando ambos servicios (`systemctl restart pve-cluster corosync`) o revisando que la hora esté sincronizada.
- **Error al unirse por SSH:** Proxmox necesita acceso SSH entre nodos. Asegurarse de que las claves SSH se han intercambiado correctamente (el asistente de “Join” suele hacerlo, pero si falla se puede hacer manual).

### 4. ¿Cómo eliminarías un clúster? Pasos y justificación

*Justificación previa:* Antes de tocar nada, **hacer copia de seguridad de las VMs y contenedores**. Al deshacer un clúster, los recursos pueden quedar inaccesibles si no se migran o respaldan primero.

1. **Parar los servicios del clúster** en el nodo que quieras sacar: `systemctl stop pve-cluster corosync`.
2. **Sacar el nodo del clúster:** `pvecm leave --force` (o `pvecm delnode <nombre-nodo>` desde otro nodo, según la versión).
3. **Repetir** con cada nodo hasta quedarte sin clúster.
4. **Limpiar archivos residuales:** borrar `/etc/pve/nodes/<nombre-nodo>` en los nodos restantes para que no siga apareciendo en la interfaz.
5. Si el nodo va a volver a usarse solo, reiniciar y comprobar que arranca en modo local.

*Motivo de cada paso:* parar servicios evita corromper la configuración compartida; `pvecm leave` notifica formalmente al resto de nodos; borrar los directorios residuales limpia la vista del clúster y evita errores de “nodo fantasma”.

---

## 3. Trabajando con IPTables en MV (red interna en VirtualBox/VMware)

**Objetivo:** dos VMs en una red interna que salgan a Internet a través de una tercera VM que hace de router con IPTables.

### Configuración en el hipervisor (VirtualBox/VMware)

1. Crear **dos redes internas** (o “host-only” adaptadas) en el hipervisor:
   - `Red-LAN` (ej. `192.168.50.0/24`) → aquí se conectan la VM cliente y la VM router.
   - `Red-WAN` (o usar NAT del hipervisor) → la VM router se conecta aquí para tener salida a Internet.
2. **VM Router:** dos adaptadores:
   - Adaptador 1 → `Red-LAN` (IP estática `192.168.50.1`).
   - Adaptador 2 → NAT del hipervisor (IP dinámica, ej. `10.0.2.15`).
3. **VM Cliente:** un solo adaptador → `Red-LAN` (IP `192.168.50.10`, puerta de enlace `192.168.50.1`).

### Configuración del router (ejemplo en Linux)

```bash
# Activar el reenvío de paquetes
echo 1 > /proc/sys/net/ipv4/ip_forward

# Regla de NAT para que la red interna salga a Internet
iptables -t nat -A POSTROUTING -s 192.168.50.0/24 -o eth1 -j MASQUERADE

# Permitir el tráfico reenviado
iptables -A FORWARD -i eth0 -o eth1 -j ACCEPT
iptables -A FORWARD -i eth1 -o eth0 -m state --state RELATED,ESTABLISHED -j ACCEPT
```

*Nota:* `eth0` es la interfaz de la red interna y `eth1` la que va a Internet (ajustar según el nombre real de las interfaces).

Con esto, la VM cliente ya puede navegar, y si quieres publicar un servicio del cliente, añadirías una regla DNAT en el router.

---

## 4. Configuración de una red interna en Proxmox (práctica LXC + Alpine + Nginx)

**Resumen de la práctica:**

- **Contenedor LXC (router):** se le asignan dos interfaces: una en el bridge externo (`vmbr0`) y otra en un bridge interno (`vmbr1`, sin puerto físico). Actúa como puerta de enlace de la red interna.
- **VM Alpine (cliente):** se conecta solo a `vmbr1` y se le instala Nginx.
- **IPTables en el LXC router:** se configuran reglas de **NAT (MASQUERADE)** para que la red interna salga a Internet y una regla **DNAT** para redirigir el tráfico del puerto 80 de la IP externa del router hacia la IP interna de la VM Alpine.

### ¿Cómo has configurado la red interna (router y cliente) para permitir el acceso desde el exterior?

1. Se crea un **bridge interno** en Proxmox (ej. `vmbr1`) sin interfaz física asociada, con una subred privada (ej. `10.10.20.0/24`).
2. Al LXC router se le asigna `vmbr0` (externa, con IP de la LAN de Proxmox) y `vmbr1` (IP `10.10.20.1`).
3. A la VM Alpine se le asigna `vmbr1` con IP `10.10.20.10` y puerta de enlace `10.10.20.1`.
4. En el LXC router se activa `net.ipv4.ip_forward=1` y se añade:
   - `iptables -t nat -A POSTROUTING -s 10.10.20.0/24 -o <interfaz-externa> -j MASQUERADE` (para la salida a Internet).
   - `iptables -t nat -A PREROUTING -i <interfaz-externa> -p tcp --dport 80 -j DNAT --to-destination 10.10.20.10:80` (para que desde fuera se acceda al Nginx de Alpine).
5. Se asegura que el firewall del router permita el tráfico reenviado (`FORWARD ACCEPT` o reglas específicas).

### Especificaciones técnicas de la red (netplan/interfaces)

*Alpine Linux no usa netplan; utiliza `/etc/network/interfaces`. Un ejemplo sería:*

```text
auto eth0
iface eth0 inet static
    address 10.10.20.10/24
    gateway 10.10.20.1
    dns-nameservers 1.1.1.1
```

*(Si el cliente fuera Ubuntu, el equivalente en netplan sería un archivo YAML con `addresses`, `gateway4` y `nameservers`).*

### Comandos de IPTables utilizados y su función

- `iptables -t nat -A POSTROUTING -s 10.10.20.0/24 -o eth0 -j MASQUERADE` → **NAT de salida**: traduce las IPs privadas de la red interna a la IP pública/externa del router para que puedan navegar.
- `iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j DNAT --to-destination 10.10.20.10:80` → **DNAT (port forwarding)**: redirige las peticiones que llegan al puerto 80 del router hacia el puerto 80 de la VM Alpine.
- `iptables -A FORWARD -i eth0 -o eth1 -j ACCEPT` (y la regla inversa para tráfico establecido) → permiten que los paquetes reenviados entre las dos interfaces no sean bloqueados por el firewall.

### Instala Nginx en el equipo cliente (Alpine)

```bash
apk update
apk add nginx
rc-service nginx start
rc-update add nginx default
```

Con esto, Alpine sirve la página por defecto de Nginx en el puerto 80.

### ¿Qué has tenido que configurar para acceder desde la red externa a la web en el cliente?

Básicamente dos cosas:

1. **En el router (LXC):** la regla **DNAT** que redirige el puerto 80 de la interfaz externa hacia la IP interna `10.10.20.10`.
2. **En el cliente Alpine:** asegurarse de que Nginx está escuchando en `0.0.0.0:80` (configuración por defecto) y que el firewall local (si está activo) permite el tráfico entrante al puerto 80.

De esta forma, al acceder desde un equipo de la red externa a `http://<IP-externa-del-router>:80`, la petición se redirige automáticamente a la VM Alpine y se visualiza la página de Nginx.

---

Con esto tienes la base teórica y los pasos prácticos resumidos. Si necesitas que adapte alguna sección a un formato más concreto (por ejemplo, solo comandos, o solo explicaciones), dímelo y lo ajusto.
