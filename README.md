<div align="center">

# 🔍 Resume Lens AI

### AI-Powered Resume Analysis & Optimization Platform

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Nuxt](https://img.shields.io/badge/Nuxt_4-00DC82?style=for-the-badge&logo=nuxtdotjs&logoColor=white)](https://nuxt.com/)
[![Vue.js](https://img.shields.io/badge/Vue_3-4FC08D?style=for-the-badge&logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express_v5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![OpenAI](https://img.shields.io/badge/Gemini_3_Flash-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openrouter.ai/)

**Upload your resume → Get 24+ actionable AI insights in seconds**

[🌐 Live Demo](https://resume-lens.yugendiran.me) · [🐛 Report Bug](../../issues) · [💡 Request Feature](../../issues)

</div>

---

## 📖 Overview

**Resume Lens AI** is a full-stack web application that uses AI to deeply analyze resumes and provide actionable, recruiter-grade feedback. Upload a PDF resume and get a comprehensive analysis covering ATS compatibility, skill gaps, salary estimates, bullet rewrite suggestions, and much more — all powered by **Google Gemini 3 Flash** via OpenRouter.

The platform features passwordless OTP authentication, direct-to-cloud file uploads via Cloudflare R2 presigned URLs, and shareable public reports with social media integration.

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🤖 AI-Powered Analysis

24+ dimensions analyzed including executive summary, section scores, strengths, risks, ATS keywords, and rewrite suggestions

### 🎯 ATS Compatibility Scoring

Dedicated ATS score (0–100) with a pass/fail verdict and specific issues to fix

### 💰 Salary Estimation

Inferred salary range based on experience, skills, and target role with currency and basis

### 📈 Skill Gap Analysis

Side-by-side comparison of current vs. required skill levels with priority ratings (critical, high, medium, low)

</td>
<td width="50%">

### 📝 Smart Bullet Rewrites

Before/after rewrite suggestions with quantified metrics and reasoning for each improvement

### 🔄 Alternative Role Matching

2–4 alternative career paths with fit scores and explanations

### 🏭 Industry Benchmarking

Percentile ranking compared to similar profiles with standout factors

### 🏢 Tailoring Tips

Resume customization advice for different company types (FAANG, Startup, Enterprise)

</td>
</tr>
</table>

**Additional Features:**

- 🔐 **Passwordless Authentication** — Email OTP login via [Resend](https://resend.com)
- 📤 **Direct Cloud Upload** — Presigned URL uploads to Cloudflare R2 (no server bottleneck)
- 🔗 **Shareable Reports** — Toggle public/private visibility with social sharing (WhatsApp, LinkedIn, X, Instagram)
- 🛡️ **Rate Limiting** — 25 requests/minute per IP with express-rate-limit
- 📊 **Usage Limits** — Max 5 resume analyses per user
- 🎨 **Deep Space UI** — Premium dark theme with glassmorphism, grain textures, and micro-animations

---

## 🛠️ Tech Stack

| Layer            | Technology                                                                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Frontend**     | [Nuxt 4](https://nuxt.com/) · [Vue 3](https://vuejs.org/) · [Tailwind CSS 4](https://tailwindcss.com/) · [Pinia](https://pinia.vuejs.org/) |
| **Backend**      | [Express.js v5](https://expressjs.com/) · Node.js (ES Modules)                                                                             |
| **AI Engine**    | [Google Gemini 3 Flash](https://ai.google.dev/) via [OpenRouter](https://openrouter.ai/)                                                   |
| **Database**     | [MySQL 9](https://www.mysql.com/) via `mysql2`                                                                                             |
| **File Storage** | [Cloudflare R2](https://www.cloudflare.com/products/r2/) (S3-compatible)                                                                   |
| **Email**        | [Resend](https://resend.com/)                                                                                                              |
| **Auth**         | JWT (Access Token: 15 min · Refresh Token: 30 days)                                                                                        |

---

## 🗄️ Database Schema

The application uses **3 MySQL tables**. Import the provided `resume_lens.sql` file to set up the database.

### User

| Column      | Type                        | Description                        |
| ----------- | --------------------------- | ---------------------------------- |
| `userId`    | `BIGINT` PK, AUTO_INCREMENT | Unique user identifier             |
| `name`      | `VARCHAR(80)`               | User's full name                   |
| `email`     | `VARCHAR(255)`              | User's email address               |
| `status`    | `ENUM('active','inactive')` | Account status (default: `active`) |
| `createdAt` | `TIMESTAMP`                 | Account creation timestamp         |
| `updatedAt` | `TIMESTAMP`                 | Last update timestamp              |

### Otp

| Column      | Type                               | Description               |
| ----------- | ---------------------------------- | ------------------------- |
| `otpId`     | `BIGINT` PK, AUTO_INCREMENT        | Unique OTP identifier     |
| `email`     | `VARCHAR(255)`                     | Email the OTP was sent to |
| `code`      | `INT`                              | 6-digit OTP code          |
| `expiresAt` | `VARCHAR(50)`                      | Expiration timestamp      |
| `status`    | `ENUM('pending','used','expired')` | OTP lifecycle status      |
| `createdAt` | `TIMESTAMP`                        | OTP creation timestamp    |
| `updatedAt` | `TIMESTAMP`                        | Last update timestamp     |

### Report

| Column      | Type                        | Description               |
| ----------- | --------------------------- | ------------------------- |
| `reportId`  | `BIGINT` PK, AUTO_INCREMENT | Unique report identifier  |
| `userId`    | `BIGINT`                    | Foreign key to `User`     |
| `slug`      | `VARCHAR(80)`               | Unique URL slug (UUID)    |
| `analysis`  | `JSON`                      | Full AI analysis result   |
| `cost`      | `FLOAT`                     | API call cost             |
| `access`    | `ENUM('private','public')`  | Report visibility         |
| `createdAt` | `TIMESTAMP`                 | Report creation timestamp |
| `updatedAt` | `TIMESTAMP`                 | Last update timestamp     |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **MySQL** 8+ or 9+
- **pnpm** (recommended) or npm
- [OpenRouter](https://openrouter.ai/) API key
- [Resend](https://resend.com/) API key
- [Cloudflare R2](https://www.cloudflare.com/products/r2/) bucket

### 1. Clone the Repository

```bash
git clone https://github.com/Yugendiran/resume-lens-ai.git
cd resume-lens-ai
```

### 2. Set Up the Database

```bash
mysql -u root -p -e "CREATE DATABASE resume_lens;"
mysql -u root -p resume_lens < resume_lens.sql
```

### 3. Set Up the Server

```bash
cd server
cp .env.sample .env
# Edit .env with your credentials
pnpm install
pnpm run server:dev
```

### 4. Set Up the Frontend

```bash
cd web
pnpm install
pnpm run dev
```

The app will be available at `http://localhost:3000` (frontend) and `http://localhost:5000` (API).

---

## ⚙️ Environment Variables

### Server (`server/.env`)

| Variable               | Description                                                  |
| ---------------------- | ------------------------------------------------------------ |
| `PORT`                 | Server port (default: `5000`)                                |
| `OPENROUTER_API_KEY`   | API key from [OpenRouter](https://openrouter.ai/)            |
| `RESEND_API_KEY`       | API key from [Resend](https://resend.com/)                   |
| `EMAIL_FROM`           | Sender email (e.g., `Resume Lens <no-reply@yourdomain.com>`) |
| `DB_URL`               | MySQL connection string                                      |
| `ACCESS_TOKEN_SECRET`  | Secret key for JWT access tokens                             |
| `REFRESH_TOKEN_SECRET` | Secret key for JWT refresh tokens                            |
| `R2_ACCESS_KEY_ID`     | Cloudflare R2 access key ID                                  |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 secret access key                              |
| `R2_BUCKET_NAME`       | Cloudflare R2 bucket name                                    |
| `R2_ENDPOINT`          | Cloudflare R2 endpoint URL                                   |

### Frontend (`web/.env`)

| Variable              | Description                                        |
| --------------------- | -------------------------------------------------- |
| `RESUME_LENS_API_URL` | Backend API URL (default: `http://localhost:5000`) |

---

## 🔌 API Endpoints

All endpoints are prefixed with `/resume-lens/api`.

### Public Routes

| Method | Endpoint                 | Description               |
| ------ | ------------------------ | ------------------------- |
| `GET`  | `/status`                | Health check              |
| `POST` | `/auth/login-request`    | Request OTP login         |
| `POST` | `/auth/verify-otp`       | Verify OTP and get tokens |
| `POST` | `/auth/refresh-token`    | Refresh access token      |
| `GET`  | `/public/analysis/:slug` | View public shared report |

### Protected Routes (Requires Bearer Token)

| Method | Endpoint                     | Description                   |
| ------ | ---------------------------- | ----------------------------- |
| `POST` | `/upload/create-signed-url`  | Get presigned R2 upload URL   |
| `POST` | `/process`                   | Submit resume for AI analysis |
| `GET`  | `/reports`                   | List user's analysis reports  |
| `GET`  | `/analysis/:slug`            | Get full analysis by slug     |
| `PUT`  | `/analysis/:slug/visibility` | Toggle report public/private  |

---

## 📊 AI Analysis Dimensions

Resume Lens evaluates resumes across **24 dimensions**:

<table>
<tr>
<td width="50%">

1. **Executive Summary** (1-line & 3-sentence)
2. **Candidate Name**
3. **Inferred Target Role**
4. **Overall Fit** (rating, category, reason)
5. **Section Scores** (7 categories, 0–10)
6. **Top Strengths**
7. **Top Risks / Red Flags**
8. **Missing ATS Keywords**
9. **Rewrite Recommendations** (before/after)
10. **Quantification Opportunities**
11. **Interview Questions**
12. **Next Steps for Candidate**

</td>
<td width="50%">

13. **Next Steps for Hiring Team**
14. **Confidence & Assumptions**
15. **Salary Estimate** (range + currency)
16. **Experience Timeline** (career progression)
17. **Skill Gap Analysis** (current vs required)
18. **Role Match Alternatives** (fit scores)
19. **ATS Compatibility** (score + verdict)
20. **Word Count Analysis** (vs ideal range)
21. **Industry Benchmark** (percentile rank)
22. **Action Verb Analysis** (strong vs weak)
23. **Cultural Fit Signals**
24. **Tailoring Tips** (FAANG/Startup/Enterprise)

</td>
</tr>
</table>

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ by [Yugendiran](https://github.com/Yugendiran)**

[🌐 Live Demo](https://resume-lens.yugendiran.me) · [⭐ Star this repo](../../stargazers) · [🐛 Report Bug](../../issues)

</div>
