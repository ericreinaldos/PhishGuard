import type { AnalysisResult } from '@/types/analysis';

/**
 * DEMO: resultado de ejemplo que reproduce el boceto de diseño.
 * Sirve únicamente para visualizar la página de resultados; no es la salida
 * de ningún motor de reglas.
 */
export const DEMO_RESULT: AnalysisResult = {
  id: 'demo-1042',
  type: 'message',
  score: 90,
  level: 'high',
  verdict: 'Probable phishing',
  summary:
    'El mensaje combina urgencia, un enlace que no corresponde a la entidad que dice representar y una petición de datos personales.',
  input:
    'Estimado cliente:\n\nHemos detectado un acceso inusual y su cuenta ha sido SUSPENDIDA temporalmente. Para evitar el bloqueo definitivo, verifique sus datos en las próximas 24 horas:\n\nhttp://banco-seguro-verificacion.co/acceso\n\nAtentamente,\nDepartamento de Seguridad',
  signals: [
    {
      id: 's1',
      ruleId: 'LNK-004',
      category: 'links',
      title: 'Enlace sospechoso',
      description: 'El dominio del enlace no coincide con el de la entidad mencionada y usa un TLD poco habitual para banca.',
      weight: 35,
      evidence: 'banco-seguro-verificacion.co',
    },
    {
      id: 's2',
      ruleId: 'URG-001',
      category: 'urgency',
      title: 'Urgencia artificial',
      description: 'Se impone un plazo corto con amenaza de consecuencias para forzar una acción inmediata.',
      weight: 25,
      evidence: 'en las próximas 24 horas',
    },
    {
      id: 's3',
      ruleId: 'IMP-002',
      category: 'impersonation',
      title: 'Suplantación de identidad',
      description: 'El remitente se presenta como un departamento oficial sin identificar a la entidad.',
      weight: 25,
      evidence: 'Departamento de Seguridad',
    },
    {
      id: 's4',
      ruleId: 'TON-003',
      category: 'tone',
      title: 'Tono alarmista',
      description: 'Uso de mayúsculas y lenguaje intimidatorio para generar sensación de amenaza.',
      weight: 5,
      evidence: 'SUSPENDIDA',
    },
  ],
  recommendations: [
    {
      id: 'r1',
      title: 'No abras el enlace',
      description: 'Accede a tu banco escribiendo tú mismo la dirección oficial o desde su aplicación.',
    },
    {
      id: 'r2',
      title: 'No facilites datos',
      description: 'Ninguna entidad legítima solicita contraseñas o códigos por correo o SMS.',
    },
    {
      id: 'r3',
      title: 'Repórtalo',
      description: 'Reenvía el mensaje al canal de fraude de tu entidad y elimínalo después.',
    },
  ],
  createdAt: '2026-10-28T09:14:00Z',
  durationMs: 184,
  engineVersion: 'demo',
  rulesEvaluated: 42,
};
