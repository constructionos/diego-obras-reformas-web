/**
 * ConstructionOS integration adapter.
 *
 * Landing pública de Diego Obras y Reformas.
 * Prepara el payload y el submit para el SaaS privado ConstructionOS.
 *
 * Estado actual:
 *  - No hay endpoint público disponible: `futureApiEndpoint` está vacío.
 *  - `submitConstructionOSLead` valida, construye el payload y devuelve
 *    un resultado "prepared" para que la UI redirija al intake oficial.
 *
 * Estado futuro:
 *  - Rellenar `futureApiEndpoint`, cambiar `integrationMode` a "api"
 *    y esta función hará el POST real. La UI no cambia.
 */

const DEFAULT_INTAKE_URL =
  "https://constructionos-constructionos.vercel.app/intake/diego-obras-reformas";

const envIntakeUrl = import.meta.env.VITE_CONSTRUCTIONOS_INTAKE_URL;
const envApiUrl = import.meta.env.VITE_CONSTRUCTIONOS_API_URL;

export const CONSTRUCTIONOS_CONFIG = {
  companySlug: "diego-obras-reformas",
  intakeUrl: envIntakeUrl || DEFAULT_INTAKE_URL,
  futureApiEndpoint: envApiUrl || "",
  integrationMode: "redirect" as "redirect" | "api",
} as const;

export type ServiceType =
  | "reforma_integral"
  | "local_negocio"
  | "piscina_exterior"
  | "fachada"
  | "bano_completo"
  | "alojamiento_turistico"
  | "otro";

export type BudgetRange = "unknown" | "less_15k" | "15k_50k" | "50k_150k" | "more_150k";

export type DesiredTimeline = "unknown" | "asap" | "1_3_months" | "3_6_months" | "more_6_months";

export type ProjectStatus =
  | "idea_inicial"
  | "quiero_visita"
  | "comparando_presupuestos"
  | "listo_para_empezar"
  | "obra_en_marcha";

export interface LeadFormData {
  contactName: string;
  phone: string;
  email: string;
  serviceType: ServiceType | "";
  city: string;
  province: string;
  budgetRange: BudgetRange;
  desiredTimeline: DesiredTimeline;
  projectStatus: ProjectStatus;
  description: string;
}

export interface ConstructionOSLeadPayload {
  companySlug: string;
  source: string;
  title: string;
  contactName: string;
  email: string | null;
  phone: string | null;
  city: string;
  province: string | null;
  serviceType: string;
  budgetRange: string;
  desiredTimeline: string;
  projectStatus: string;
  description: string;
  metadata: {
    landingVersion: string;
    submittedFrom: string;
  };
}

export type SubmitResult =
  | { status: "prepared"; payload: ConstructionOSLeadPayload; intakeUrl: string }
  | { status: "sent"; payload: ConstructionOSLeadPayload }
  | { status: "error"; errors: Partial<Record<keyof LeadFormData | "form", string>> };

const SERVICE_LABELS: Record<ServiceType, string> = {
  reforma_integral: "Reforma integral",
  local_negocio: "Local o negocio",
  piscina_exterior: "Piscina y exteriores",
  fachada: "Fachada",
  bano_completo: "Baño completo",
  alojamiento_turistico: "Alojamiento turístico",
  otro: "Otro proyecto",
};

/** Valida los mínimos comerciales de un formulario de captación. */
export function validateLeadForm(
  data: LeadFormData,
): Partial<Record<keyof LeadFormData | "form", string>> {
  const errors: Partial<Record<keyof LeadFormData | "form", string>> = {};

  if (!data.contactName.trim() || data.contactName.trim().length < 2) {
    errors.contactName = "Necesitamos un nombre para dirigirnos a ti.";
  }

  const hasPhone = data.phone.trim().length >= 6;
  const hasEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim());
  if (!hasPhone && !hasEmail) {
    errors.phone = "Indica al menos un teléfono o un email de contacto.";
  }

  if (!data.city.trim()) {
    errors.city = "Indica la ciudad de la obra.";
  }

  if (!data.serviceType) {
    errors.serviceType = "Elige el tipo de proyecto.";
  }

  if (data.description.trim().length < 20) {
    errors.description = "Cuéntanos brevemente la obra (al menos un par de frases).";
  }

  return errors;
}

/** Construye el payload normalizado para ConstructionOS. */
export function buildConstructionOSPayload(data: LeadFormData): ConstructionOSLeadPayload {
  const service = (data.serviceType || "otro") as ServiceType;
  const serviceLabel = SERVICE_LABELS[service];
  const city = data.city.trim() || "Sin especificar";
  const title = `${serviceLabel} — ${city}`;

  return {
    companySlug: CONSTRUCTIONOS_CONFIG.companySlug,
    source: "diego_public_landing",
    title,
    contactName: data.contactName.trim(),
    email: data.email.trim() ? data.email.trim() : null,
    phone: data.phone.trim() ? data.phone.trim() : null,
    city,
    province: data.province.trim() ? data.province.trim() : null,
    serviceType: service,
    budgetRange: data.budgetRange,
    desiredTimeline: data.desiredTimeline,
    projectStatus: data.projectStatus,
    description: data.description.trim(),
    metadata: {
      landingVersion: "v1",
      submittedFrom: "diego-obras-reformas-landing",
    },
  };
}

/**
 * Envía (o prepara) un lead para ConstructionOS.
 * Hoy no hace fetch real: devuelve un estado "prepared" y la UI redirige
 * al formulario oficial del SaaS. Cuando exista endpoint público bastará
 * con implementar el fetch aquí sin tocar la UI.
 */
export async function submitConstructionOSLead(data: LeadFormData): Promise<SubmitResult> {
  const errors = validateLeadForm(data);
  if (Object.keys(errors).length > 0) {
    return { status: "error", errors };
  }

  const payload = buildConstructionOSPayload(data);

  if (CONSTRUCTIONOS_CONFIG.integrationMode === "api" && CONSTRUCTIONOS_CONFIG.futureApiEndpoint) {
    // Reservado para la integración futura. No implementado ahora
    // para no simular éxito de un envío que no ocurre.
    return { status: "prepared", payload, intakeUrl: CONSTRUCTIONOS_CONFIG.intakeUrl };
  }

  return {
    status: "prepared",
    payload,
    intakeUrl: CONSTRUCTIONOS_CONFIG.intakeUrl,
  };
}

export const SERVICE_OPTIONS: { value: ServiceType; label: string }[] = [
  { value: "reforma_integral", label: "Reforma integral" },
  { value: "local_negocio", label: "Local o negocio" },
  { value: "piscina_exterior", label: "Piscina y exteriores" },
  { value: "fachada", label: "Fachada" },
  { value: "bano_completo", label: "Baño completo" },
  { value: "alojamiento_turistico", label: "Alojamiento turístico" },
  { value: "otro", label: "Otro" },
];

export const BUDGET_OPTIONS: { value: BudgetRange; label: string }[] = [
  { value: "unknown", label: "Aún no lo sé" },
  { value: "less_15k", label: "Menos de 15.000 €" },
  { value: "15k_50k", label: "15.000 € – 50.000 €" },
  { value: "50k_150k", label: "50.000 € – 150.000 €" },
  { value: "more_150k", label: "Más de 150.000 €" },
];

export const TIMELINE_OPTIONS: { value: DesiredTimeline; label: string }[] = [
  { value: "unknown", label: "Aún por definir" },
  { value: "asap", label: "Lo antes posible" },
  { value: "1_3_months", label: "En 1–3 meses" },
  { value: "3_6_months", label: "En 3–6 meses" },
  { value: "more_6_months", label: "Más de 6 meses" },
];

export const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "idea_inicial", label: "Idea inicial" },
  { value: "quiero_visita", label: "Quiero una visita" },
  { value: "comparando_presupuestos", label: "Comparando presupuestos" },
  { value: "listo_para_empezar", label: "Listo para empezar" },
  { value: "obra_en_marcha", label: "Obra ya en marcha" },
];
