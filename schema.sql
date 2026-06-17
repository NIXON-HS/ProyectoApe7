-- ==========================================
-- SCRIPT DDL: Creación de la Base de Datos
-- Proyecto: Portal Web del Grupo de Investigación REASONS (UTA)
-- Motor de Base de Datos: PostgreSQL
-- ==========================================

-- 1. Eliminación de tablas previas en orden inverso de dependencias (para desarrollo limpio)
DROP TABLE IF EXISTS publicacion_investigador CASCADE;
DROP TABLE IF EXISTS proyecto_investigador CASCADE;
DROP TABLE IF EXISTS contactos CASCADE;
DROP TABLE IF EXISTS publicaciones CASCADE;
DROP TABLE IF EXISTS proyectos CASCADE;
DROP TABLE IF EXISTS lineas_investigacion CASCADE;
DROP TABLE IF EXISTS investigadores CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS noticias CASCADE;
DROP TABLE IF EXISTS visitas CASCADE;

-- Eliminación de tipos ENUM previos si existen
DROP TYPE IF EXISTS posicion_enum CASCADE;
DROP TYPE IF EXISTS estado_proyecto_enum CASCADE;

-- ==========================================
-- 2. Creación de Tipos ENUM Personalizados
-- ==========================================
CREATE TYPE posicion_enum AS ENUM ('Director', 'Subdirector', 'Investigador');
CREATE TYPE estado_proyecto_enum AS ENUM ('Activo', 'Finalizado', 'Propuesta');

-- ==========================================
-- 3. Creación de Tablas Base
-- ==========================================

-- Tabla: investigadores (Datos del equipo de investigación)
CREATE TABLE investigadores (
    id SERIAL PRIMARY KEY,
    nombres VARCHAR(150) NOT NULL,
    orcid VARCHAR(50) UNIQUE,
    correo_institucional VARCHAR(150) UNIQUE NOT NULL,
    biografia TEXT NOT NULL,
    posicion posicion_enum NOT NULL,
    foto_url VARCHAR(255) DEFAULT NULL,
    red_facebook VARCHAR(255) DEFAULT NULL,
    red_linkedin VARCHAR(255) DEFAULT NULL,
    red_instagram VARCHAR(255) DEFAULT NULL,
    red_telegram VARCHAR(255) DEFAULT NULL
);

-- Tabla: lineas_investigacion (Líneas de investigación institucionales)
CREATE TABLE lineas_investigacion (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    abreviatura VARCHAR(50) NOT NULL
);

-- Tabla: proyectos (Proyectos de investigación)
CREATE TABLE proyectos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    objetivos TEXT NOT NULL,
    resultados TEXT NOT NULL,
    estado estado_proyecto_enum DEFAULT 'Activo' NOT NULL,
    linea_id INT NOT NULL,
    CONSTRAINT fk_proyectos_lineas FOREIGN KEY (linea_id)
        REFERENCES lineas_investigacion(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- Tabla: publicaciones (Artículos científicos)
CREATE TABLE publicaciones (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    resumen TEXT NOT NULL,
    cita TEXT NOT NULL,
    revista_portada_url VARCHAR(255) DEFAULT NULL,
    doi_url VARCHAR(255) DEFAULT NULL,
    linea_id INT DEFAULT NULL,
    CONSTRAINT fk_publicaciones_lineas FOREIGN KEY (linea_id)
        REFERENCES lineas_investigacion(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

-- Tabla: contactos (Mensajes recibidos del formulario)
CREATE TABLE contactos (
    id SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    correo VARCHAR(150) NOT NULL,
    asunto VARCHAR(150) NOT NULL,
    mensaje TEXT NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Tabla: usuarios (Administradores del sistema)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombres VARCHAR(150) NOT NULL,
    correo VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(50) DEFAULT 'admin' NOT NULL
);

-- Tabla: visitas (Contador de visitas a la página)
CREATE TABLE visitas (
    id SERIAL PRIMARY KEY,
    contador INTEGER NOT NULL DEFAULT 0
);

-- Tabla: noticias (Noticias y Eventos del Grupo)
CREATE TABLE noticias (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    resumen TEXT NOT NULL,
    contenido TEXT NOT NULL,
    contenido_json TEXT, -- JSON structure for the block editor
    imagen_url VARCHAR(255) DEFAULT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    categoria VARCHAR(100) DEFAULT 'General' NOT NULL,
    activo BOOLEAN DEFAULT TRUE NOT NULL
);

-- ==========================================
-- 4. Creación de Tablas de Relación N:M
-- ==========================================

-- Tabla: proyecto_investigador (Relación N:M para coautoría/participación en proyectos)
CREATE TABLE proyecto_investigador (
    proyecto_id INT NOT NULL,
    investigador_id INT NOT NULL,
    rol_proyecto VARCHAR(100) DEFAULT NULL,
    PRIMARY KEY (proyecto_id, investigador_id),
    CONSTRAINT fk_pi_proyecto FOREIGN KEY (proyecto_id)
        REFERENCES proyectos(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_pi_investigador FOREIGN KEY (investigador_id)
        REFERENCES investigadores(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- Tabla: publicacion_investigador (Relación N:M para coautoría en artículos científicos)
CREATE TABLE publicacion_investigador (
    publicacion_id INT NOT NULL,
    investigador_id INT NOT NULL,
    rol_publicacion VARCHAR(100) DEFAULT NULL,
    PRIMARY KEY (publicacion_id, investigador_id),
    CONSTRAINT fk_pubi_publicacion FOREIGN KEY (publicacion_id)
        REFERENCES publicaciones(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_pubi_investigador FOREIGN KEY (investigador_id)
        REFERENCES investigadores(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- ==========================================
-- 5. Creación de Índices para Optimización
-- ==========================================

-- Índices en campos de búsqueda e inicio de sesión frecuentes
CREATE INDEX idx_investigadores_correo ON investigadores(correo_institucional);
CREATE INDEX idx_proyectos_titulo ON proyectos(titulo);
CREATE INDEX idx_publicaciones_titulo ON publicaciones(titulo);
CREATE INDEX idx_noticias_fecha ON noticias(fecha);

-- Índices adicionales para optimizar uniones de claves foráneas
CREATE INDEX idx_proyectos_linea_id ON proyectos(linea_id);
CREATE INDEX idx_publicaciones_linea_id ON publicaciones(linea_id);
CREATE INDEX idx_pi_investigador_id ON proyecto_investigador(investigador_id);
CREATE INDEX idx_pubi_investigador_id ON publicacion_investigador(investigador_id);
