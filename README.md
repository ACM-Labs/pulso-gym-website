# Portal de Pulso Gym

Sitio público de ACM Labs: presenta el sistema, los planes y recibe las solicitudes de los gimnasios interesados. Es independiente del sistema (no comparte código ni base con `apps/`).

- `public/` — sitio estático (`index.html`, `privacidad.html`, `admin.html`, `planes.json`).
- `api/solicitud.js` — recibe el formulario y lo guarda en Postgres (Neon). Valida con `api/_validar.js`, tiene campo trampa para robots y tope de 5 solicitudes por correo al día.
- `api/solicitudes.js` — lista y cambia el estado de las solicitudes; exige `ADMIN_TOKEN`. La pantalla es `/admin`.

## Cambiar los planes y precios

Edita `public/planes.json`. Con `"precio": null` se muestra «Consultar»; con un entero en guaraníes (`"precio": 150000`) se muestra `Gs. 150.000`.

## Publicar en Vercel

1. Importa el repositorio en Vercel y, en **Root Directory**, elige `portal`.
2. **Storage › Create › Neon (Postgres)** y conéctalo al proyecto: crea la variable `DATABASE_URL`. La tabla `solicitudes` se crea sola con la primera solicitud.
3. En **Settings › Environment Variables** agrega `ADMIN_TOKEN` (32 caracteres o más).
4. Despliega. Las solicitudes se ven en `/admin`.

Pruebas: `npm test`. Para probar las funciones en local: `npx vercel dev` (necesita `.env` según `.env.example`).
