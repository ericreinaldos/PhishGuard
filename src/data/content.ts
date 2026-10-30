/** Textos estáticos de la landing. Separados de los componentes para editarlos fácilmente. */

export const FAQ_ITEMS = [
  {
    q: '¿Guardáis mis mensajes?',
    a: 'En esta versión no se guarda nada: la web todavía no tiene servidor. Cuando exista el historial, podrás decidir si se conserva el resultado, el texto o nada, y borrarlo cuando quieras desde Configuración.',
  },
  {
    q: '¿Hasta qué punto es fiable el análisis?',
    a: 'PhishGuard busca señales conocidas de phishing con reglas que se pueden explicar una a una. Una puntuación baja no garantiza que un mensaje sea seguro: es una ayuda para decidir, no un sustituto de tu criterio.',
  },
  {
    q: '¿Por qué reglas y no inteligencia artificial?',
    a: 'Porque cada punto de la puntuación tiene que poder justificarse. Con reglas puedes ver exactamente qué se ha detectado, en qué parte del mensaje y cuánto pesa, y corregirlas cuando se equivocan.',
  },
  {
    q: '¿Necesito una cuenta?',
    a: 'La idea es que no haga falta para un análisis puntual. La cuenta servirá para guardar tu historial y ajustar tus preferencias.',
  },
  {
    q: '¿Puedo comprobar un enlace sin abrirlo?',
    a: 'Sí, y es lo recomendable. Copia la dirección con clic derecho → «Copiar dirección del enlace» (o mantén pulsado en el móvil) y pégala en el analizador de URL.',
  },
  {
    q: '¿En qué estado está el proyecto?',
    a: 'Ahora mismo está lista la interfaz. El motor de reglas, las cuentas de usuario y el historial se están desarrollando, así que el analizador todavía no devuelve resultados reales.',
  },
];

export const ANALYZER_TIPS = [
  'Mantén los enlaces tal cual, sin abrirlos.',
  'No compartas contraseñas ni códigos.',
  'Incluye el texto completo, también la firma.',
  'Si puedes, añade el remitente o el número.',
];

/** Tácticas habituales del phishing (sección «El problema»). */
export const PHISHING_TACTICS = [
  { title: 'Urgencia', example: 'Su cuenta se bloqueará en 24 horas', text: 'Un plazo corto para que actúes antes de pensar.' },
  { title: 'Suplantación', example: 'Le escribe el Departamento de Seguridad', text: 'Se hacen pasar por tu banco, una empresa o alguien de tu trabajo.' },
  { title: 'Enlaces engañosos', example: 'banco-seguro-verificacion.co', text: 'Direcciones que se parecen a la real, pero no lo son.' },
  { title: 'Petición de datos', example: 'Confirme su PIN para continuar', text: 'Contraseñas, códigos o tarjetas que nadie legítimo pide así.' },
];

/** Pasos de «¿Cómo funcionamos?», basados en el diseño de Figma. */
export const HOW_STEPS = [
  {
    title: 'Pega el mensaje',
    summary: 'Copia el texto sospechoso en el cuadro.',
    text: 'Un correo, un SMS, un mensaje de WhatsApp, un enlace suelto o las cabeceras técnicas de un correo. No hace falta abrir nada ni hacer clic.',
  },
  {
    title: 'Lo analizamos',
    summary: 'Revisamos enlaces, tono y urgencia.',
    text: 'El motor recorre el contenido con un conjunto de reglas: dominios que imitan a otros, plazos que meten prisa, remitentes genéricos, peticiones de datos.',
  },
  {
    title: 'Puntuamos',
    summary: 'Cada señal suma al nivel de riesgo.',
    text: 'Cada regla que se activa aporta un peso conocido. La suma da una puntuación de 0 a 100 que puedes descomponer pieza a pieza.',
  },
  {
    title: 'Ves el resultado',
    summary: 'Te explicamos qué hacer a continuación.',
    text: 'Nivel de riesgo, motivos concretos señalados en tu propio mensaje y recomendaciones prácticas: qué no hacer y a quién avisar.',
  },
];
