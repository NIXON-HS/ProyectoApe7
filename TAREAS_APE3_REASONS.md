# Plan de Trabajo y Cronograma de Tareas Detalladas - GUIA APE #3
## Proyecto: Portal Web del Grupo de Investigación REASONS (UTA)

Este documento contiene la planificación detallada, el diseño del modelo relacional, las tareas del backend (Node.js + Express), las tareas del frontend (Angular) y los pasos de integración para cumplir con la **Guía APE #3** del grupo de investigación **REASONS** (Research in Engineering and Advanced Sustainable Operations, Nature, and Society) de la Universidad Técnica de Ambato.

---

## 🗺️ Índice del Proyecto
- [Actividad 1: Diseño del Modelo Relacional (BD)](#actividad-1-diseño-del-modelo-relacional-bd)
- [Actividad 2: Creación del Backend (Node.js & Express)](#actividad-2-creación-del-backend-nodejs--express)
- [Actividad 3: Creación del Frontend (Angular)](#actividad-3-creación-del-frontend-angular)
- [Actividad 4: Integración Frontend – Backend](#actividad-4-integración-frontend--backend)
- [Actividad 5: Módulo de Home (Página Principal)](#actividad-5-módulo-de-home-página-principal)
- [Actividad 6: Módulo de Investigadores (Equipo)](#actividad-6-módulo-de-investigadores-equipo)
- [Actividad 7: Módulo de Proyectos de Investigación](#actividad-7-módulo-de-proyectos-de-investigación)
- [Actividad 8: Módulo de Publicaciones Científicas](#actividad-8-módulo-de-publicaciones-científicas)
- [Actividad 9: Formulario de Contacto](#actividad-9-formulario-de-contacto)
- [Actividad 10: Seguridad y Buenas Prácticas](#actividad-10-seguridad-y-buenas-prácticas)
- [Actividad 11: Adaptabilidad Multidispositivo (Responsive)](#actividad-11-adaptabilidad-multidispositivo-responsive)

---

## Actividad 1: Diseño del Modelo Relacional (BD)
**Objetivo:** Diseñar la estructura de base de datos relacional para soportar todo el sistema.

### 📋 Tareas Específicas
- [x] **1.1. Definición del Esquema Entidad-Relación**
  - Diseñar el diagrama E-R con las siguientes entidades base:
    * `investigadores` (Datos del equipo de investigación).
    * `proyectos` (Proyectos de investigación).
    * `publicaciones` (Artículos científicos).
    * `contactos` (Mensajes recibidos del formulario).
    * `lineas_investigacion` (Líneas de investigación institucionales).
    * `proyecto_investigador` (Relación N:M para coautoría/participación en proyectos).
    * `publicacion_investigador` (Relación N:M para coautoría en artículos).

  #### 📊 Diagrama Entidad-Relación (E-R) en formato Mermaid
  ```mermaid
  erDiagram
      investigadores {
          int id PK "AUTO_INCREMENT"
          varchar nombres "NOT NULL (150)"
          varchar orcid UNIQUE "NULL (50)"
          varchar correo_institucional UNIQUE "NOT NULL (150)"
          text biografia "NOT NULL"
          enum posicion "Director, Subdirector, Investigador"
          varchar foto_url "NULL (255)"
          varchar red_facebook "NULL (255)"
          varchar red_linkedin "NULL (255)"
          varchar red_instagram "NULL (255)"
          varchar red_telegram "NULL (255)"
      }

      proyectos {
          int id PK "AUTO_INCREMENT"
          varchar titulo "NOT NULL (255)"
          text descripcion "NOT NULL"
          text objetivos "NOT NULL"
          text resultados "NOT NULL"
          enum estado "Activo, Finalizado, Propuesta"
          int linea_id FK "NOT NULL"
      }

      publicaciones {
          int id PK "AUTO_INCREMENT"
          varchar titulo "NOT NULL (255)"
          text resumen "NOT NULL"
          text cita "NOT NULL (APA/IEEE)"
          varchar revista_portada_url "NULL (255)"
          varchar doi_url "NULL (255)"
          int linea_id FK "NULL"
      }

      contactos {
          int id PK "AUTO_INCREMENT"
          varchar nombre_completo "NOT NULL (150)"
          varchar correo "NOT NULL (150)"
          varchar asunto "NOT NULL (150)"
          text mensaje "NOT NULL"
          timestamp creado_en "DEFAULT CURRENT_TIMESTAMP"
      }

      lineas_investigacion {
          int id PK "AUTO_INCREMENT"
          varchar nombre "NOT NULL (255)"
          text descripcion "NOT NULL"
          varchar abreviatura "NOT NULL (50)"
      }

      proyecto_investigador {
          int proyecto_id PK,FK "NOT NULL"
          int investigador_id PK,FK "NOT NULL"
          varchar rol_proyecto "NULL (100)"
      }

      publicacion_investigador {
          int publicacion_id PK,FK "NOT NULL"
          int investigador_id PK,FK "NOT NULL"
          varchar rol_publicacion "NULL (100)"
      }

      lineas_investigacion ||--o{ proyectos : "contiene"
      lineas_investigacion ||--o{ publicaciones : "clasifica"
      investigadores ||--o{ proyecto_investigador : "participa"
      proyectos ||--o{ proyecto_investigador : "asociado"
      investigadores ||--o{ publicacion_investigador : "autor"
      publicaciones ||--o{ publicacion_investigador : "asociado"
  ```

- [x] **1.2. Diccionario de Datos Detallado**
  - Definición formal de las tablas, tipos de datos, restricciones y propósitos en el sistema.

  #### 📋 Tabla: `investigadores` (Datos del equipo de investigación)
  | Campo | Tipo de Datos | Restricciones | Descripción |
  | :--- | :--- | :--- | :--- |
  | `id` | `INT` | PK, AUTO_INCREMENT, NOT NULL | Identificador único del investigador. |
  | `nombres` | `VARCHAR(150)` | NOT NULL | Nombres y apellidos completos del investigador. |
  | `orcid` | `VARCHAR(50)` | UNIQUE, NULL | Código identificador ORCID del investigador. |
  | `correo_institucional` | `VARCHAR(150)` | UNIQUE, NOT NULL | Correo electrónico institucional (ej. `@uta.edu.ec`). |
  | `biografia` | `TEXT` | NOT NULL | Resumen biográfico de trayectoria académica y profesional. |
  | `posicion` | `ENUM('Director', 'Subdirector', 'Investigador')` | NOT NULL | Cargo organizativo dentro del grupo REASONS. |
  | `foto_url` | `VARCHAR(255)` | NULL | URL o ruta local a la fotografía del perfil del investigador. |
  | `red_facebook` | `VARCHAR(255)` | NULL | Enlace al perfil de Facebook del investigador. |
  | `red_linkedin` | `VARCHAR(255)` | NULL | Enlace al perfil de LinkedIn del investigador. |
  | `red_instagram` | `VARCHAR(255)` | NULL | Enlace al perfil de Instagram del investigador. |
  | `red_telegram` | `VARCHAR(255)` | NULL | Enlace o número de chat en Telegram para contacto directo. |

  #### 📋 Tabla: `proyectos` (Proyectos de investigación)
  | Campo | Tipo de Datos | Restricciones | Descripción |
  | :--- | :--- | :--- | :--- |
  | `id` | `INT` | PK, AUTO_INCREMENT, NOT NULL | Identificador único del proyecto de investigación. |
  | `titulo` | `VARCHAR(255)` | NOT NULL | Título oficial completo del proyecto de investigación. |
  | `descripcion` | `TEXT` | NOT NULL | Descripción general y resumen detallado del proyecto. |
  | `objetivos` | `TEXT` | NOT NULL | Metas y objetivos generales/específicos del proyecto. |
  | `resultados` | `TEXT` | NOT NULL | Resultados previstos, entregables u outputs del proyecto. |
  | `estado` | `ENUM('Activo', 'Finalizado', 'Propuesta')` | DEFAULT 'Activo', NOT NULL | Estado operativo del proyecto. |
  | `linea_id` | `INT` | FK (`lineas_investigacion.id`), NOT NULL | Línea de investigación institucional asociada al proyecto. |

  #### 📋 Tabla: `publicaciones` (Artículos científicos)
  | Campo | Tipo de Datos | Restricciones | Descripción |
  | :--- | :--- | :--- | :--- |
  | `id` | `INT` | PK, AUTO_INCREMENT, NOT NULL | Identificador único del artículo científico. |
  | `titulo` | `VARCHAR(255)` | NOT NULL | Título oficial completo de la publicación científica. |
  | `resumen` | `TEXT` | NOT NULL | Abstract o resumen condensado del artículo científico. |
  | `cita` | `TEXT` | NOT NULL | Cita bibliográfica formalizada en estándar APA o IEEE. |
  | `revista_portada_url` | `VARCHAR(255)` | NULL | Enlace a la imagen representativa o portada de la revista. |
  | `doi_url` | `VARCHAR(255)` | NULL | Enlace o URL directa mediante identificador DOI. |
  | `linea_id` | `INT` | FK (`lineas_investigacion.id`), NULL | Línea de investigación a la que aporta el artículo. |

  #### 📋 Tabla: `contactos` (Mensajes recibidos del formulario)
  | Campo | Tipo de Datos | Restricciones | Descripción |
  | :--- | :--- | :--- | :--- |
  | `id` | `INT` | PK, AUTO_INCREMENT, NOT NULL | Identificador único del mensaje recibido. |
  | `nombre_completo` | `VARCHAR(150)` | NOT NULL | Nombre y apellido de la persona que envía el formulario. |
  | `correo` | `VARCHAR(150)` | NOT NULL | Correo de contacto del usuario remitente. |
  | `asunto` | `VARCHAR(150)` | NOT NULL | Tema, motivo o título del mensaje. |
  | `mensaje` | `TEXT` | NOT NULL | Contenido textual completo del mensaje o consulta. |
  | `creado_en` | `TIMESTAMP` | DEFAULT CURRENT_TIMESTAMP, NOT NULL | Fecha y hora exactas de recepción en el sistema. |

  #### 📋 Tabla: `lineas_investigacion` (Líneas de investigación institucionales)
  | Campo | Tipo de Datos | Restricciones | Descripción |
  | :--- | :--- | :--- | :--- |
  | `id` | `INT` | PK, AUTO_INCREMENT, NOT NULL | Identificador único de la línea de investigación. |
  | `nombre` | `VARCHAR(255)` | NOT NULL | Nombre formal de la línea de investigación. |
  | `descripcion` | `TEXT` | NOT NULL | Alcance académico, temáticas y propósitos de la línea. |
  | `abreviatura` | `VARCHAR(50)` | NOT NULL | Abreviación de la línea de investigación (ej. "DIM-PIS"). |

  #### 📋 Tabla: `proyecto_investigador` (Relación coautoría/participación en proyectos)
  | Campo | Tipo de Datos | Restricciones | Descripción |
  | :--- | :--- | :--- | :--- |
  | `proyecto_id` | `INT` | PK, FK (`proyectos.id`), NOT NULL | Referencia al proyecto de investigación asociado. |
  | `investigador_id` | `INT` | PK, FK (`investigadores.id`), NOT NULL | Referencia al investigador participante. |
  | `rol_proyecto` | `VARCHAR(100)` | NULL | Rol o función asignada en el proyecto (ej. "Coordinador"). |

  #### 📋 Tabla: `publicacion_investigador` (Relación coautoría en artículos)
  | Campo | Tipo de Datos | Restricciones | Descripción |
  | :--- | :--- | :--- | :--- |
  | `publicacion_id` | `INT` | PK, FK (`publicaciones.id`), NOT NULL | Referencia al artículo científico asociado. |
  | `investigador_id` | `INT` | PK, FK (`investigadores.id`), NOT NULL | Referencia al investigador autor/coautor. |
  | `rol_publicacion` | `VARCHAR(100)` | NULL | Rol específico en el artículo (ej. "Autor de correspondencia"). |

- [x] **1.3. Scripts DDL de Creación**
  - Escribir archivo `schema.sql` con las sentencias `CREATE TABLE` y restricciones de clave foránea (`FOREIGN KEY`).
  - Crear índices en campos de búsqueda frecuentes (`investigadores.correo_institucional`, `proyectos.titulo`).

---

## Actividad 2: Creación del Backend (Node.js & Express)
**Objetivo:** Desarrollar una API REST robusta que maneje la lógica de negocio y persista los datos.

### 📋 Tareas Específicas
- [x] **2.1. Inicialización y Configuración de Dependencias**
  - Ejecutar `npm init -y` en la carpeta `/backend`.
  - Instalar dependencias esenciales:
    ```bash
    npm install express dotenv cors pg pg-hstore sequelize helmet express-rate-limit express-validator
    npm install --save-dev nodemon
    ```
  - Configurar archivo `.env` con variables de entorno (`PORT`, `DATABASE_URL`, `CORS_ORIGIN`).

- [x] **2.2. Arquitectura de Directorios (MVC-ish API)**
  - Configurar la estructura de archivos:
    ```text
    backend/
    ├── config/          # Conexión a la base de datos (Sequelize)
    ├── controllers/     # Lógica controladora de las peticiones
    ├── models/          # Modelos de base de datos
    ├── routes/          # Definición de rutas Express
    ├── middlewares/     # Seguridad, validaciones y manejo de errores
    ├── seeders/         # Scripts para cargar investigadores iniciales
    ├── .env
    ├── app.js           # Configuración del servidor Express
    └── server.js        # Punto de entrada
    ```

- [x] **2.3. Modelos Sequelize (ORM)**
  - Implementar los modelos con Sequelize mapeando cada atributo y tipos de datos de la Actividad 1.
  - Configurar las relaciones asociativas en un indexador de modelos (`models/index.js`):
    * `Proyecto.belongsToMany(Investigador, { through: 'ProyectoInvestigador' })`
    * `Publicacion.belongsToMany(Investigador, { through: 'PublicacionInvestigador' })`

- [x] **2.4. Creación del Script de Inicialización (Seeders)**
  - Escribir un script de precarga de base de datos (`seeders/initialSeed.js`) con los **11 investigadores provistos** en la información del grupo (Israel Naranjo, Franklin Tigre, John Reyes, Carlos Sánchez, etc.).
  - Asegurar que la biografía y ORCID de cada uno queden registrados correctamente.

- [x] **2.5. Rutas y Controladores de la API REST**
  - Implementar CRUD para investigadores: `GET /api/investigadores`, `POST`, `PUT`, `DELETE`.
  - Implementar CRUD para proyectos: `GET /api/proyectos`, `POST`, `PUT`, `DELETE`.
  - Implementar CRUD para publicaciones: `GET /api/publicaciones`, `POST`, `PUT`, `DELETE`.
  - Implementar Endpoint de Contacto: `POST /api/contacto` (guarda los mensajes en base de datos).

---

## Actividad 3: Creación del Frontend (Angular)
**Objetivo:** Crear la aplicación cliente utilizando Angular con un diseño premium y estructurado.

### 📋 Tareas Específicas
- [x] **3.1. Creación del Espacio de Trabajo**
  - Crear el proyecto Angular utilizando Angular CLI:
    ```bash
    npx -y @angular/cli@latest new frontend --routing --style=css --ssr=false
    ```
- [x] **3.2. Configuración de Arquitectura de Módulos / Componentes**
  - Crear los componentes base necesarios:
    * `core/` (servicios compartidos, interceptores, guards).
    * `shared/` (componentes reutilizables como header, footer, loaders, badges).
    * `pages/` (páginas principales de la aplicación):
      + `home/` (Actividad 5)
      + `equipo/` (Actividad 6)
      + `proyectos/` (Actividad 7)
      + `publicaciones/` (Actividad 8)
      + `contacto/` (Actividad 9)
- [x] **3.3. Configuración de Rutas de la Aplicación**
  - Definir las rutas en `app-routing.module.ts`:
    * `""` redirecciona a `/home`.
    * `/home` carga el componente `HomeComponent`.
    * `/equipo` carga el componente `EquipoComponent`.
    * `/proyectos` carga el componente `ProyectosComponent`.
    * `/publicaciones` carga el componente `PublicacionesComponent`.
    * `/contacto` carga el componente `ContactoComponent`.
    * `**` (Wildcard) carga una página 404 personalizada con estética premium.
- [x] **3.4. Estilos Globales y Sistema de Diseño (index.css)**
  - Crear una paleta de colores inspirada en la sostenibilidad, naturaleza e ingeniería avanzada:
    * `--primary-green`: `#1b4332` (Verde bosque profundo - representa la naturaleza)
    * `--secondary-emerald`: `#40916c` (Esmeralda - representa la innovación ecológica)
    * `--accent-gold`: `#d4af37` (Dorado sutil - excelencia científica)
    * `--dark-slate`: `#1e293b` (Gris oscuro moderno)
    * `--light-bg`: `#f8fafc` (Fondo claro premium)
  - Configurar fuentes modernas (ej. "Outfit" o "Inter" vía Google Fonts) y clases utilitarias para espaciado, botones glassmorphism y transiciones suaves.

---

## Actividad 4: Integración Frontend – Backend
**Objetivo:** Conectar la interfaz de usuario con la API REST de Node.js de manera segura e interactiva.

### 📋 Tareas Específicas
- [x] **4.1. Configuración de Environments**
  - Definir variables de entorno en Angular (`src/environments/environment.ts` y `environment.prod.ts`):
    * `apiUrl: 'http://localhost:3000/api'`
- [x] **4.2. Creación de Modelos e Interfaces en Angular**
  - Definir interfaces TypeScript para tipar la información:
    * `src/app/core/models/investigador.model.ts`
    * `src/app/core/models/proyecto.model.ts`
    * `src/app/core/models/publicacion.model.ts`
    * `src/app/core/models/contacto.model.ts`
- [x] **4.3. Implementación de Servicios de Angular**
  - Crear servicios utilizando `HttpClient`:
    * `InvestigadorService` (`getInvestigadores()`, `getInvestigadorById()`).
    * `ProyectoService` (`getProyectos()`, `crearProyecto()`).
    * `PublicacionService` (`getPublicaciones()`, `crearPublicacion()`).
    * `ContactoService` (`env## Actividad 5: Módulo de Home (Página Principal)
**Objetivo:** Construir una landing page interactiva con la información fundamental del grupo.

### 📋 Tareas Específicas
- [x] **5.1. Hero Section Impactante**
  - Diseñar una sección de cabecera con un fondo animado o un gradiente verde-esmeralda a pizarra oscura, presentando el logotipo diseñado y el nombre completo: *REASONS (Research in Engineering and Advanced Sustainable Operations, Nature, and Society)*.
- [x] **5.2. Misión y Objetivos**
  - Presentar la descripción del grupo de manera clara usando tipografía premium.
  - Crear un componente de pestañas (Tabs) o tarjetas interactivas para mostrar el **Objetivo General** y los **Objetivos Específicos** detalladamente.
- [x] **5.3. Dominio y Líneas de Investigación**
  - Mostrar visualmente el dominio: *Optimización de los Sistemas Productivos, Diseño y Desarrollo Urbanístico de la Facultad de Ingeniería en Sistemas, Electrónica e Industrial*.
  - Crear 3 tarjetas ilustrativas con micro-animaciones (escala y sombras en hover) para las líneas de investigación:
    1. **Diseño, Materiales, Producción, Identidad, Sostenibilidad y Tecnologías aplicadas** (Iconografía de engranaje y hojas verdes).
    2. **Software, Tecnologías de la Información y Ciencias de Datos** (Iconografía de servidores y analítica de datos).
    3. **Energía, Desarrollo Sostenible y Gestión de Recursos Naturales** (Iconografía de panel solar o turbina limpia).

---

## Actividad 6: Módulo de Equipo de Trabajo (Investigadores)
**Objetivo:** Implementar la interfaz para consultar los perfiles del equipo de investigación.

### 📋 Tareas Específicas
- [x] **6.1. Vista de Cuadrícula (Grid) del Equipo**
  - Diseñar tarjetas elegantes para cada miembro del equipo, cargados dinámicamente desde el backend.
  - Organizar jerárquicamente:
    * Sección destacada para la directiva: **Director** (Israel Naranjo Chiriboga) y **Subdirector** (Franklin Tigre Ortega).
    * Sección para **Investigadores** (John Reyes, Carlos Sánchez, Luis Morales, Freddy Lema, Edgar Patricio Córdova, Christian Mariño, Ana Pamela Castro, Daysi Ortiz, César Rosero).
- [x] **6.2. Diseño de Tarjetas Individuales (Cards)**
  - Foto de perfil (recortada redonda u ovalada con marco de color primario, 5x5 cm equivalente responsivo).
  - Nombre completo y cargo en REASONS.
  - Iconos interactivos enlazados a sus redes compartidas (ORCID, LinkedIn, Facebook, Instagram, Telegram).
  - Botón "Ver Biografía" que abra un modal detallado.
- [x] **6.3. Modal Detallado de Perfil**
  - Mostrar la biografía completa del investigador.
  - Mostrar su correo institucional y enlace directo a ORCID.
  - Si tiene publicaciones asociadas, cargarlas en una pestaña interna del modal.

---

## Actividad 7: Módulo de Proyectos de Investigación
**Objetivo:** Permitir visualizar los proyectos del grupo y agregar nuevos.

### 📋 Tareas Específicas
- [x] **7.1. Vista de Lista / Grid de Proyectos**
  - Mostrar las tarjetas de proyectos con un diseño similar a las referencias profesionales (ej. *Modelo PROS5.0*).
  - Cada tarjeta debe resumir: Título, Estado (badge de color verde para Activo, azul para Finalizado) y participantes principales.
- [x] **7.2. Detalle del Proyecto**
  - Vista detallada (al hacer click) que despliegue las secciones requeridas:
    1. **Título**
    2. **Participantes** (vínculos directos a los perfiles de investigadores de REASONS)
    3. **Descripción**
    4. **Objetivos**
    5. **Resultados** (con soporte de descargas si aplica)
- [x] **7.3. Formulario de Creación de Proyecto (Administrativo)**
  - Panel administrativo básico (bajo ruta protegida o modo demo) para ingresar nuevos proyectos mediante formulario con validaciones del lado del cliente.

---

## Actividad 8: Módulo de Publicaciones Científicas
**Objetivo:** Mostrar los artículos científicos publicados por los miembros de REASONS.

### 📋 Tareas Específicas
- [x] **8.1. Galería de Artículos Científicos**
  - Mostrar los artículos publicados en una cuadrícula moderna.
  - Incorporar un buscador por palabras clave o autor.
- [x] **8.2. Ficha de Artículo Científico**
  - Mostrar campos estructurados:
    1. **Título**
    2. **Autores** (vínculos a investigadores de REASONS)
    3. **Resumen** (Abstract con opción de "Leer más")
    4. **Cita** (formato APA copiable con un botón "Copiar Cita")
    5. **Portada de la revista** (Renderizado premium de la portada o miniatura con overlay interactivo).
- [x] **8.3. Enlace DOI e Indexación**
  - Agregar botones elegantes hacia Scopus, ORCID, Google Scholar o el portal original del journal mediante el enlace DOI.

---

## Actividad 9: Formulario de Contacto
**Objetivo:** Diseñar un formulario funcional que conecte al público externo con REASONS.

### 📋 Tareas Específicas
- [x] **9.1. Diseño Visual del Módulo de Contacto**
  - Dividir la pantalla en dos columnas en pantallas de escritorio:
    * **Columna 1: Información Institucional**
      + Dirección: Av. de Los Chasquis y Av. Río Payamino. Facultad de Ingeniería en Sistemas, Electrónica e Industrial. Universidad Técnica de Ambato. Ambato – Ecuador.
      + Correo electrónico institucional: reasons@uta.edu.ec
      + Mapa interactivo incrustado (Google Maps de la FISEI - UTA).
    * **Columna 2: Formulario Interactivo**
      + Campos: Nombre Completo, Correo Electrónico (con validación de formato), Asunto, Mensaje.
- [x] **9.2. Formulario Reactivo Angular (ReactiveFormsModule)**
  - Implementar validaciones en tiempo real:
    * Nombre: Requerido, mínimo 3 caracteres.
    * Correo: Requerido, formato email válido.
    * Asunto: Requerido.
    * Mensaje: Requerido, mínimo 10 caracteres.
  - Deshabilitar el botón de envío si el formulario es inválido.
- [x] **9.3. Gestión del Envío y Feedback Visual**
  - Mostrar un Spinner de carga durante el envío.
  - Al recibir respuesta exitosa (200 OK) del backend, mostrar un banner/alerta visual premium: *"¡Mensaje enviado con éxito! Nos comunicaremos contigo pronto"*.
  - Limpiar el formulario.

---

## Actividad 10: Seguridad y Buenas Prácticas
**Objetivo:** Proteger el backend y asegurar un flujo de datos confiable y ético.

### 📋 Tareas Específicas
- [x] **10.1. Seguridad en Backend (Node.js & Express)**
  - Habilitar **Helmet** para configurar cabeceras HTTP de seguridad (prevención de XSS, Clickjacking).
  - Implementar **CORS** restringido únicamente al dominio del frontend de Angular.
  - Aplicar **express-rate-limit** para mitigar ataques de fuerza bruta en el endpoint de contacto (máximo 5 solicitudes por IP cada 15 minutos).
  - Validar y sanitizar todas las entradas de datos en las rutas usando `express-validator` para prevenir inyección SQL e inyección de código.
- [x] **10.2. Seguridad en Frontend (Angular)**
  - Habilitar la sanitización nativa de Angular contra Cross-Site Scripting (XSS) al renderizar contenido HTML dinámico.
  - Configurar políticas de Content Security Policy (CSP).

---

## Actividad 11: Adaptabilidad Multidispositivo (Responsive)
**Objetivo:** Garantizar la visualización perfecta del portal en celulares, tablets, laptops y pantallas de ultra-alta definición.

### 📋 Tareas Específicas
- [x] **11.1. Estrategia CSS Mobile-First**
  - Implementar layouts flexibles con CSS Grid y Flexbox.
  - Definir breakpoints estandarizados en `styles.css` (TailwindCSS v4 integrado):
    * Mobile: `< 640px` (Vista de lista compacta, menús tipo hamburguesa).
    * Tablet: `640px - 1024px` (Vista de 2 columnas de tarjetas).
    * Desktop: `> 1024px` (Estructura de 3/4 columnas, barra de navegación extendida).
- [x] **11.2. Menú de Navegación Responsivo**
  - Crear un menú móvil interactivo que se despliegue lateralmente con una transición suave (Slide In) al presionar el botón hamburguesa, asegurando facilidad de navegación en dispositivos táctiles.
- [x] **11.3. Optimización de Imágenes y Carga**
  - Implementar carga diferida (lazy loading) en las portadas de revistas y fotos de los investigadores.
  - Asegurar que las imágenes de perfil del equipo mantengan la proporción 5x5 cm en pantallas medianas y se adapten de forma circular en móviles.
