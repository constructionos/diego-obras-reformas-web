# Diego Obras y Reformas Web

Landing publica comercial de Diego Obras y Reformas.

Este proyecto es una web publica independiente de ConstructionOS. Su objetivo es captar solicitudes comerciales y enviarlas a ConstructionOS para registrar la oportunidad en el tenant correspondiente.

## Desarrollo local

```bash
npm install
npm run dev
```

## Variables de entorno

Copia `.env.example` si necesitas cambiar la configuracion local.

```env
VITE_CONSTRUCTIONOS_API_URL=https://constructionos-constructionos.vercel.app/api/public/leads
VITE_CONSTRUCTIONOS_INTAKE_URL=https://constructionos-constructionos.vercel.app/intake/diego-obras-reformas
VITE_DIEGO_WHATSAPP_PHONE=
```

`VITE_CONSTRUCTIONOS_API_URL` define el endpoint publico de ConstructionOS para enviar leads directos desde la landing. Si esta vacio, la web no hace fetch y usa el intake como fallback.

`VITE_CONSTRUCTIONOS_INTAKE_URL` define el formulario publico guiado de ConstructionOS. Se mantiene como fallback cuando la API no esta configurada o si el envio directo falla.

`VITE_DIEGO_WHATSAPP_PHONE` activa el CTA secundario de WhatsApp. El numero debe ir en formato internacional, sin `+` ni espacios. Ejemplo de formato: `34600111222`. No pongas el numero real en el repo.

## Flujo actual

Web Diego -> API publica ConstructionOS -> lead en tenant Diego.

La integracion principal usa `fetch` desde la landing al endpoint publico de ConstructionOS con `Content-Type: application/json` y sin credenciales. No hay backend propio, Supabase, autenticacion ni dashboard en esta web.

Si `VITE_CONSTRUCTIONOS_API_URL` esta vacio o el envio falla, la UI mantiene el enlace al intake publico:

Web Diego -> ConstructionOS intake URL -> lead en tenant Diego.

El CTA secundario de WhatsApp abre `wa.me` con un mensaje preparado para contacto manual. No usa WhatsApp API ni backend.

## Flujo futuro

Web Diego -> API publica ConstructionOS -> automatizaciones internas opcionales.

La futura integracion de WhatsApp podra conectar conversaciones con ConstructionOS cuando exista un flujo publico preparado. Hoy WhatsApp sigue siendo un canal secundario manual.

## Comandos

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run build
```
