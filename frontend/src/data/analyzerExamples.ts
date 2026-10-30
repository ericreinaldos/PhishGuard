import type { AnalysisType } from '@/types/analysis';

/** Entradas de ejemplo que el usuario puede cargar en cada modalidad. Todas son ficticias. */
export const ANALYZER_EXAMPLES: Record<AnalysisType, string> = {
  message:
    'Estimado cliente:\n\nHemos detectado un acceso inusual y su cuenta ha sido SUSPENDIDA temporalmente. Para evitar el bloqueo definitivo, verifique sus datos en las próximas 24 horas:\n\nhttp://banco-seguro-verificacion.co/acceso\n\nAtentamente,\nDepartamento de Seguridad',
  url: 'http://secure-banco-verificacion.co/login?session=8f2a',
  headers:
    'Return-Path: <avisos@correos-envios.net>\nReceived: from mail.correos-envios.net (unknown [185.234.10.22])\n  by mx.example.com with ESMTP id 4XyZ; Mon, 27 Oct 2026 11:04:58 +0100\nAuthentication-Results: mx.example.com;\n  spf=softfail smtp.mailfrom=correos-envios.net;\n  dkim=none;\n  dmarc=fail header.from=correos.es\nFrom: "Correos" <notificaciones@correos.es>\nReply-To: <soporte-envios@correos-envios.net>\nSubject: Su paquete está retenido\nMessage-ID: <20261027110458.4XyZ@correos-envios.net>',
};

export const MESSAGE_MAX_LENGTH = 10000;
export const HEADERS_MAX_LENGTH = 20000;
