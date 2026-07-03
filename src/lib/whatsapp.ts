const DEFAULT_WHATSAPP_MESSAGE = `Hola Diego, vengo de la web. Quería comentar una obra/reforma y ver si encaja para presupuesto.

Tipo de obra:
Zona:
Cuándo me gustaría empezar:
Comentario:`;

const envPhone = import.meta.env.VITE_DIEGO_WHATSAPP_PHONE;

export const WHATSAPP_CONFIG = {
  phone: envPhone?.trim() || "",
  message: DEFAULT_WHATSAPP_MESSAGE,
} as const;

export function buildWhatsAppMessage() {
  return WHATSAPP_CONFIG.message;
}

export function buildWhatsAppUrl() {
  if (!WHATSAPP_CONFIG.phone) {
    return null;
  }

  return `https://wa.me/${WHATSAPP_CONFIG.phone}?text=${encodeURIComponent(
    buildWhatsAppMessage(),
  )}`;
}
