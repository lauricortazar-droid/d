# FGDLL · Centro de Documentos y Materiales Institucionales

Aplicación web de **Fraternidad Guerreros de la Luz** para crear, personalizar, guardar y descargar
materiales institucionales (formatos, reconocimientos, comunicados, carteles) con la identidad de cada
grupo o centro.

- Funciona **sin internet** una vez cargada y **sin servidor**: todo se guarda en el navegador.
- Pensada para móvil y computadora (Safari en iPhone y Mac incluidos).
- Descarga en **PDF** o **imagen PNG/JPG**, o imprime directamente.

## Cómo usarla

| Sección | Para qué sirve |
| --- | --- |
| **Materiales y Formatos** | Biblioteca de plantillas. «Usar Plantilla» abre el editor. |
| **Mis Documentos** | Documentos guardados: abrir, duplicar, archivar, eliminar o descargar el PDF. |
| **Identidad Visual** | Estilos oficiales y generación de logotipos. |
| **Respaldo de datos** | Descarga o restaura todo tu trabajo en un archivo `.json`. |

> **Importante:** los datos viven solo en el navegador y el dispositivo donde trabajas.
> Descarga un respaldo con frecuencia (menú del centro → *Respaldo de datos*).

### Modos Director / Administrador

Son **modos de la interfaz**, no cuentas con contraseña: cualquier persona que abra la página puede cambiar de modo,
pero sus cambios solo afectan a su propio navegador. No sirve como control de acceso.

### IA opcional

El normalizador de texto y la conversión de formatos funcionan con **reglas locales** sin ninguna clave.
Si lo deseas, en el panel «IA de Google (opcional)» puedes pegar tu propia clave de la API de Gemini:
se guarda solo en esa pestaña y el texto se envía a Google únicamente si la activas.
**No uses la IA con datos personales de personas atendidas.** Si Google renombra el modelo, cámbialo en ese mismo panel.

## Desarrollo

Requiere Node.js 20 o superior.

```bash
npm install
npm run dev      # servidor local en http://localhost:3000
npm run lint     # revisión de tipos
npm run build    # genera la carpeta dist/ lista para publicar
```

## Publicarla en GitHub Pages

La configuración usa rutas relativas (`base: './'`), así que `dist/` funciona en cualquier carpeta.

**Opción A – Carpeta estática (la más simple).** Copia el contenido de `dist/` a una carpeta del repositorio
(por ejemplo `centro-documentos/`), súbelo y en *Settings → Pages* elige la rama `main` y la carpeta raíz.
Quedará en `https://TU_USUARIO.github.io/herramientas/centro-documentos/`.

**Opción B – Publicación automática con GitHub Actions** (solo si este proyecto es la raíz de su propio repositorio).
Crea `.github/workflows/pages.yml`:

```yaml
name: Publicar en GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Luego, en *Settings → Pages*, elige **Source: GitHub Actions**.

> Aviso: la Opción B reemplaza lo que Pages esté sirviendo hoy en ese repositorio. Si «herramientas» ya aloja otras
> herramientas, usa la Opción A.

## Privacidad

- No subas a un repositorio público respaldos `.json` ni capturas con datos de personas (fichas de ingreso, etc.).
- Los nombres, teléfonos y correos de `src/data/initialData.ts` son datos de ejemplo; reemplázalos o bórralos si alguno es real
  y el repositorio es público.

## Estructura

```
src/
  App.tsx                 Estado general, folios, respaldo
  components/             Editor, biblioteca, mis documentos, modales
  services/               exportService (PDF/imagen) · geminiService (normalizador)
  utils/storage.ts        Lectura/escritura segura en el navegador
  data/initialData.ts     Centros, plantillas y estilos de ejemplo
```
