# Diego Obras y Reformas Web

Landing publica comercial de Diego Obras y Reformas.

Este proyecto es una web publica independiente de ConstructionOS. Su objetivo es captar solicitudes comerciales y enviar a los usuarios al intake publico de ConstructionOS para registrar la oportunidad en el tenant correspondiente.

## Desarrollo local

```bash
npm install
npm run dev
```

## Variables de entorno

Copia `.env.example` si necesitas cambiar la configuracion local.

```env
VITE_CONSTRUCTIONOS_INTAKE_URL=https://constructionos-constructionos.vercel.app/intake/diego-obras-reformas
VITE_CONSTRUCTIONOS_API_URL=
VITE_DIEGO_WHATSAPP_PHONE=
```

`VITE_CONSTRUCTIONOS_INTAKE_URL` define el formulario publico de ConstructionOS al que apuntan los CTAs.

`VITE_CONSTRUCTIONOS_API_URL` queda reservado para una API publica futura. Mientras este vacio, la web no hace envios directos por API.

`VITE_DIEGO_WHATSAPP_PHONE` activa el CTA secundario de WhatsApp. El numero debe ir en formato internacional, sin `+` ni espacios. Ejemplo de formato: `34600111222`. No pongas el numero real en el repo.

## Flujo actual

Web Diego -> ConstructionOS intake URL -> lead en tenant Diego.

La integracion actual es por redireccion. No hay fetch real, backend propio, Supabase, autenticacion ni dashboard en esta web.

El CTA secundario de WhatsApp abre `wa.me` con un mensaje preparado para contacto manual. No usa WhatsApp API ni backend.

## Flujo futuro

Web Diego -> API publica ConstructionOS -> lead directo.

Cuando ConstructionOS exponga una API publica, se podra configurar `VITE_CONSTRUCTIONOS_API_URL` y evolucionar `src/lib/constructionos.ts` sin cambiar la experiencia principal de la landing.

La futura integracion de WhatsApp podra conectar conversaciones con ConstructionOS cuando exista un flujo publico preparado.

## Comandos

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run build
```
