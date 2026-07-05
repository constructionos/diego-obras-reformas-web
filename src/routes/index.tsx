import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BUDGET_OPTIONS,
  CONSTRUCTIONOS_CONFIG,
  SERVICE_OPTIONS,
  TIMELINE_OPTIONS,
  submitConstructionOSLead,
  type LeadFormData,
} from "@/lib/constructionos";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export const Route = createFileRoute("/")({
  head: () => ({
    links: [{ rel: "canonical", href: "/" }],
    meta: [{ property: "og:url", content: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "GeneralContractor",
          name: "Diego Obras y Reformas",
          areaServed: ["Madrid", "Ávila", "Toledo"],
          description:
            "Reformas integrales, locales, exteriores, fachadas y obras completas con proceso claro y presupuesto con criterio.",
        }),
      },
    ],
  }),
  component: LandingPage,
});

// Fallback defensivo por si la constante de integración quedase vacía.
const INTAKE_URL = CONSTRUCTIONOS_CONFIG.intakeUrl;
const WHATSAPP_URL = buildWhatsAppUrl();
const WHATSAPP_ARIA_LABEL = "Hablar por WhatsApp sobre una obra o reforma";

/* -------------------------------------------------------------------------- */
/*  Primitives                                                                */
/* -------------------------------------------------------------------------- */

function SectionLabel({
  index,
  children,
  tone = "light",
}: {
  index: string;
  children: string;
  tone?: "light" | "dark";
}) {
  return (
    <div className={`flex items-center gap-3 tick-label ${tone === "dark" ? "text-bone/60" : ""}`}>
      <span>{index}</span>
      <span className={`h-px w-8 ${tone === "dark" ? "bg-bone/30" : "bg-ink/30"}`} />
      <span>{children}</span>
    </div>
  );
}

function PrimaryCTA({
  children,
  size = "md",
  tone = "dark",
  ariaLabel,
  href = "#solicitud",
}: {
  children: string;
  size?: "md" | "lg";
  tone?: "dark" | "light";
  ariaLabel?: string;
  href?: string;
}) {
  const base =
    "group inline-flex items-center justify-center gap-3 min-h-11 transition-all duration-300 focus-visible:outline-none";
  const sizes = {
    md: "px-6 py-4 text-sm",
    lg: "px-7 py-4 text-[15px] sm:px-8 sm:py-5",
  } as const;
  const tones = {
    dark: "bg-ink text-bone hover:bg-olive shadow-[6px_6px_0_0_rgba(30,30,28,0.12)] hover:shadow-[10px_10px_0_0_rgba(63,74,54,0.25)]",
    light:
      "bg-bone text-ink hover:bg-sand shadow-[6px_6px_0_0_rgba(244,240,232,0.12)] hover:shadow-[10px_10px_0_0_rgba(216,195,165,0.35)]",
  } as const;
  return (
    <a
      href={href}
      aria-label={ariaLabel ?? children}
      className={`${base} ${sizes[size]} ${tones[tone]}`}
    >
      <span className="font-medium tracking-wide">{children}</span>
      <span
        aria-hidden
        className={`h-px w-8 transition-all duration-300 group-hover:w-14 ${
          tone === "dark" ? "bg-bone" : "bg-ink"
        }`}
      />
    </a>
  );
}

function GhostLink({
  href,
  children,
  tone = "light",
}: {
  href: string;
  children: string;
  tone?: "light" | "dark";
}) {
  return (
    <a
      href={href}
      className={`group inline-flex items-center gap-3 text-sm font-medium ${
        tone === "dark" ? "text-bone" : "text-ink"
      }`}
    >
      <span
        className={`border-b pb-1 transition ${
          tone === "dark"
            ? "border-bone/30 group-hover:border-bone"
            : "border-ink/30 group-hover:border-ink"
        }`}
      >
        {children}
      </span>
      <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
        →
      </span>
    </a>
  );
}

function WhatsAppCTA({
  className = "",
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  if (!WHATSAPP_URL) return null;

  const toneClasses =
    tone === "dark"
      ? "border-bone/25 text-bone hover:border-bone hover:bg-bone/10"
      : "border-ink/20 text-ink hover:border-ink hover:bg-ink/5";

  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={WHATSAPP_ARIA_LABEL}
      className={`inline-flex min-h-11 items-center justify-center border px-5 py-3 text-sm font-medium tracking-wide transition ${toneClasses} ${className}`}
    >
      Hablar por WhatsApp
    </a>
  );
}

/* -------------------------------------------------------------------------- */
/*  Nav                                                                       */
/* -------------------------------------------------------------------------- */

const NAV_ITEMS: Array<[string, string]> = [
  ["Servicios", "#servicios"],
  ["Proceso", "#proceso"],
  ["Zonas", "#zonas"],
  ["Contacto", "#contacto"],
];

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b hairline bg-background/90 backdrop-blur-md shadow-[0_1px_0_0_rgba(30,30,28,0.04)]"
            : "border-b border-transparent bg-background/60 backdrop-blur"
        }`}
      >
        <div className="mx-auto grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3 md:py-4 lg:max-w-[1360px] lg:px-10">
          <a
            href="#top"
            onClick={() => setOpen(false)}
            className="flex min-w-0 items-center gap-3"
            aria-label="Diego Obras y Reformas — ir al inicio"
          >
            <BrandMark />
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="font-display truncate text-[14px] sm:text-[15px]">
                Diego <span className="text-stone">·</span> Obras y Reformas
              </span>
              <span className="tick-label -mt-0.5 hidden truncate sm:block">
                Estudio de obra · MAD / AVL / TOL
              </span>
            </div>
          </a>

          <div className="flex items-center gap-4 md:gap-6">
            <nav aria-label="Navegación principal" className="hidden items-center gap-8 md:flex">
              {NAV_ITEMS.map(([label, href]) => (
                <a
                  key={href}
                  href={href}
                  className="text-sm text-ink/70 transition-colors duration-200 hover:text-ink"
                >
                  {label}
                </a>
              ))}
            </nav>
            <a
              href="#solicitud"
              className="hidden bg-ink px-4 py-2.5 text-xs font-medium tracking-wide text-bone transition-colors duration-200 hover:bg-olive md:inline-block"
            >
              Solicitar presupuesto
            </a>
            <WhatsAppCTA className="hidden px-4 py-2.5 text-xs md:inline-flex" />
            <button
              type="button"
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen((v) => !v)}
              className="relative z-[60] flex h-11 w-11 shrink-0 items-center justify-center border hairline transition-colors duration-200 hover:bg-ink hover:text-bone md:hidden"
            >
              <span className="sr-only">Menú</span>
              <span aria-hidden className="relative block h-3 w-5">
                <span
                  className={`absolute left-0 top-0 h-px w-5 bg-current transition-transform duration-300 ${
                    open ? "translate-y-[6px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`absolute left-0 top-[6px] h-px w-5 bg-current transition-opacity duration-200 ${
                    open ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`absolute left-0 top-[12px] h-px w-5 bg-current transition-transform duration-300 ${
                    open ? "-translate-y-[6px] -rotate-45" : ""
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile panel — fuera del header para evitar containing block de backdrop-filter */}
      <div
        id="mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        className={`md:hidden fixed inset-0 z-40 flex flex-col bg-ink text-bone transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="h-[64px] shrink-0 border-b border-bone/10" />
        <div className="flex flex-1 flex-col justify-between overflow-y-auto px-6 pb-10 pt-6">
          <nav aria-label="Menú móvil" className="flex flex-col">
            {NAV_ITEMS.map(([label, href], i) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`group flex items-baseline justify-between border-b border-bone/15 py-5 transition-colors duration-200 hover:text-sand ${
                  open ? "animate-fade-in" : ""
                }`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span className="font-display text-[28px] leading-none">{label}</span>
                <span className="tick-label text-bone/50">0{i + 1}</span>
              </a>
            ))}
          </nav>

          <div className="mt-10 space-y-4">
            <a
              href="#solicitud"
              onClick={() => setOpen(false)}
              className="group flex min-h-12 items-center justify-between bg-bone px-6 py-4 text-ink transition-colors duration-200 hover:bg-sand"
            >
              <span className="text-sm font-medium tracking-wide">Solicitar presupuesto</span>
              <span
                aria-hidden
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </a>
            {WHATSAPP_URL ? (
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={WHATSAPP_ARIA_LABEL}
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center justify-between border border-bone/20 px-6 py-4 text-bone transition-colors duration-200 hover:bg-bone/10"
              >
                <span className="text-sm font-medium tracking-wide">Hablar por WhatsApp</span>
                <span
                  aria-hidden
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </a>
            ) : null}
            <p className="tick-label text-bone/50">Madrid · Ávila · Toledo</p>
          </div>
        </div>
      </div>
    </>
  );
}

function BrandMark() {
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center bg-ink">
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        <rect x="3" y="4" width="8" height="2" fill="#F4F0E8" />
        <rect x="3" y="9" width="8" height="2" fill="#F4F0E8" />
        <rect x="3" y="14" width="8" height="2" fill="#F4F0E8" />
        <rect x="3" y="19" width="12" height="2" fill="#F4F0E8" />
        <rect x="14" y="4" width="2" height="12" fill="#B66A4B" />
        <rect x="19" y="4" width="2" height="17" fill="#F4F0E8" />
      </svg>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Hero                                                                      */
/* -------------------------------------------------------------------------- */

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden border-b hairline bg-background">
      <div className="pointer-events-none absolute inset-0 blueprint-grid opacity-60" />
      <div className="pointer-events-none absolute -left-40 top-1/3 hidden h-[520px] w-[520px] rounded-full bg-sand/25 blur-3xl sm:block" />
      <div className="pointer-events-none absolute -right-40 -top-24 hidden h-[520px] w-[520px] rounded-full bg-olive/15 blur-3xl sm:block" />

      {/* Top tick bar */}
      <div className="relative border-b hairline">
        <div className="mx-auto flex max-w-[1360px] items-center justify-between px-5 py-3 tick-label lg:px-10">
          <span>Estudio de obra activo · 2026</span>
          <span className="hidden sm:inline">
            MAD · 40.41° N &nbsp;/&nbsp; AVL · 40.65° N &nbsp;/&nbsp; TOL · 39.86° N
          </span>
          <span className="sm:hidden">MAD / AVL / TOL</span>
        </div>
      </div>

      <div className="relative mx-auto grid max-w-[1360px] grid-cols-1 gap-10 px-5 pb-20 pt-10 sm:pt-14 lg:grid-cols-12 lg:gap-10 lg:px-10 lg:pb-36 lg:pt-24">
        {/* Left column */}
        <div className="lg:col-span-7">
          <SectionLabel index="01">Reformas y obras · Método propio</SectionLabel>

          <h1 className="font-display mt-6 text-[40px] leading-[1] text-ink sm:mt-8 sm:text-[64px] lg:text-[104px]">
            Obras y reformas
            <span className="mt-1 block sm:mt-2">
              <span className="italic text-olive">sin</span>{" "}
              <span className="relative inline-block">
                improvisación
                <span
                  aria-hidden
                  className="absolute inset-x-0 -bottom-1.5 h-[5px] bg-terracotta/85 sm:-bottom-2 sm:h-[6px]"
                />
              </span>
              <span className="text-stone">.</span>
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-relaxed text-ink/80 sm:mt-10 sm:text-lg lg:text-xl">
            Reformas integrales, locales, exteriores y obras completas en Madrid, Ávila y Toledo —
            con un proceso claro desde la primera conversación hasta la entrega.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4 sm:mt-10 sm:gap-6">
            <PrimaryCTA size="lg">Solicitar presupuesto</PrimaryCTA>
            <WhatsAppCTA />
            <GhostLink href="#proceso">Ver proceso</GhostLink>
          </div>

          <div className="mt-10 max-w-2xl border-l-2 border-terracotta pl-5 sm:mt-14 sm:pl-6">
            <p className="font-display text-base leading-snug text-ink sm:text-lg lg:text-xl">
              No buscamos hacer cualquier obra. Buscamos hacer bien{" "}
              <span className="italic text-olive">las obras que tienen sentido.</span>
            </p>
          </div>

          <dl className="mt-10 grid max-w-2xl grid-cols-2 gap-5 border-t hairline pt-8 sm:mt-14 sm:grid-cols-4 sm:gap-6">
            {[
              ["Alcance", "Integrales"],
              ["Foco", "Locales / obra"],
              ["Zonas", "MAD · AVL · TOL"],
              ["Método", "Con criterio"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="tick-label">{k}</dt>
                <dd className="mt-2 text-sm leading-snug text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Right column - composition */}
        <div className="relative lg:col-span-5">
          <HeroComposition />
        </div>
      </div>
    </section>
  );
}

function HeroComposition() {
  return (
    <div className="relative mx-auto w-full max-w-[520px] lg:max-w-none">
      {/* Dark side panel */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-ink text-bone shadow-[16px_16px_0_0_rgba(30,30,28,0.12)]">
        {/* Grid */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.09]">
          <div className="h-full w-full bg-[linear-gradient(to_right,#F4F0E8_1px,transparent_1px),linear-gradient(to_bottom,#F4F0E8_1px,transparent_1px)] bg-[size:24px_24px]" />
        </div>

        {/* Top tick */}
        <div className="absolute inset-x-6 top-5 flex items-end justify-between">
          {Array.from({ length: 13 }).map((_, i) => (
            <span key={i} className={`block w-px bg-bone/40 ${i % 2 === 0 ? "h-3" : "h-1.5"}`} />
          ))}
        </div>

        {/* Header labels */}
        <div className="absolute inset-x-6 top-12 flex items-center justify-between tick-label text-bone/60">
          <span>Sistema de obra</span>
          <span>v01 · MAD</span>
        </div>

        {/* Material blocks */}
        <div className="absolute left-[8%] top-[26%] h-16 w-24 bg-sand/85" />
        <div className="absolute left-[42%] top-[22%] h-24 w-20 bg-olive" />
        <div className="absolute left-[68%] top-[30%] h-14 w-16 bg-terracotta" />

        {/* Measurement */}
        <div className="absolute inset-x-6 top-[52%] flex items-center gap-2">
          <span className="h-2 w-px bg-bone/60" />
          <span className="h-px flex-1 bg-bone/30" />
          <span className="tick-label text-bone/70">6.420 mm</span>
          <span className="h-px flex-1 bg-bone/30" />
          <span className="h-2 w-px bg-bone/60" />
        </div>

        {/* Process ticker */}
        <div className="absolute inset-x-6 bottom-32 space-y-2">
          {[
            ["Solicitud", "entrante"],
            ["Visita", "programada"],
            ["Presupuesto", "en preparación"],
            ["Ejecución", "planificada"],
          ].map(([a, b], i) => (
            <div key={a} className="flex items-center gap-3 border-b border-bone/10 pb-2">
              <span className="font-mono text-[10px] text-bone/40">0{i + 1}</span>
              <span className="text-[11px] uppercase tracking-wider text-bone">{a}</span>
              <span className="ml-auto text-[11px] text-bone/50">{b}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Floating card */}
      <div className="absolute -bottom-8 -left-4 w-[280px] border border-ink bg-bone p-5 shadow-[10px_10px_0_0_#1E1E1C] sm:-left-10 sm:w-[320px]">
        <div className="flex items-center justify-between border-b border-ink/15 pb-3">
          <span className="tick-label">Nueva oportunidad</span>
          <span className="h-2 w-2 rounded-full bg-terracotta" />
        </div>
        <p className="font-display mt-4 text-xl leading-tight text-ink">Reforma integral</p>
        <dl className="mt-4 space-y-2 text-[12px]">
          <div className="flex justify-between">
            <dt className="text-stone">Zona</dt>
            <dd className="text-ink">Ávila</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-stone">Superficie</dt>
            <dd className="text-ink">142 m²</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-stone">Siguiente paso</dt>
            <dd className="text-olive">Visita técnica</dd>
          </div>
        </dl>
        <div className="mt-5 flex items-center gap-2 border-t border-ink/10 pt-3">
          <span className="h-px flex-1 bg-ink/20" />
          <span className="tick-label">ordenar antes de ejecutar</span>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Tension / Positioning (dark)                                              */
/* -------------------------------------------------------------------------- */

function Tension() {
  const principles = [
    ["01", "Entender antes de presupuestar", "Alcance real, no cifras al aire."],
    ["02", "Medir antes de prometer", "Visita, medidas y condicionantes."],
    ["03", "Planificar antes de ejecutar", "Orden, decisiones y calendario."],
  ];
  return (
    <section className="relative overflow-hidden bg-ink text-bone">
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
        <div className="h-full w-full bg-[linear-gradient(to_right,#F4F0E8_1px,transparent_1px),linear-gradient(to_bottom,#F4F0E8_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>
      <div className="pointer-events-none absolute -right-40 top-1/2 hidden h-[520px] w-[520px] -translate-y-1/2 rounded-full bg-terracotta/20 blur-3xl sm:block" />

      <div className="relative mx-auto max-w-[1360px] px-5 py-24 lg:px-10 lg:py-36">
        <SectionLabel index="02" tone="dark">
          Tensión
        </SectionLabel>

        <h2 className="font-display mt-8 max-w-4xl text-4xl leading-[1.05] text-bone sm:text-5xl lg:text-[76px]">
          El problema no es reformar.
          <span className="block text-bone/50">
            Es reformar <span className="italic text-sand">sin orden</span>.
          </span>
        </h2>

        <p className="mt-10 max-w-2xl text-lg leading-relaxed text-bone/75">
          Una obra puede torcerse antes de empezar: alcance poco claro, presupuestos rápidos,
          decisiones pendientes, materiales sin definir o comunicación dispersa. Por eso trabajamos
          con un método propio desde el primer contacto.
        </p>

        <div className="mt-16 grid grid-cols-1 gap-px bg-bone/10 md:grid-cols-3">
          {principles.map(([n, title, desc]) => (
            <div
              key={n}
              className="group relative bg-ink p-8 transition hover:bg-[#242320] lg:p-10"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-display text-6xl text-bone/15 transition group-hover:text-terracotta/70 lg:text-7xl">
                  {n}
                </span>
                <span className="h-px w-8 bg-bone/30 transition-all group-hover:w-14 group-hover:bg-sand" />
              </div>
              <h3 className="font-display mt-8 text-2xl leading-tight text-bone">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-bone/60">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Services                                                                  */
/* -------------------------------------------------------------------------- */

const SERVICES = [
  {
    n: "01",
    title: "Reformas integrales",
    desc: "Viviendas completas, redistribuciones, acabados y coordinación de oficios.",
    featured: true,
  },
  {
    n: "02",
    title: "Locales y negocios",
    desc: "Reformas para actividad comercial, mejora de espacios y adaptación funcional.",
  },
  {
    n: "03",
    title: "Piscinas y exteriores",
    desc: "Espacios exteriores, zonas de uso, acabados y obra alrededor de vivienda.",
  },
  {
    n: "04",
    title: "Fachadas",
    desc: "Mejora, reparación y actualización exterior.",
  },
  {
    n: "05",
    title: "Baños completos",
    desc: "Baños planteados como reforma completa, no arreglos pequeños aislados.",
  },
  {
    n: "06",
    title: "Alojamientos y bungalows",
    desc: "Espacios para uso intensivo, estética cuidada y mantenimiento razonable.",
  },
];

function Services() {
  return (
    <section id="servicios" className="relative border-b hairline bg-background">
      <div className="mx-auto max-w-[1360px] px-5 py-24 lg:px-10 lg:py-36">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <SectionLabel index="03">Servicios</SectionLabel>
            <h2 className="font-display mt-6 text-4xl leading-[1.05] text-ink sm:text-5xl lg:text-[64px]">
              Trabajos donde podemos <span className="italic text-olive">aportar valor</span>.
            </h2>
          </div>
          <p className="max-w-sm text-base text-ink/70 lg:col-span-4">
            No cubrimos todo. Nos centramos en obras donde el resultado depende de planteamiento,
            coordinación y ejecución cuidada.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-6 md:gap-5">
          {SERVICES.map((s) => (
            <ServiceCard key={s.n} service={s} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ service }: { service: (typeof SERVICES)[number] }) {
  const featured = service.featured;
  return (
    <a
      href="#solicitud"
      className={`group relative flex flex-col justify-between overflow-hidden border p-7 transition-all duration-500 lg:p-9 ${
        featured
          ? "md:col-span-6 lg:col-span-3 lg:row-span-2 border-ink bg-ink text-bone hover:bg-[#242320]"
          : "md:col-span-3 lg:col-span-3 hairline bg-card text-ink hover:-translate-y-1 hover:border-ink hover:shadow-[10px_10px_0_0_rgba(30,30,28,0.08)]"
      }`}
    >
      <div className="flex items-start justify-between">
        <span
          className={`font-display text-5xl lg:text-6xl ${
            featured ? "text-bone/20" : "text-ink/15"
          } transition group-hover:text-terracotta/80`}
        >
          {service.n}
        </span>
        <span
          className={`text-xl transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1 ${
            featured ? "text-bone/60" : "text-ink/40"
          }`}
          aria-hidden
        >
          ↗
        </span>
      </div>

      <div className={featured ? "mt-16 lg:mt-40" : "mt-10"}>
        <h3
          className={`font-display leading-tight ${
            featured ? "text-3xl text-bone lg:text-[40px]" : "text-2xl text-ink"
          }`}
        >
          {service.title}
        </h3>
        <p
          className={`mt-4 text-sm leading-relaxed ${
            featured ? "text-bone/70 lg:text-[15px]" : "text-ink/70"
          }`}
        >
          {service.desc}
        </p>
        {featured && (
          <div className="mt-8 flex items-center gap-3 border-t border-bone/15 pt-5">
            <span className="tick-label text-bone/60">Servicio destacado</span>
            <span className="ml-auto h-px w-10 bg-bone/40 transition-all group-hover:w-16 group-hover:bg-sand" />
          </div>
        )}
      </div>
    </a>
  );
}

/* -------------------------------------------------------------------------- */
/*  Fit / Filtro comercial                                                    */
/* -------------------------------------------------------------------------- */

function Fit() {
  const yes = [
    "Quieres reformar una vivienda o espacio completo",
    "Tienes un local o negocio que necesita obra seria",
    "Buscas ordenar una idea antes de pedir presupuesto",
    "Valoras claridad, seguimiento y ejecución profesional",
  ];
  const no = [
    "Buscas solo el precio más barato",
    "Es un arreglo pequeño y urgente",
    "No hay una decisión clara todavía",
    "Quieres empezar sin visita, medición ni planificación",
  ];

  return (
    <section className="relative overflow-hidden bg-[#141311] text-bone">
      <div className="pointer-events-none absolute inset-0 opacity-[0.05]">
        <div className="h-full w-full bg-[linear-gradient(to_right,#F4F0E8_1px,transparent_1px),linear-gradient(to_bottom,#F4F0E8_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <div className="relative mx-auto max-w-[1360px] px-5 py-24 lg:px-10 lg:py-36">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <SectionLabel index="04" tone="dark">
              Encaje
            </SectionLabel>
            <h2 className="font-display mt-6 text-4xl leading-[1.05] text-bone sm:text-5xl lg:text-[64px]">
              Para proyectos que necesitan algo más que{" "}
              <span className="italic text-terracotta">un precio rápido</span>.
            </h2>
          </div>
          <p className="max-w-sm text-base text-bone/70 lg:col-span-4">
            Trabajamos mejor cuando hay una necesidad clara, una decisión real y margen para
            plantear la obra con criterio.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          <FitCard variant="yes" items={yes} />
          <FitCard variant="no" items={no} />
        </div>
      </div>
    </section>
  );
}

function FitCard({ variant, items }: { variant: "yes" | "no"; items: string[] }) {
  const isYes = variant === "yes";
  return (
    <div
      className={`group relative overflow-hidden p-8 transition-all duration-500 lg:p-12 ${
        isYes
          ? "bg-bone text-ink hover:shadow-[16px_16px_0_0_rgba(216,195,165,0.15)]"
          : "border border-bone/15 bg-transparent text-bone hover:border-bone/40"
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest ${
            isYes ? "bg-olive text-bone" : "border border-bone/30 text-bone/70"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${isYes ? "bg-bone" : "bg-terracotta"}`} />
          {isYes ? "Encaja" : "No encaja"}
        </span>
        <span className={`font-mono text-xs ${isYes ? "text-stone" : "text-bone/50"}`}>
          {items.length.toString().padStart(2, "0")} · criterios
        </span>
      </div>

      <h3
        className={`font-display mt-8 text-3xl leading-tight lg:text-[40px] ${
          isYes ? "text-ink" : "text-bone"
        }`}
      >
        {isYes ? "Encaja bien si…" : "Probablemente no encaja si…"}
      </h3>

      <ul className="mt-10 space-y-5">
        {items.map((it, i) => (
          <li key={it} className="flex items-start gap-5">
            <span className={`font-mono text-xs pt-1 ${isYes ? "text-stone" : "text-bone/40"}`}>
              0{i + 1}
            </span>
            <span
              className={`h-px w-6 shrink-0 translate-y-3 ${isYes ? "bg-ink/30" : "bg-bone/25"}`}
            />
            <span
              className={`text-[15px] leading-relaxed ${isYes ? "text-ink/85" : "text-bone/85"}`}
            >
              {it}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Proceso                                                                   */
/* -------------------------------------------------------------------------- */

const STEPS = [
  {
    n: "01",
    title: "Primera conversación",
    desc: "Entendemos qué quieres hacer, dónde está la obra y en qué momento estás.",
    tag: "Contacto",
  },
  {
    n: "02",
    title: "Visita y toma de medidas",
    desc: "Revisamos el espacio, estado actual, detalles y posibles condicionantes.",
    tag: "In situ",
  },
  {
    n: "03",
    title: "Presupuesto con criterio",
    desc: "Se prepara una propuesta realista, no un número lanzado por WhatsApp.",
    tag: "Propuesta",
  },
  {
    n: "04",
    title: "Ajustes y planificación",
    desc: "Revisamos alcance, prioridades, fechas, materiales y decisiones pendientes.",
    tag: "Plan",
  },
  {
    n: "05",
    title: "Ejecución de la obra",
    desc: "Coordinación, seguimiento y comunicación durante el trabajo.",
    tag: "Obra",
  },
  {
    n: "06",
    title: "Entrega y cierre",
    desc: "Remates, revisión final y cierre ordenado.",
    tag: "Cierre",
  },
];

function Process() {
  return (
    <section id="proceso" className="relative overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 blueprint-grid-fine opacity-70" />

      <div className="relative mx-auto max-w-[1360px] px-5 py-24 lg:px-10 lg:py-36">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <SectionLabel index="05">Proceso</SectionLabel>
            <h2 className="font-display mt-6 text-4xl leading-[1.05] text-ink sm:text-5xl lg:text-[64px]">
              Un proceso claro desde el <span className="italic text-olive">primer contacto</span>.
            </h2>
            <p className="mt-8 max-w-xl text-lg text-ink/75">
              La obra empieza antes de entrar con herramientas. Empieza cuando se ordena bien la
              información.
            </p>
          </div>
          <div className="lg:col-span-4">
            <div className="border-l-2 border-ink pl-5">
              <p className="tick-label">Duración típica</p>
              <p className="mt-2 text-sm text-ink/75">
                De la primera conversación al presupuesto: entre 1 y 3 semanas según alcance y
                disponibilidad de visita.
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <ol className="relative mt-20">
          {/* vertical line */}
          <div
            aria-hidden
            className="absolute left-[27px] top-4 bottom-4 w-px bg-ink/15 md:left-1/2"
          />

          {STEPS.map((s, i) => {
            const right = i % 2 === 1;
            return (
              <li
                key={s.n}
                className="relative grid grid-cols-[56px_1fr] gap-6 pb-14 md:grid-cols-2 md:gap-12"
              >
                {/* Dot + number */}
                <div
                  className={`relative flex flex-col items-center md:items-end ${
                    right ? "md:order-2 md:items-start" : ""
                  }`}
                >
                  <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center bg-ink text-bone shadow-[4px_4px_0_0_rgba(30,30,28,0.15)] md:absolute md:left-1/2 md:top-2 md:-translate-x-1/2">
                    <span className="font-display text-xl">{s.n}</span>
                  </div>
                </div>

                {/* Card */}
                <div
                  className={`group ${right ? "md:order-1 md:pr-16 md:text-right" : "md:pl-16"}`}
                >
                  <div
                    className={`relative border hairline bg-card p-6 transition hover:-translate-y-0.5 hover:border-ink hover:shadow-[10px_10px_0_0_rgba(30,30,28,0.06)] lg:p-8 ${
                      right ? "md:ml-auto" : ""
                    }`}
                  >
                    <div
                      className={`flex items-center justify-between ${
                        right ? "md:flex-row-reverse" : ""
                      }`}
                    >
                      <span className="tick-label">{s.tag}</span>
                      <span className="font-mono text-[10px] text-stone">Etapa {s.n}</span>
                    </div>
                    <h3 className="font-display mt-4 text-2xl leading-tight text-ink lg:text-[28px]">
                      {s.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-ink/70">{s.desc}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Zonas                                                                     */
/* -------------------------------------------------------------------------- */

function Zones() {
  const zones = [
    {
      name: "Madrid y alrededores",
      code: "MAD",
      coord: "40.4168° N · 3.7038° O",
      note: "Ciudad y municipios de la comunidad.",
    },
    {
      name: "Ávila",
      code: "AVL",
      coord: "40.6566° N · 4.6812° O",
      note: "Provincia y núcleos rurales.",
    },
    {
      name: "Toledo",
      code: "TOL",
      coord: "39.8628° N · 4.0273° O",
      note: "Ciudad y comarcas cercanas.",
    },
  ];
  return (
    <section id="zonas" className="border-y hairline bg-card">
      <div className="mx-auto max-w-[1360px] px-5 py-24 lg:px-10 lg:py-32">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <SectionLabel index="06">Zonas de trabajo</SectionLabel>
            <h2 className="font-display mt-6 text-4xl leading-[1.05] text-ink sm:text-5xl lg:text-[56px]">
              Madrid, Ávila y Toledo.
            </h2>
          </div>
          <p className="max-w-sm text-base text-ink/70 lg:col-span-4">
            Trabajamos principalmente en Madrid y alrededores, Ávila y Toledo. Para zonas
            fronterizas consultamos caso a caso.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {zones.map((z) => (
            <article
              key={z.code}
              className="group relative overflow-hidden border hairline bg-bone p-8 transition hover:-translate-y-1 hover:border-ink hover:shadow-[10px_10px_0_0_rgba(30,30,28,0.08)] lg:p-10"
            >
              <div className="flex items-start justify-between">
                <span className="font-display text-6xl text-ink/10 transition group-hover:text-olive/70 lg:text-7xl">
                  {z.code}
                </span>
                <span className="h-8 w-8 border hairline transition group-hover:bg-terracotta group-hover:border-terracotta" />
              </div>
              <h3 className="font-display mt-14 text-2xl text-ink lg:text-[28px]">{z.name}</h3>
              <p className="mt-2 text-sm text-ink/70">{z.note}</p>
              <p className="tick-label mt-6 border-t hairline pt-4">{z.coord}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Lead form                                                                 */
/* -------------------------------------------------------------------------- */

type LeadFormStatus = "idle" | "submitting" | "success" | "error" | "fallback";

const INITIAL_LEAD_FORM: LeadFormData = {
  contactName: "",
  phone: "",
  email: "",
  serviceType: "",
  city: "",
  province: "",
  budgetRange: "unknown",
  desiredTimeline: "unknown",
  projectStatus: "quiero_visita",
  description: "",
  honeypot: "",
};

function LeadSubmitForm() {
  const [form, setForm] = useState<LeadFormData>(INITIAL_LEAD_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof LeadFormData | "form", string>>>({});
  const [status, setStatus] = useState<LeadFormStatus>("idle");

  const updateField = (field: keyof LeadFormData, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
    if (status !== "idle") setStatus("idle");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    setErrors({});

    const result = await submitConstructionOSLead(form);

    if (result.status === "sent") {
      setStatus("success");
      setForm(INITIAL_LEAD_FORM);
      return;
    }

    if (result.status === "prepared") {
      setStatus("fallback");
      return;
    }

    setErrors(result.errors);
    setStatus("error");
  };

  const isSubmitting = status === "submitting";
  const showFallback = status === "error" || status === "fallback";

  return (
    <form
      id="solicitud"
      onSubmit={handleSubmit}
      className="border border-bone/15 bg-bone p-6 text-ink shadow-[12px_12px_0_0_rgba(244,240,232,0.08)] sm:p-8"
    >
      <div className="flex items-center justify-between border-b border-ink/15 pb-4">
        <span className="tick-label">Solicitud directa</span>
        <span className="tick-label text-stone">ConstructionOS</span>
      </div>

      <h3 className="font-display mt-6 text-3xl leading-tight text-ink">
        Cuéntanos lo básico de la obra.
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-ink/70">
        Enviaremos la solicitud a ConstructionOS para ordenar el seguimiento. Si la conexión no está
        disponible, podrás continuar con el formulario guiado.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField error={errors.contactName} id="contactName" label="Nombre" required>
          <input
            id="contactName"
            name="contactName"
            type="text"
            autoComplete="name"
            value={form.contactName}
            onChange={(event) => updateField("contactName", event.target.value)}
            className="mt-2 min-h-11 w-full border border-ink/20 bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-ink"
          />
        </FormField>

        <FormField error={errors.phone} id="phone" label="Teléfono">
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            className="mt-2 min-h-11 w-full border border-ink/20 bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-ink"
          />
        </FormField>

        <FormField error={errors.email} id="email" label="Email opcional">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            className="mt-2 min-h-11 w-full border border-ink/20 bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-ink"
          />
        </FormField>

        <FormField error={errors.city} id="city" label="Zona / ciudad" required>
          <input
            id="city"
            name="city"
            type="text"
            autoComplete="address-level2"
            value={form.city}
            onChange={(event) => updateField("city", event.target.value)}
            className="mt-2 min-h-11 w-full border border-ink/20 bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-ink"
          />
        </FormField>

        <FormField error={errors.serviceType} id="serviceType" label="Tipo de obra" required>
          <select
            id="serviceType"
            name="serviceType"
            value={form.serviceType}
            onChange={(event) => updateField("serviceType", event.target.value)}
            className="mt-2 min-h-11 w-full border border-ink/20 bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-ink"
          >
            <option value="">Selecciona una opción</option>
            {SERVICE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField id="budgetRange" label="Rango de presupuesto">
          <select
            id="budgetRange"
            name="budgetRange"
            value={form.budgetRange}
            onChange={(event) => updateField("budgetRange", event.target.value)}
            className="mt-2 min-h-11 w-full border border-ink/20 bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-ink"
          >
            {BUDGET_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField id="desiredTimeline" label="Cuándo quiere empezar">
          <select
            id="desiredTimeline"
            name="desiredTimeline"
            value={form.desiredTimeline}
            onChange={(event) => updateField("desiredTimeline", event.target.value)}
            className="mt-2 min-h-11 w-full border border-ink/20 bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-ink"
          >
            {TIMELINE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>

        <div className="hidden" aria-hidden="true">
          <label htmlFor="company">Empresa</label>
          <input
            id="company"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            value={form.honeypot}
            onChange={(event) => updateField("honeypot", event.target.value)}
          />
        </div>

        <FormField
          error={errors.description}
          id="description"
          label="Descripción breve"
          required
          className="sm:col-span-2"
        >
          <textarea
            id="description"
            name="description"
            rows={5}
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            className="mt-2 w-full border border-ink/20 bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-ink"
            placeholder="Cuéntanos qué quieres reformar, zona aproximada y cualquier detalle útil."
          />
        </FormField>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-ink/55">
        Indica al menos teléfono o email para poder contactar contigo.
      </p>

      <div aria-live="polite" className="mt-5 min-h-6 text-sm">
        {status === "success" ? (
          <p className="text-olive">
            Solicitud recibida. Te contactarán para revisar si encaja y valorar próximos pasos.
          </p>
        ) : null}
        {status === "fallback" ? (
          <p className="text-ink/70">
            La solicitud está preparada. Puedes continuar desde el formulario guiado.
          </p>
        ) : null}
        {status === "error" && errors.form ? (
          <p className="text-terracotta">{errors.form}</p>
        ) : null}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-11 items-center justify-center bg-ink px-6 py-3 text-sm font-medium tracking-wide text-bone transition hover:bg-olive disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Enviando..." : "Enviar solicitud"}
        </button>

        {showFallback ? (
          <a
            href={INTAKE_URL}
            className="inline-flex min-h-11 items-center justify-center border border-ink/20 px-5 py-3 text-sm font-medium tracking-wide text-ink transition hover:border-ink hover:bg-ink/5"
          >
            Continuar con solicitud guiada
          </a>
        ) : null}
      </div>
    </form>
  );
}

function FormField({
  children,
  className = "",
  error,
  id,
  label,
  required = false,
}: {
  children: ReactNode;
  className?: string;
  error?: string;
  id: string;
  label: string;
  required?: boolean;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="text-xs font-medium uppercase tracking-[0.16em] text-stone">
        {label}
        {required ? <span className="text-terracotta"> *</span> : null}
      </label>
      {children}
      {error ? <p className="mt-2 text-xs leading-relaxed text-terracotta">{error}</p> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Final CTA                                                                 */
/* -------------------------------------------------------------------------- */

function FinalCTA() {
  return (
    <section id="contacto" className="relative overflow-hidden bg-ink text-bone">
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]">
        <div className="h-full w-full bg-[linear-gradient(to_right,#F4F0E8_1px,transparent_1px),linear-gradient(to_bottom,#F4F0E8_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>
      <div className="pointer-events-none absolute -left-40 bottom-0 hidden h-[520px] w-[520px] rounded-full bg-olive/25 blur-3xl sm:block" />
      <div className="pointer-events-none absolute -right-40 top-0 hidden h-[520px] w-[520px] rounded-full bg-terracotta/15 blur-3xl sm:block" />

      <div className="relative mx-auto max-w-[1360px] px-5 py-24 lg:px-10 lg:py-40">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <SectionLabel index="07" tone="dark">
              Siguiente paso
            </SectionLabel>

            <h2 className="font-display mt-8 text-5xl leading-[1.02] text-bone sm:text-6xl lg:text-[96px]">
              Cuéntanos qué obra
              <span className="block italic text-sand">tienes en mente.</span>
            </h2>

            <p className="mt-10 max-w-xl text-lg leading-relaxed text-bone/75">
              Completa una solicitud inicial para valorar el tipo de proyecto, zona, alcance y
              siguiente paso. Sin compromiso, sin humo.
            </p>

            <div className="mt-12 flex flex-wrap items-center gap-6">
              <PrimaryCTA size="lg" tone="light">
                Solicitar presupuesto
              </PrimaryCTA>
              <div className="space-y-2">
                <WhatsAppCTA tone="dark" />
                {WHATSAPP_URL ? (
                  <p className="max-w-xs text-xs leading-relaxed text-bone/55">
                    Para una primera conversación rápida sobre la obra.
                  </p>
                ) : null}
              </div>
              <GhostLink href="#proceso" tone="dark">
                Revisar proceso
              </GhostLink>
            </div>

            <p className="mt-12 max-w-lg text-sm text-bone/55">
              El formulario ayuda a ordenar la información inicial antes de valorar visita, alcance
              y presupuesto. No es un presupuesto automático ni un envío inmediato.
            </p>
          </div>

          {/* Right — direct form + guided fallback */}
          <div className="space-y-6 lg:col-span-5">
            <LeadSubmitForm />
            <IntakePreviewCard />
          </div>
        </div>
      </div>
    </section>
  );
}

function IntakePreviewCard() {
  const fields: Array<[string, string]> = [
    ["Contacto", "Nombre + teléfono"],
    ["Zona", "Madrid · Ávila · Toledo"],
    ["Tipo de proyecto", "Integral / local / exterior…"],
    ["Alcance", "Superficie aproximada"],
    ["Momento", "Idea / decisión / listo"],
  ];
  return (
    <div className="relative border border-bone/15 bg-[#242320] p-8 lg:p-10">
      <div className="flex items-center justify-between border-b border-bone/15 pb-4">
        <span className="tick-label text-bone/60">Solicitud guiada</span>
        <span className="tick-label text-bone/40">v01 · Diego</span>
      </div>

      <p className="font-display mt-6 text-2xl leading-tight text-bone">Qué te preguntaremos</p>
      <p className="mt-2 text-sm text-bone/60">
        Un formulario corto pensado para ordenar la conversación, no para alargarla.
      </p>

      <ul className="mt-8 space-y-4">
        {fields.map(([label, sample], i) => (
          <li
            key={label}
            className="grid grid-cols-[28px_1fr_auto] items-center gap-4 border-b border-bone/10 pb-4"
          >
            <span className="font-mono text-[10px] text-bone/40">0{i + 1}</span>
            <div>
              <p className="tick-label text-bone/70">{label}</p>
              <p className="mt-1 text-sm text-bone/90">{sample}</p>
            </div>
            <span className="h-2 w-2 rounded-full bg-bone/20" />
          </li>
        ))}
      </ul>

      <div className="mt-8 flex items-center gap-3 border-t border-bone/15 pt-5">
        <span className="h-2 w-2 rounded-full bg-terracotta" />
        <span className="tick-label text-bone/60">fallback disponible</span>
      </div>

      <a
        href={INTAKE_URL}
        className="group mt-8 inline-flex w-full items-center justify-between bg-bone px-6 py-4 text-ink transition hover:bg-sand"
      >
        <span className="text-sm font-medium tracking-wide">Abrir formulario oficial</span>
        <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>
      </a>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Footer                                                                    */
/* -------------------------------------------------------------------------- */

function Footer() {
  return (
    <footer className="bg-[#0F0F0E] text-bone">
      <div className="mx-auto max-w-[1360px] px-5 py-16 lg:px-10 lg:py-20">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-6">
            <div className="flex items-center gap-3">
              <BrandMark />
              <div className="leading-tight">
                <p className="font-display text-lg">Diego Obras y Reformas</p>
                <p className="tick-label text-bone/60">
                  Obras y reformas · Madrid · Ávila · Toledo
                </p>
              </div>
            </div>
            <p className="mt-8 max-w-md text-sm leading-relaxed text-bone/70">
              Estudio de obra centrado en reformas integrales, locales y exteriores, con proceso
              claro y presupuesto con criterio.
            </p>

            <div className="mt-10">
              <PrimaryCTA tone="light">Solicitar presupuesto</PrimaryCTA>
            </div>
          </div>

          <div className="md:col-span-3">
            <p className="tick-label text-bone/60">Navegación</p>
            <ul className="mt-5 space-y-3 text-sm">
              {NAV_ITEMS.map(([label, href]) => (
                <li key={href}>
                  <a href={href} className="text-bone/85 hover:text-sand">
                    {label}
                  </a>
                </li>
              ))}
              <li>
                <a href="#solicitud" className="text-bone/85 hover:text-sand">
                  Solicitar presupuesto
                </a>
              </li>
              <li>
                <a href={INTAKE_URL} className="text-bone/85 hover:text-sand">
                  Solicitud guiada
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <p className="tick-label text-bone/60">Zonas</p>
            <ul className="mt-5 space-y-3 text-sm text-bone/85">
              <li>Madrid y alrededores</li>
              <li>Ávila</li>
              <li>Toledo</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col-reverse items-start justify-between gap-4 border-t border-bone/10 pt-6 md:flex-row md:items-center">
          <p className="tick-label text-bone/50">
            © {new Date().getFullYear()} Diego Obras y Reformas
          </p>
          <p className="tick-label text-bone/50">Gestión de obra · ConstructionOS</p>
        </div>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-ink">
      <Nav />
      <main>
        <Hero />
        <Tension />
        <Services />
        <Fit />
        <Process />
        <Zones />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
