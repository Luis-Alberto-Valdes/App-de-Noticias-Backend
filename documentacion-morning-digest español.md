# 📰 Morning Digest - Documentación del Proyecto

## 📋 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Frontend - App de Noticias](#frontend---app-de-noticias)
4. [Backend - App de Noticias Backend](#backend---app-de-noticias-backend)
5. [Base de Datos](#base-de-datos)
6. [API Externa de Noticias](#api-externa-de-noticias)
7. [Endpoints de la API](#endpoints-de-la-api)
8. [Modelos de Validación](#modelos-de-validación)
9. [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
10. [Flujo de Usuario](#flujo-de-usuario)
11. [Instalación y Ejecución](#instalación-y-ejecución)

---

## 📝 Descripción General

**Morning Digest** es una aplicación web que permite a los usuarios recibir un resumen diario de noticias personalizadas en su correo electrónico. Los usuarios pueden:

- 🔐 **Registrarse** con correo electrónico y contraseña
- 📂 **Seleccionar categorías** de noticias de su interés (hasta 5)
- 📧 **Recibir diariamente** noticias personalizadas en su correo
- ❌ **Cancelar suscripción** cuando lo deseen

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────────┐
│                        MORNING DIGEST APP                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────┐         ┌──────────────────────────────┐ │
│  │   FRONTEND (Vite)   │         │    BACKEND (Express.js)       │ │
│  │   App de Noticias   │ ──────► │    App de Noticias Backend   │ │
│  │   Puerto: 5173      │  HTTPS  │    Puerto: Render (3000)     │ │
│  └──────────────────────┘         └──────────────────────────────┘ │
│              │                                    │                  │
│              │                                    ▼                  │
│              │                    ┌──────────────────────────────┐ │
│              │                    │     PostgreSQL Database     │ │
│              │                    │     (Supabase/Neon)         │ │
│              │                    └──────────────────────────────┘ │
│              │                                    │                  │
│              │                                    ▼                  │
│              │                    ┌──────────────────────────────┐ │
│              │                    │   NewsData.io API           │ │
│              │                    │   (Noticias en tiempo real) │ │
│              │                    └──────────────────────────────┘ │
│              │                                    │                  │
│              │                                    ▼                  │
│              │                    ┌──────────────────────────────┐ │
│              └───────────────────►│   Resend (Email Service)     │ │
│                                   │   (Envío de newsletters)     │ │
│                                   └──────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 💻 Frontend - App de Noticias

### Tecnologías Utilizadas

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Vite** | 7.2.5 | Build tool y servidor de desarrollo |
| **Vanilla JavaScript** | ES6+ | Lógica del cliente |
| **CSS3** | - | Estilos personalizados |
| **ESLint** | 9.39.2 | Linting de código |

### Estructura de Archivos

```
App de Noticias/
├── index.html                  # Página principal (Landing)
├── public/
│   ├── subscribe.html          # Página de suscripción
│   ├── unsubscribe.html        # Página de cancelación
│   ├── src/
│   │   ├── main.js             # Lógica de formularios
│   │   ├── style.css           # Estilos principales
│   │   ├── subscribe.css       # Estilos de suscripción
│   │   ├── unsubscribe.css      # Estilos de cancelación
│   │   └── modern-normalize.css # Normalización de estilos
│   ├── icons/                  # Iconos del sitio
│   └── assets/                 # Imágenes y recursos
├── package.json
└── vite.config.js
```

### Páginas del Frontend

#### 1. Landing Page (`index.html`)
- Título: "Morning Digest — Personalized Daily News"
- Información sobre el servicio
- Instrucciones de uso (3 pasos)
- Botones de suscripción y cancelación
- Footer con enlaces a GitHub y LinkedIn

#### 2. Página de Suscripción (`subscribe.html`)
- Formulario con validación:
  - Email (validación de formato)
  - Contraseña (mínimo 6 caracteres)
  - Confirmar contraseña (debe coincidir)
  - Selección de categorías (1-5 categorías obligatorias)
- 9 categorías disponibles:
  - Education, Health, Politics, Business
  - Entertainment, Lifestyle, Science, Sports, Technology

#### 3. Página de Cancelación (`unsubscribe.html`)
- Formulario con validación:
  - Email
  - Contraseña

### Validación del Frontend

```javascript
// Validaciones implementadas en main.js
- Email: Formato válido de correo electrónico
- Contraseña: Entre 6 y 30 caracteres
- Confirmación: Debe coincidir con la contraseña
- Categorías: Mínimo 1, máximo 5
```

### Estilos (CSS)

El diseño utiliza:
- **Tipografía**: Playfair Display (títulos) y Montserrat (cuerpo)
- **Paleta de colores**:
  - Primario: `#0e8791` (turquesa)
  - Secundario: `#f0a500` (dorado)
  - Fondo: `#f4f6f8` a `#ffffff`
  - Texto: `#2e3a45`
- **Animaciones**: slideDown, slideIn, zoomIn

---

## 🖥️ Backend - App de Noticias Backend

### Tecnologías Utilizadas

| Tecnología | Propósito |
|------------|-----------|
| **Express.js** | Framework web |
| **PostgreSQL** | Base de datos |
| **pg** | Cliente PostgreSQL |
| **JWT** | Tokens de autenticación |
| **bcrypt** | Hash de contraseñas |
| **Zod** | Validación de datos |
| **EJS** | Motor de plantillas |
| **Resend** | Servicio de correo |
| **CORS** | Configuración CORS |

### Estructura de Archivos

```
App de Noticias Backend/
├── index.js                    # Punto de entrada
├── package.json
├── src/
│   ├── controllers/
│   │   └── noticias.js         # Controladores de noticias
│   ├── models/
│   │   └── noticia.js          # Modelos y lógica de BD
│   ├── routes/
│   │   └── noticias.js        # Definición de rutas
│   ├── schemas/
│   │   └── loginValidation.js  # Esquemas de validación Zod
│   ├── utils/
│   │   ├── errors.js           # Códigos de error HTTP
│   │   └── emails.js           # Funciones de envío de correo
│   └── views/
│       ├── verification-email.ejs    # Plantilla email de verificación
│       ├── notices-email.ejs         # Plantilla email de noticias
│       └── verification-page.ejs    # Página de verificación
```

### Configuración del Servidor

```
javascript
// Configuración en index.js
- Express con JSON middleware
- Motor de vistas EJS
- CORS habilitado para POST, DELETE, GET
- Puerto: Variable de entorno PORT
```

---

## 🗄️ Base de Datos

### Esquema de PostgreSQL

#### Tabla: `users`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `user_id` | SERIAL | ID único del usuario |
| `user_email` | VARCHAR(255) | Correo electrónico único |
| `user_password` | VARCHAR(255) | Contraseña hasheada |
| `verification` | BOOLEAN | Estado de verificación |
| `verification_token` | VARCHAR(255) | Token de verificación |
| `created_at` | TIMESTAMP | Fecha de creación |

#### Tabla: `categories`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `categories_id` | SERIAL | ID único de categoría |
| `categories_name` | VARCHAR(50) | Nombre de la categoría |
| `user_id` | INTEGER | FK a users.user_id |

### Consultas Principales

```
sql
-- Obtener usuarios verificados con sus categorías
SELECT user_email, json_agg(categories_name) AS categories 
FROM users 
JOIN categories ON categories.user_id = users.user_id 
WHERE verification = true
GROUP BY user_email
```

---

## 📡 API Externa de Noticias

### NewsData.io Integration

La aplicación utiliza la API de **NewsData.io** para obtener noticias en tiempo real.

```
javascript
// Endpoint utilizado
GET https://newsdata.io/api/1/latest

// Parámetros:
- apikey: KEY de entorno
- language: en
- country: us
- category: [categorías del usuario]
- image: 1
- removeduplicate: 1
- sort: pubdateasc
- size: 5
```

### Categorías Soportadas

- `education` - Educación
- `health` - Salud
- `business` - Negocios
- `entertainment` - Entretenimiento
- `lifestyle` - Estilo de vida
- `politics` - Política
- `science` - Ciencia
- `sports` - Deportes
- `technology` - Tecnología

---

## 🔌 Endpoints de la API

### Base URL
```
https://app-de-noticias-backend.onrender.com/noticias
```

### 1. GET `/noticias`

Obtiene las noticias de los usuarios verificados y las envía por correo.

**Método:** `GET`

**Respuesta Exitosa (200):**
```
json
{
  "status": 200
}
```

### 2. POST `/noticias`

Registra un nuevo usuario.

**Método:** `POST`

**Cuerpo de la Solicitud:**
```
json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123",
  "categories": ["technology", "business", "sports"]
}
```

**Categorías válidas:**
```
json
["education", "health", "business", "entertainment", "lifestyle", "politics", "science", "sports", "technology"]
```

**Respuesta Exitosa (201):**
```
json
{
  "message": "User registered successfully check your email for verification code!"
}
```

**Posibles Errores:**
- 400: Email inválido, contraseña muy corta/larga, categorías inválidas
- 409: Usuario ya existe

### 3. DELETE `/noticias`

Cancela la suscripción de un usuario.

**Método:** `DELETE`

**Cuerpo de la Solicitud:**
```
json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Respuesta Exitosa (200):**
```
json
{
  "message": "User Deleted"
}
```

**Posibles Errores:**
- 400: Usuario no encontrado, contraseña incorrecta

### 4. GET `/noticias/verify`

Verifica la cuenta del usuario mediante token.

**Método:** `GET`

**Parámetros de Consulta:**
```
?token={jwt_token}
```

**Respuesta Exitosa (200):**
Renderiza página de verificación con mensaje de éxito.

**Posibles Errores:**
- 401: Token inválido o expirado

---

## ✅ Modelos de Validación

### Esquema de Registro (Zod)

```javascript
const registerSchema = z.object({
  email: z.email({
    error: 'Invalid email'
  }),
  password: z.string()
    .min(6, 'Password is too short')
    .max(50, 'Password is too long'),
  categories: z.array(
    z.enum(['education', 'health', 'business', 'entertainment', 
            'lifestyle', 'politics', 'science', 'sports', 'technology'])
  ).nonempty('Required fields are missing')
})
```

### Esquema de Cancelación (Zod)

```
javascript
const unregisterSchema = z.object({
  email: z.email({
    error: 'Invalid email'
  }),
  password: z.string()
    .min(6, 'Password is too short')
    .max(50, 'Password is too long')
})
```

---

## ⚙️ Configuración de Variables de Entorno

### Backend (.env)

```
env
# Puerto del servidor
PORT=3000

# Clave API de NewsData.io
KEY=tu_api_key_de_newsdata

# Clave secreta para JWT
SECRET_KEY=tu_secreto_jwt

# URL de la base de datos PostgreSQL
DATABASE_URL=postgresql://usuario:password@host:5432/database

# API Key de Resend
RESEND_API_KEY=re_123456789

# Email remitente
EMAIL_FROM=onboarding@resend.dev

# Rounds para bcrypt
SALT_ROUNDS=10
```

---

## 🔄 Flujo de Usuario

### Flujo de Suscripción

```
1. Usuario visita landing page
        ↓
2. Hace clic en "Subscribe"
        ↓
3. Completa formulario:
   - Ingresa email
   - Ingresa contraseña
   - Confirma contraseña
   - Selecciona 1-5 categorías
        ↓
4. Envía formulario (POST /noticias)
        ↓
5. Backend:
   - Valida datos con Zod
   - Hashea contraseña con bcrypt
   - Crea usuario en BD
   - Crea registro de categorías
   - Genera token JWT
   - Envía email de verificación
        ↓
6. Usuario recibe email con enlace
        ↓
7. Hace clic en enlace de verificación
        ↓
8. Backend verifica token JWT
        ↓
9. Actualiza estado de verificación en BD
        ↓
10. Usuario recibe noticias diarias
```

### Flujo de Cancelación

```
1. Usuario visita landing page
        ↓
2. Hace clic en "Unsubscribe"
        ↓
3. Ingresa email y contraseña
        ↓
4. Envía formulario (DELETE /noticias)
        ↓
5. Backend:
   - Valida credenciales
   - Elimina categorías del usuario
   - Elimina usuario de la BD
        ↓
6. Usuario recibe confirmación
```

### Flujo de Envío de Noticias

```
1. Sistema ejecutable (cron job externo)
        ↓
2. GET /noticias
        ↓
3. Backend:
   - Consulta usuarios verificados
   - Agrupa por categorías
        ↓
4. Para cada usuario:
   - Obtiene noticias de NewsData.io
   - Renderiza plantilla EJS
        ↓
5. Envía email con Resend
        ↓
6. Usuario recibe noticias personalizadas
```

---

## 🚀 Instalación y Ejecución

### Prerrequisitos

- Node.js (v18+)
- PostgreSQL (local o remoto)
- Cuenta de NewsData.io o otro tipo de servicio de noticias
- Cuenta de Resend o otro tipo de servicio de envio de correos

### Frontend

```
bash
# Navegar al directorio
cd "App de Noticias"

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build
```

### Backend

```
bash
# Navegar al directorio
cd "App de Noticias Backend"

# Instalar dependencias
npm install

# Crear archivo .env con variables de entorno

# Ejecutar en desarrollo
npm run dev

# Ejecutar en producción
npm start
```

### Configuración de Base de Datos

```sql
-- Crear tablas
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  user_email VARCHAR(255) UNIQUE NOT NULL,
  user_password VARCHAR(255) NOT NULL,
  verification BOOLEAN DEFAULT false,
  verification_token VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  categories_id SERIAL PRIMARY KEY,
  categories_name VARCHAR(50) NOT NULL,
  user_id INTEGER REFERENCES users(user_id)
);
```

---

## 📊 Diagramas de Flujo

### Diagrama de Arquitectura de Datos

```
┌─────────────┐     ┌─────────────┐
│    User     │     │  Category   │
├─────────────┤     ├─────────────┤
│ user_id  (PK)     │category_id (PK) 
│ user_email   │◄───┤user_id  (FK)│
│ user_password    │categories_   │
│ verification     │    name      │
│ verification_    │              │
│    token         │              │
└─────────────┘     └─────────────┘
```

### Diagrama de Interacciones

```
┌────────┐     ┌────────┐     ┌────────┐     ┌────────┐
│ Client │────►│Backend │────►│  DB    │────►│ Email  │
│        │     │Express │     │   pg   │     │Resend  │
└────────┘     └────────┘     └────────┘     └────────┘
                   │
                   ▼
              ┌────────┐
              │NewsData│
              │  .io   │
              └────────┘
```

---

## 🔧 Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 | OK |
| 201 | Creado |
| 204 | Eliminado |
| 400 | Solicitud incorrecta |
| 401 | No autorizado |
| 403 | Prohibido |
| 404 | No encontrado |
| 409 | Conflicto |
| 500 | Error interno del servidor |

---

## 📝 Notas Adicionales

1. **Seguridad**: Las contraseñas se hashean con bcrypt antes de almacenarse.
2. **Verificación**: Los usuarios deben verificar su email antes de recibir noticias.
3. **Límites**: 
   - Máximo 5 categorías por usuario
   - Mínimo 1 categoría requerida
   - Contraseña entre 6 y 50 caracteres
4. **Email**: El servicio de email utiliza Resend para el envío.
5. **API Externa**: NewsData.io proporciona las noticias en tiempo real.

---

## 👤 Autor

**Luis Alberto Valdes**

- GitHub: [Luis-Alberto-Valdes](https://github.com/Luis-Alberto-Valdes/)

---

## 🔗 Enlaces

- **Frontend (Producción)**: [Morning Digest](https://www.netlify.com/)
- **Backend (Producción)**: [App de Noticias Backend](https://render.com/)
- **API de Noticias**: [NewsData.io](https://newsdata.io/)
- **Servicio de Email**: [Resend](https://resend.com/)

---


