# 📰 Morning Digest - Project Documentation

## 📋 Table of Contents

1. [General Description](#general-description)
2. [System Architecture](#system-architecture)
3. [Frontend - App de Noticias](#frontend---app-de-noticias)
4. [Backend - App de Noticias Backend](#backend---app-de-noticias-backend)
5. [Database](#database)
6. [External News API](#external-news-api)
7. [API Endpoints](#api-endpoints)
8. [Validation Models](#validation-models)
9. [Environment Variables Configuration](#environment-variables-configuration)
10. [User Flow](#user-flow)
11. [Installation and Execution](#installation-and-execution)

---

## 📝 General Description

**Morning Digest** is a web application that allows users to receive a daily summary of personalized news in their email. Users can:

- 🔐 **Register** with email and password
- 📂 **Select news categories** of their interest (up to 5)
- 📧 **Receive daily** personalized news in their email
- ❌ **Unsubscribe** whenever they want

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        MORNING DIGEST APP                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────┐         ┌──────────────────────────────┐ │
│  │   FRONTEND (Vite)   │         │    BACKEND (Express.js)       │ │
│  │   App de Noticias   │ ──────► │    App de Noticias Backend   │ │
│  │   Port: 5173        │  HTTPS  │    Port: Render (3000)       │ │
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
│              │                    │   (Real-time News)          │ │
│              │                    └──────────────────────────────┘ │
│              │                                    │                  │
│              │                                    ▼                  │
│              │                    ┌──────────────────────────────┐ │
│              └───────────────────►│   Resend (Email Service)    │ │
│                                   │   (Newsletter sending)      │ │
│                                   └──────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 💻 Frontend - App de Noticias

### Technologies Used

| Technology | Version | Purpose |
|------------|---------|---------|
| **Vite** | 7.2.5 | Build tool and development server |
| **Vanilla JavaScript** | ES6+ | Client logic |
| **CSS3** | - | Custom styles |
| **ESLint** | 9.39.2 | Code linting |

### File Structure

```
App de Noticias/
├── index.html                  # Main page (Landing)
├── public/
│   ├── subscribe.html          # Subscription page
│   ├── unsubscribe.html        # Unsubscription page
│   ├── src/
│   │   ├── main.js             # Form logic
│   │   ├── style.css           # Main styles
│   │   ├── subscribe.css       # Subscription styles
│   │   ├── unsubscribe.css     # Unsubscription styles
│   │   └── modern-normalize.css # Style normalization
│   ├── icons/                  # Site icons
│   └── assets/                 # Images and resources
├── package.json
└── vite.config.js
```

### Frontend Pages

#### 1. Landing Page (`index.html`)
- Title: "Morning Digest — Personalized Daily News"
- Information about the service
- Usage instructions (3 steps)
- Subscription and unsubscription buttons
- Footer with links to GitHub and LinkedIn

#### 2. Subscription Page (`subscribe.html`)
- Form with validation:
  - Email (format validation)
  - Password (minimum 6 characters)
  - Confirm password (must match)
  - Category selection (1-5 categories required)
- 9 available categories:
  - Education, Health, Politics, Business
  - Entertainment, Lifestyle, Science, Sports, Technology

#### 3. Unsubscription Page (`unsubscribe.html`)
- Form with validation:
  - Email
  - Password

### Frontend Validation

```
javascript
// Validations implemented in main.js
- Email: Valid email format
- Password: Between 6 and 30 characters
- Confirmation: Must match password
- Categories: Minimum 1, maximum 5
```

### Styles (CSS)

The design uses:
- **Typography**: Playfair Display (titles) and Montserrat (body)
- **Color palette**:
  - Primary: `#0e8791` (turquoise)
  - Secondary: `#f0a500` (gold)
  - Background: `#f4f6f8` to `#ffffff`
  - Text: `#2e3a45`
- **Animations**: slideDown, slideIn, zoomIn

---

## 🖥️ Backend - App de Noticias Backend

### Technologies Used

| Technology | Purpose |
|------------|---------|
| **Express.js** | Web framework |
| **PostgreSQL** | Database |
| **pg** | PostgreSQL client |
| **JWT** | Authentication tokens |
| **bcrypt** | Password hashing |
| **Zod** | Data validation |
| **EJS** | Template engine |
| **Resend** | Email service |
| **CORS** | CORS configuration |

### File Structure

```
App de Noticias Backend/
├── index.js                    # Entry point
├── package.json
├── src/
│   ├── controllers/
│   │   └── noticias.js         # News controllers
│   ├── models/
│   │   └── noticia.js          # Models and DB logic
│   ├── routes/
│   │   └── noticias.js         # Route definitions
│   ├── schemas/
│   │   └── loginValidation.js  # Zod validation schemas
│   ├── utils/
│   │   ├── errors.js           # HTTP error codes
│   │   └── emails.js           # Email sending functions
│   └── views/
│       ├── verification-email.ejs    # Verification email template
│       ├── notices-email.ejs         # News email template
│       └── verification-page.ejs    # Verification page
```

### Server Configuration

```
javascript
// Configuration in index.js
- Express with JSON middleware
- EJS view engine
- CORS enabled for POST, DELETE, GET
- Port: PORT environment variable
```

---

## 🗄️ Database

### PostgreSQL Schema

#### Table: `users`

| Field | Type | Description |
|-------|------|-------------|
| `user_id` | SERIAL | Unique user ID |
| `user_email` | VARCHAR(255) | Unique email |
| `user_password` | VARCHAR(255) | Hashed password |
| `verification` | BOOLEAN | Verification status |
| `verification_token` | VARCHAR(255) | Verification token |
| `created_at` | TIMESTAMP | Creation date |

#### Table: `categories`

| Field | Type | Description |
|-------|------|-------------|
| `categories_id` | SERIAL | Unique category ID |
| `categories_name` | VARCHAR(50) | Category name |
| `user_id` | INTEGER | FK to users.user_id |

### Main Queries

```
sql
-- Get verified users with their categories
SELECT user_email, json_agg(categories_name) AS categories 
FROM users 
JOIN categories ON categories.user_id = users.user_id 
WHERE verification = true
GROUP BY user_email
```

---

## 📡 External News API

### NewsData.io Integration

The application uses **NewsData.io** API to get real-time news.

```
javascript
// Endpoint used
GET https://newsdata.io/api/1/latest

// Parameters:
- apikey: Environment KEY
- language: en
- country: us
- category: [user categories]
- image: 1
- removeduplicate: 1
- sort: pubdateasc
- size: 5
```

### Supported Categories

- `education` - Education
- `health` - Health
- `business` - Business
- `entertainment` - Entertainment
- `lifestyle` - Lifestyle
- `politics` - Politics
- `science` - Science
- `sports` - Sports
- `technology` - Technology

---

## 🔌 API Endpoints

### Base URL
```
https://app-de-noticias-backend.onrender.com/noticias
```

### 1. GET `/noticias`

Gets the news of verified users and sends them via email.

**Method:** `GET`

**Successful Response (200):**
```
json
{
  "status": 200
}
```

### 2. POST `/noticias`

Registers a new user.

**Method:** `POST`

**Request Body:**
```
json
{
  "email": "user@example.com",
  "password": "password123",
  "categories": ["technology", "business", "sports"]
}
```

**Valid categories:**
```
json
["education", "health", "business", "entertainment", "lifestyle", "politics", "science", "sports", "technology"]
```

**Successful Response (201):**
```
json
{
  "message": "User registered successfully check your email for verification code!"
}
```

**Possible Errors:**
- 400: Invalid email, password too short/long, invalid categories
- 409: User already exists

### 3. DELETE `/noticias`

Unsubscribes a user.

**Method:** `DELETE`

**Request Body:**
```
json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Successful Response (200):**
```
json
{
  "message": "User Deleted"
}
```

**Possible Errors:**
- 400: User not found, incorrect password

### 4. GET `/noticias/verify`

Verifies the user account via token.

**Method:** `GET`

**Query Parameters:**
```
?token={jwt_token}
```

**Successful Response (200):**
Renders verification page with success message.

**Possible Errors:**
- 401: Invalid or expired token

---

## ✅ Validation Models

### Registration Schema (Zod)

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

### Unregistration Schema (Zod)

```javascript

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

## ⚙️ Environment Variables Configuration

### Backend (.env)

```
env
# Server port
PORT=3000

# NewsData.io API key
KEY=your_newsdata_api_key

# JWT secret key
SECRET_KEY=your_jwt_secret

# PostgreSQL database URL
DATABASE_URL=postgresql://user:password@host:5432/database

# Resend API Key
RESEND_API_KEY=re_123456789

# Sender email
EMAIL_FROM=onboarding@resend.dev

# Bcrypt rounds
SALT_ROUNDS=10
```

---

## 🔄 User Flow

### Subscription Flow

```
1. User visits landing page
        ↓
2. Clicks "Subscribe"
        ↓
3. Fills form:
   - Enters email
   - Enters password
   - Confirms password
   - Selects 1-5 categories
        ↓
4. Submits form (POST /noticias)
        ↓
5. Backend:
   - Validates data with Zod
   - Hashes password with bcrypt
   - Creates user in DB
   - Creates category records
   - Generates JWT token
   - Sends verification email
        ↓
6. User receives email with link
        ↓
7. Clicks verification link
        ↓
8. Backend verifies JWT token
        ↓
9. Updates verification status in DB
        ↓
10. User receives daily news
```

### Unsubscription Flow

```
1. User visits landing page
        ↓
2. Clicks "Unsubscribe"
        ↓
3. Enters email and password
        ↓
4. Submits form (DELETE /noticias)
        ↓
5. Backend:
   - Validates credentials
   - Deletes user categories
   - Deletes user from DB
        ↓
6. User receives confirmation
```

### News Sending Flow

```
1. Executable system (external cron job)
        ↓
2. GET /noticias
        ↓
3. Backend:
   - Queries verified users
   - Groups by categories
        ↓
4. For each user:
   - Gets news from NewsData.io
   - Renders EJS template
        ↓
5. Sends email with Resend
        ↓
6. User receives personalized news
```

---

## 🚀 Installation and Execution

### Prerequisites

- Node.js (v18+)
- PostgreSQL (local or remote)
- NewsData.io account or other news service
- Resend account or other email sending service

### Frontend

```
bash
# Navigate to directory
cd "App de Noticias"

# Install dependencies
npm install

# Run in development
npm run dev

# Build for production
npm run build
```

### Backend

```
bash
# Navigate to directory
cd "App de Noticias Backend"

# Install dependencies
npm install

# Create .env file with environment variables

# Run in development
npm run dev

# Run in production
npm start
```

### Database Configuration

```
sql
-- Create tables
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

## 📊 Flow Diagrams

### Data Architecture Diagram

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

### Interaction Diagram

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

## 🔧 HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK |
| 201 | Created |
| 204 | Deleted |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

---

## 📝 Additional Notes

1. **Security**: Passwords are hashed with bcrypt before storage.
2. **Verification**: Users must verify their email before receiving news.
3. **Limits**:
   - Maximum 5 categories per user
   - Minimum 1 category required
   - Password between 6 and 50 characters
4. **Email**: The email service uses Resend for sending.
5. **External API**: NewsData.io provides real-time news.

---

## 👤 Author

**Luis Alberto Valdes**

- GitHub: [Luis-Alberto-Valdes](https://github.com/Luis-Alberto-Valdes/)

---

## 🔗 Links

- **Frontend (Production)**: [Netlify](https://www.netlify.com/)
- **Backend (Production)**: [Render](https://render.com/)
- **News API**: [NewsData.io](https://newsdata.io/)
- **Email Service**: [Resend](https://resend.com/)

---
