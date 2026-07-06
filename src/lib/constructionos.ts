/**
 * ConstructionOS integration adapter.
 *
 * Prepares Diego Obras y Reformas leads for the ConstructionOS SaaS.
 * When the public API URL is configured, the landing submits directly.
 * When it is empty, the UI keeps the guided intake URL as fallback.
 */

const DEFAULT_INTAKE_URL =
  "https://constructionos-constructionos.vercel.app/intake/diego-obras-reformas";

const envIntakeUrl = import.meta.env.VITE_CONSTRUCTIONOS_INTAKE_URL;
const envApiUrl = import.meta.env.VITE_CONSTRUCTIONOS_API_URL;

export const CONSTRUCTIONOS_CONFIG = {
  companySlug: "diego-obras-reformas",
  intakeUrl: envIntakeUrl || DEFAULT_INTAKE_URL,
  futureApiEndpoint: envApiUrl || "",
  integrationMode: envApiUrl ? "api" : "redirect",
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
  honeypot: string;
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
  honeypot: string;
}

export type SubmitResult =
  | { status: "prepared"; payload: ConstructionOSLeadPayload; intakeUrl: string }
  | { status: "sent"; payload: ConstructionOSLeadPayload; leadId: string; message: string }
  | { status: "error"; errors: Partial<Record<keyof LeadFormData | "form", string>> };

const GENERIC_API_ERROR =
  "No hemos podido enviar la solicitud automaticamente. Puedes continuar desde el formulario guiado o escribir por WhatsApp.";

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

  if (data.honeypot.trim()) {
    errors.form = "No hemos podido enviar la solicitud automaticamente.";
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
      submittedFrom: "diego-obras-reformas-web",
    },
    honeypot: data.honeypot.trim(),
  };
}

/**
 * Sends a lead to ConstructionOS when the public API URL is configured.
 * If the URL is empty, it returns "prepared" so the UI can use the guided intake.
 */
export async function submitConstructionOSLead(data: LeadFormData): Promise<SubmitResult> {
  const errors = validateLeadForm(data);
  if (Object.keys(errors).length > 0) {
    return { status: "error", errors };
  }

  const payload = buildConstructionOSPayload(data);

  if (CONSTRUCTIONOS_CONFIG.futureApiEndpoint) {
    try {
      const response = await fetch(CONSTRUCTIONOS_CONFIG.futureApiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "omit",
        body: JSON.stringify(payload),
      });

      const result = (await response.json().catch(() => null)) as {
        ok?: boolean;
        leadId?: string;
        message?: string;
        error?: string;
      } | null;

      if (response.status === 201 && result?.ok && result.leadId) {
        return {
          status: "sent",
          payload,
          leadId: result.leadId,
          message: result.message || "Solicitud recibida correctamente.",
        };
      }

      return {
        status: "error",
        errors: {
          form: GENERIC_API_ERROR,
        },
      };
    } catch {
      return {
        status: "error",
        errors: {
          form: GENERIC_API_ERROR,
        },
      };
    }
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
