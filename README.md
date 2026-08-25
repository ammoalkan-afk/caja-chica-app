# Caja Chica

App web para registrar y consultar los **gastos** y **reposiciones** de una caja chica.
Construida con React + Vite + Tailwind CSS, usando Supabase como base de datos.

No incluye login (uso interno, sin autenticación).

---

## 1. Crear el proyecto en Supabase

1. Entra a https://supabase.com/dashboard e inicia sesión con tu cuenta de Gmail.
2. Clic en **New project**.
3. Elige un nombre (ej: `caja-chica`), una contraseña para la base de datos (guárdala) y la región más cercana.
4. Espera 1-2 minutos a que se cree el proyecto.

## 2. Crear las tablas

1. En el menú lateral de Supabase, entra a **SQL Editor**.
2. Clic en **New query**.
3. Copia y pega todo el contenido del archivo [`supabase/schema.sql`](./supabase/schema.sql) de este proyecto.
4. Clic en **Run**. Esto crea las tablas `gastos` y `reposiciones`, y sus permisos.

## 3. Obtener tus credenciales

1. En Supabase, ve a **Project Settings** (ícono de engranaje) > **Data API**.
2. Copia la **Project URL**.
3. Ve a **Project Settings > API Keys** y copia la clave **anon public**.

## 4. Configurar el proyecto localmente

```bash
npm install
cp .env.example .env
```

Edita el archivo `.env` y pega tus valores:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon
```

Luego corre:

```bash
npm run dev
```

Abre http://localhost:5173 — deberías ver la app funcionando contra tu Supabase.

## 5. Subir el proyecto a GitHub

```bash
git init
git add .
git commit -m "Caja chica: primera versión"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/caja-chica.git
git push -u origin main
```

(Crea antes el repositorio vacío en GitHub si no existe.)

El archivo `.env` **no se sube** a GitHub (está en `.gitignore`), así que tus claves quedan seguras.

## 6. Desplegar en Netlify

1. Entra a https://app.netlify.com y clic en **Add new site > Import an existing project**.
2. Conecta tu cuenta de GitHub y elige el repositorio `caja-chica`.
3. Netlify detectará la configuración automáticamente gracias a `netlify.toml` (build command `npm run build`, carpeta `dist`).
4. Antes de desplegar, ve a **Site configuration > Environment variables** y agrega:
   - `VITE_SUPABASE_URL` = tu Project URL de Supabase
   - `VITE_SUPABASE_ANON_KEY` = tu clave anon
5. Clic en **Deploy site**.

Cada vez que hagas `git push`, Netlify vuelve a desplegar automáticamente.

---

## Estructura del proyecto

```
src/
  components/     Sidebar, tablas, formularios (modales), resumen
  pages/          Gastos.jsx, Reposiciones.jsx
  lib/
    supabaseClient.js   Cliente de Supabase
    data.js              Funciones CRUD (crear/leer/editar/eliminar)
    format.js            Formato de moneda y fechas
supabase/
  schema.sql       Script SQL para crear las tablas
```

## Notas importantes

- **Moneda:** por defecto se muestra en Guaraníes (`Gs.`). Si usas otra moneda, edita `CURRENCY_SYMBOL` en `src/lib/format.js`.
- **Seguridad:** como no hay login, cualquiera con el link de tu sitio puede registrar y borrar movimientos (usa la clave "anon" de Supabase, que queda visible en el navegador). Es razonable para uso interno/privado. Si más adelante quieres restringir el acceso, lo más simple es:
  - Agregar Supabase Auth (login con email/contraseña), o
  - Poner el sitio detrás de una contraseña simple con Netlify (Site configuration > Visitor access).
- **Categorías y proveedores:** son campos de texto libre con sugerencias, para mantener esta primera versión simple. Si más adelante quieres gestionarlos como catálogos aparte (con su propia pantalla), o agregar un dashboard con gráficos como el diseño original, puedo construirlo sobre esta misma base.
