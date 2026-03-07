# upward

An Electron application with React and TypeScript

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

## Google Calendar (opcional)

Los usuarios solo tienen que ir a **Configuración → Conexiones** y pulsar **Conectar**; se abre el navegador para autorizar con Google y listo.

Para que eso funcione, quien **desarrolla o distribuye** la app debe configurar una vez el Client ID de Google:

1. **Crear credenciales en Google Cloud** (una vez por proyecto/app)
   - [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials.
   - Activa **Google Calendar API** (Library → “Google Calendar API” → Enable).
   - Create credentials → **OAuth client ID** → tipo **Desktop app**.
   - En “Authorized redirect URIs” añade: `http://localhost:3456/callback`.
   - Copia el **Client ID**.

2. **Desarrollo (local)**
   - Crea un archivo `.env` en la raíz del proyecto con:
   - `GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com`
   - Al ejecutar `npm run dev`, la app usará ese valor.

3. **Build para distribuir**
   - Al compilar, la app puede llevar el Client ID integrado:
   - `GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com npm run build`
   - Los usuarios que instalen esa versión solo verán el botón Conectar, sin configurar nada.

Los tokens se guardan cifrados con Electron `safeStorage` (Keychain en macOS, Credential Manager en Windows).
