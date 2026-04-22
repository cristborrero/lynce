# LYNCE

> Absolute Visibility. Seamless Security.
  Scan any site in seconds. Get actionable PDF reports.

[![Built with Next.js 16.1](https://img.shields.io/badge/Built%20with-Next.js%2016.1-black?logo=next.js)](https://nextjs.org/)
[![Python 3.13 + FastAPI](https://img.shields.io/badge/Backend-Python%203.13%20%2B%20FastAPI-blue?logo=python)](https://fastapi.tiangolo.com/)
[![Powered by Supabase](https://img.shields.io/badge/Database-Supabase-green?logo=supabase)](https://supabase.com/)
[![License MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status: Active](https://img.shields.io/badge/Status-Active-success)](https://github.com/)

---

## ✦ What is LYNCE?

LYNCE is named after Lynceus — the Argonaut whose sight was so powerful he could see through walls and rock. In a modern web ecosystem, LYNCE brings that same radical transparency: exposed server files, misconfigurations, and silent vulnerabilities become instantly visible.

LYNCE is a comprehensive security auditing SaaS designed specifically for the modern web ecosystem. By leveraging advanced scanning engines and industry-standard APIs, it provides instant visibility into a website's security posture, identifying everything from SSL misconfigurations to exposed sensitive server files.

The platform is built for WordPress owners, digital agencies, and security-conscious developers who need a reliable, automated way to monitor their digital assets. While simple enough for a single site owner, its architecture is robust enough to handle high-volume agency portfolios with professional white-label reporting.

Security shouldn't be an afterthought. With over 43% of the web running on WordPress, the vast majority of sites are misconfigured and vulnerable to known exploits. LYNCE bridges the gap between complex security audits and actionable intelligence, helping you secure your site before attackers do.

---

## ✦ Key Features

- 🔒 **SSL/TLS Analysis** — Deep dive into certificate validity, expiry dates, and TLS protocol versions.
- 🛡️ **Security Headers** — Verification of CSP, HSTS, X-Frame-Options, and other critical defensive headers.
- 🔍 **WordPress Detection** — Proactive detection of version exposure and directory enumeration risks.
- 📁 **Sensitive File Exposure** — Automated probing for `wp-config.php`, `.env`, `.git`, and `xmlrpc.php`.
- 🚫 **Blacklist Check** — Real-time integration with Google Safe Browsing API to detect malware or phishing reports.
- 📄 **PDF Reports** — Generation of professional, board-ready audit reports for clients or compliance.
- ⚡ **Instant Results** — Optimized scanner engine completes a full multi-point audit in under 10 seconds.
- 📊 **Score System** — Intuitive 0-100 security score based on weighted risk deductions and a final security grade.

---

## ✦ Tech Stack

| Layer | Technology | Version |
| :--- | :--- | :--- |
| **Frontend** | Next.js (App Router) + React | 16.1+ / 19 |
| **Styling** | Tailwind CSS + shadcn/ui | 4.0 / Latest |
| **Animations**| Framer Motion | Latest |
| **Backend** | Python + FastAPI | 3.13+ |
| **Server** | Uvicorn | Latest |
| **Database** | Supabase (PostgreSQL) | Latest |
| **PDF** | WeasyPrint | 61.0+ |
| **Security** | Google Safe Browsing + WPScan| API Integration |
| **Typography**| Geist (Vercel) | 1.7.0 |

---

## ✦ Getting Started

### Prerequisites
- **Node.js 20+**
- **Python 3.13+**
- **Supabase Account** (for database and auth)
- **Google Safe Browsing API Key** (optional for blacklist checks)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-repo/security-site-saas.git
   cd security-site-saas
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   # Create .env and add your keys
   touch .env
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install --legacy-peer-deps
   # Create .env.local and add Supabase keys
   touch .env.local
   ```

4. **Database Initialization**
   Apply the schema found in `database/schema.sql` directly into your Supabase SQL Editor.

5. **Running the Platform**
   Start the backend (from `/backend`):
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   Start the frontend (from `/frontend`):
   ```bash
   npm run dev
   ```

---

## ✦ Environment Variables

### Backend (`.env`)
| Variable | Description | Required |
| :--- | :--- | :--- |
| `SUPABASE_URL` | Your Supabase Project URL | Yes |
| `SUPABASE_KEY` | Supabase Anon Key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY`| Supabase Service Role Key | No |
| `GOOGLE_SAFE_BROWSING_API_KEY`| API Key from Google Cloud | No |
| `WPSCAN_API_KEY` | API Key from wpscan.com | No |
| `SECRET_KEY` | FastAPI Auth Secret | Yes |

### Frontend (`.env.local`)
| Variable | Description | Required |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`| Supabase Anon Key | Yes |
| `NEXT_PUBLIC_API_URL` | Backend URL (e.g. http://localhost:8000/api/v1) | Yes |

---

## ✦ API Reference

### `POST /api/v1/scan`
Submits a URL for a new security scan.
```json
{
  "url": "https://wordpress.org"
}
```
**Response Example:**
```json
{
  "scan_id": "sc_550e8400-e29b-41d4-a716-446655440000",
  "url": "https://wordpress.org",
  "overall_score": 65,
  "data": { "checks": { ... } }
}
```

### `GET /api/v1/scan/{scan_id}`
Retrieves detailed results for a specific scan.

### `GET /api/v1/scan/{scan_id}/pdf`
Generates and returns a professional PDF report.
- **Returns:** `application/pdf`

### `GET /api/v1/history`
Returns the las 20 scans for the authenticated user.

---

## ✦ Security Checks

| Check | Method | Severity Impact |
| :--- | :--- | :--- |
| **SSL/TLS Analysis** | TCP/SSL handshake & cert parsing | High |
| **Security Headers** | HTTP response header verification | Medium |
| **WordPress Detection** | Homepage, feed, & readme fingerprinting | Medium |
| **Sensitive Files** | Probing `/wp-config.php`, `.env`, `.git` | Critical |
| **Blacklist Check** | Google Safe Browsing API lookup | Critical |

---

## ✦ Scoring System

LYNCE uses a weighted deduction system starting from **100 points**.

| Finding | Deduction |
| :--- | :--- |
| Expired / Invalid SSL | -10 points |
| Missing Security Header | -5 points (per header) |
| Exposed WP Version | -10 points |
| Sensitive File Found | -15 points (per file) |
| Blacklisted Site | -30 points |
| Known WP Vulnerability | -20 points |

**Grades:**
- **SECURE** (≥80): Site follows best practices.
- **AT RISK** (50-79): Site has significant gaps.
- **CRITICAL** (<50): Site is actively vulnerable or compromised.

---

## ✦ Roadmap

- [x] SSL/TLS Check
- [x] Security Headers Check
- [x] WordPress Detection
- [x] Sensitive Files Check
- [x] Google Safe Browsing Integration
- [x] PDF Report Generation
- [x] Supabase Integration
- [ ] WPScan Plugin CVE Detection
- [ ] SSL Labs API (full grade A+)
- [ ] User Authentication
- [ ] Stripe Billing (Free/Pro/Agency)
- [ ] Email Alerts
- [ ] White-label PDF reports
- [ ] Public API with rate limiting

---

## ✦ Contributing

LYNCE is an open-source project. We welcome contributions!

1. **Fork** the repository.
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`).
3. **Commit your changes** (`git commit -m 'Add amazing feature'`).
4. **Push to the branch** (`git push origin feature/amazing-feature`).
5. **Open a Pull Request**.

**Coding Standards:**
- **Python**: PEP 8 (formatted with Black).
- **TypeScript**: ESLint + Prettier.
- **Commits**: Follow [Conventional Commits](https://www.conventionalcommits.org/).

---

## ✦ License

MIT License — free to use, modify, and distribute for personal or commercial projects.

---

## ✦ Built by

LYNCE is built and maintained by **LevelOne Agency**.
If you need WordPress security consultation or custom auditing solutions, contact us at [hello@levelone.agency].
