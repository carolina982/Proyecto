# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.


- Este proyecto es tanto como web y movil  es para control de viaticos , viajes , unididades , usuarios EN el cual ya tiene dos roles
 que son adminstrador , chofer que arroga la lista de usarios en el apartado de usuarios 
- administrador -->inicio , perfil , viajes , unidades, usuarios 
- chofer/usuario-->inicio , perfil , viajes, viaticos 

3. Levantar el servidor de base de datos

     ```bash
     npx ts-node src/server.ts
     ```
4. Reniciar  el servidor de base de datos 


     ```bash
     npm run dev 
     ```
5. Aplicacion 

     ```bashw
     npx expo start 
     ```

- Pendientes en realizar en la aplicacion 

* Hosting / dominio (`voltabs.mx`)
  - La app ya usa `https://voltabs.mx` por defecto (`volta-frontend/services/baseUrl.ts`).
  - **No uses** `cloudflared tunnel --url` (quick tunnel): la URL `*.trycloudflare.com` cambia al reiniciar.
  - Para URL fija desde esta máquina: `bash scripts/setup-named-tunnel.sh` (túnel nombrado + DNS).
  - Alternativa: desplegar el backend en un VPS/PaaS y apuntar el DNS de `voltabs.mx`.

* Restablecer la contraseña
  - Frontend: Login → ¿Olvidaste tu contraseña? → código 6 dígitos → nueva contraseña
  - API: `POST /api/auth/forgot-password` y `POST /api/auth/reset-password`
  - Correo en `backend/.env` (ver `backend/.env.example`):
    - Resend: dominio verificado y `EMAIL_FROM=Volta App <noreply@send.voltabs.mx>`
    - o Gmail: `EMAIL_USER` + `EMAIL_PASS` (contraseña de aplicación)
  - Tras cambiar `.env`: `pm2 restart volta-backend --update-env`

* Perfil (foto / datos)
  - Guardar usa multipart sin `Content-Type` manual (boundary correcto en web).
  - Fotos en Cloudinary si hay credenciales; si no, `backend/uploads`.
  - Cualquier usuario puede editar su nombre/contacto/foto; el correo solo un admin.

* App móvil estable (APK / iOS)
  - Ya no dependas de Expo Go + túneles para usuarios finales.
  - API fija en builds: `https://voltabs.mx` (`eas.json`).
  - Una vez (en `volta-frontend`):
    ```bash
    npm i -g eas-cli
    eas login
    eas build:configure
    ```
  - Android APK instalable:
    ```bash
    npm run build:android
    ```
  - Development client (push nativas, etc.):
    ```bash
    npm run build:android:dev
    ```
  - iOS (requiere cuenta Apple):
    ```bash
    npm run build:ios
    ```

