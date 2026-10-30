## Base de datos con Supabase

Para gestionar y almacenar la información de **PhishGuard**, hemos utilizado **Supabase**, una plataforma que nos permite trabajar con una base de datos relacional PostgreSQL y gestionar los datos necesarios para el funcionamiento de la aplicación.

Durante el desarrollo, hemos creado y configurado la estructura de la base de datos para que la web pueda almacenar la información generada por los usuarios y los análisis de posibles intentos de phishing. De esta manera, los diferentes componentes de la plataforma pueden trabajar con una estructura de datos organizada y centralizada.

La base de datos está diseñada para dar soporte a las funcionalidades principales del proyecto, como el registro de usuarios, el almacenamiento de los mensajes o enlaces analizados y la conservación de los resultados obtenidos. Esta estructura permite consultar los análisis anteriores y facilita la futura implementación de un historial de actividad y estadísticas.

La integración con Supabase permite que el backend de PhishGuard pueda comunicarse con la base de datos para guardar y recuperar la información necesaria durante el proceso de análisis. Así, cuando un usuario envía un mensaje, enlace o correo electrónico sospechoso, el sistema puede procesar la información y almacenar el resultado del análisis para su posterior consulta, según las funcionalidades implementadas.

Además, al utilizar PostgreSQL como sistema de gestión de bases de datos, disponemos de una solución relacional que permite mantener los datos estructurados y establecer relaciones entre las distintas entidades del proyecto.

En definitiva, **Supabase constituye la capa de almacenamiento de PhishGuard**, proporcionando una base de datos centralizada y preparada para integrarse con el resto de la arquitectura de la aplicación y permitir su evolución a medida que se incorporen nuevas funcionalidades.

<img width="1917" height="909" alt="image" src="https://github.com/user-attachments/assets/395d719e-0abd-4a7a-9af4-8ebb6e2a6358" />
