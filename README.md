# Volta

App web y móvil para operar flota: viajes, unidades, gastos, facturas, usuarios y monitoreo.

Sitio: [https://voltabs.mx](https://voltabs.mx)

## Roles

| Rol | Menú habitual |
| --- | --- |
| **Administrador** | Inicio, Viajes, Gastos, Perfil, Unidades, Cámaras, Usuarios |
| **Operador** | Inicio, Viajes (los asignados), Perfil |
| **Ayudante** | Inicio, Viajes (como acompañante), Perfil |

Facturas y algunos ajustes requieren permiso explícito. Manual: `MANUAL_DE_USUARIO.md`.

## Levantar en local

Backend (`backend/`):

```bash
cp .env.example .env
npm install
npm run dev
```

Frontend (`volta-frontend/`):

```bash
npm install
npx expo start
```

Mongo en `MONGO_URI`. Correo de recuperación: Gmail SMTP (`EMAIL_USER` + `EMAIL_PASS` de aplicación).

## API

Por defecto:

- Web en localhost → `http://localhost:3000`
- Web en IP de LAN → `http://<esa-ip>:3000`
- App / producción → `https://voltabs.mx`

No uses `cloudflared tunnel --url` (la URL cambia). Túnel fijo: `bash scripts/setup-named-tunnel.sh`.

## Builds móviles

En `volta-frontend` (API fija `https://voltabs.mx`):

```bash
npm run build:android
npm run build:android:dev
npm run build:ios
```

iOS requiere cuenta Apple. Push nativas necesitan development build, no Expo Go.

## Tests (backend)

```bash
cd backend && npm test
```
